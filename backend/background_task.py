import asyncio
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

        # Create an event loop for async operations
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        for user in users:
            preferences = db.query(UserPreferences).filter_by(
                user_id=user.id).first()
            if not preferences or not preferences.summary_frequency:
                continue

            # Skip users who haven't verified their email
            if not user.is_verified:
                logger.info(
                    f"Skipping summary for unverified user: {user.email}")
                continue

            today = datetime.now(timezone.utc)
            start_date = today - \
                timedelta(
                    days=7) if preferences.summary_frequency == "weekly" else today - timedelta(days=30)
            summary_period = "Week" if preferences.summary_frequency == "weekly" else "Month"

            workouts = db.query(Workout).filter(
                Workout.user_id == user.id, Workout.date >= start_date).all()
            workout_count = len(workouts)

            if workout_count > 0:
                email_body = f"""
                <html>
                  <body>
                    <h1>Your {summary_period}ly Workout Summary</h1>
                    <p>Good job this {summary_period}! You have completed <strong>{workout_count}</strong> workouts.</p>
                    <p>Keep it up! 💪</p>
                  </body>
                </html>
                """
                # Run async email function in the event loop
                loop.run_until_complete(
                    send_summary_email(
                        user.email, f"{summary_period}ly Workout Summary", email_body)
                )
                logger.info(f"Summary email sent to {user.email}")

        # Close the event loop
        loop.close()

    except Exception as e:
        logger.error(f"Error sending summary emails: {e}")
    finally:
        db.close()

    logger.info("Summary emails task completed")
