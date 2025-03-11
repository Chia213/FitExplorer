import logging
from database import SessionLocal
from models import User, Workout, UserPreferences
from email_service import send_summary_email
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

def send_summary_emails():
    logger.info("Starting email summary task...")
    db = SessionLocal()

    try:
        users = db.query(User).join(UserPreferences).filter(
            UserPreferences.email_notifications == True
        ).all()

        for user in users:
            preferences = db.query(UserPreferences).filter_by(user_id=user.id).first()
            if not preferences or not preferences.summary_frequency:
                continue

            today = datetime.now(timezone.utc)
            start_date = today - timedelta(days=7) if preferences.summary_frequency == "weekly" else today - timedelta(days=30)
            summary_period = "Week" if preferences.summary_frequency == "weekly" else "Month"

            workouts = db.query(Workout).filter(Workout.user_id == user.id, Workout.date >= start_date).all()
            workout_count = len(workouts)

            if workout_count > 0:
                email_body = f"Good job this {summary_period}! You have completed {workout_count} workouts. Keep it up! 💪"
                send_summary_email(user.email, f"{summary_period}ly Workout Summary", email_body)
                logger.info(f"Summary email sent to {user.email}")

    except Exception as e:
        logger.error(f"Error sending summary emails: {e}")
    finally:
        db.close()

    logger.info("Summary emails task completed")