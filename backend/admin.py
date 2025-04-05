from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from dependencies import get_admin_user
from models import User, Workout, Exercise, Set, UserProfile, Routine, SavedWorkoutProgram, AdminSettings
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


router = APIRouter(prefix="/admin", tags=["admin"])


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_admin: bool = False
    is_verified: bool = True  # Admin-created accounts are auto-verified


@router.post("/users", response_model=dict)
def create_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Create a new user (admin only)"""
    # Check if user with email already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username already exists
    existing_username = db.query(User).filter(
        User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new user
    hashed_password = pwd_context.hash(user_data.password)

    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        username=user_data.username,
        is_verified=user_data.is_verified,
        is_admin=user_data.is_admin,
        created_at=datetime.now(timezone.utc)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "is_admin": new_user.is_admin,
        "is_verified": new_user.is_verified,
        "created_at": new_user.created_at
    }


class UserStatsResponse(BaseModel):
    total_users: int
    active_users_last_month: int
    new_users_last_month: int


class ExerciseStatsResponse(BaseModel):
    popular_exercises: List[Dict[str, Any]]
    exercise_categories: List[Dict[str, Any]]


class WorkoutStatsResponse(BaseModel):
    total_workouts: int
    workouts_last_month: int
    avg_workout_duration: float


@router.get("/stats/users", response_model=Dict[str, Any])
def get_user_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
    time_range: str = "month"
):
    try:
        # Calculate date range
        now = datetime.now(timezone.utc)
        if time_range == "week":
            start_date = now - timedelta(days=7)
        elif time_range == "year":
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # Basic stats
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).join(Workout).filter(
            Workout.date >= start_date
        ).scalar()
        new_users = db.query(func.count(User.id)).filter(
            User.created_at >= start_date
        ).scalar()

        # Calculate growth rate
        previous_period_start = start_date - (now - start_date)
        previous_new_users = db.query(func.count(User.id)).filter(
            User.created_at >= previous_period_start,
            User.created_at < start_date
        ).scalar()
        new_users_growth = ((new_users - previous_new_users) / (previous_new_users or 1)) * 100

        # Get recent signups
        recent_signups = db.query(User).order_by(
            User.created_at.desc()
        ).limit(5).all()

        # Calculate average workouts per user
        total_workouts = db.query(func.count(Workout.id)).scalar()
        avg_workouts_per_user = total_workouts / (total_users or 1)

        # Most active day calculation
        try:
            most_active_day = db.query(
                func.strftime('%w', Workout.date).label('day_of_week'),  # SQLite format
                func.count(Workout.id).label('count')
            ).group_by('day_of_week').order_by(desc('count')).first()

            days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            most_active_day = days[int(most_active_day[0])] if most_active_day else "N/A"
        except Exception:
            # Fallback for PostgreSQL
            try:
                most_active_day = db.query(
                    func.extract('dow', Workout.date).label('day_of_week'),
                    func.count(Workout.id).label('count')
                ).group_by('day_of_week').order_by(desc('count')).first()

                days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                most_active_day = days[int(most_active_day[0])] if most_active_day else "N/A"
            except Exception:
                most_active_day = "N/A"

        # Calculate inactive users
        try:
            inactive_users = db.query(func.count(User.id)).filter(
                ~User.id.in_(
                    db.query(Workout.user_id).filter(Workout.date >= start_date)
                )
            ).scalar()
        except Exception:
            inactive_users = 0

        return {
            "total_users": total_users,
            "active_users_last_month": active_users,
            "new_users_last_month": new_users,
            "new_users_growth": round(new_users_growth, 1),
            "avg_workouts_per_user": round(avg_workouts_per_user, 1),
            "most_active_day": most_active_day,
            "inactive_users": inactive_users,
            "recent_signups": [
                {
                    "name": user.username,
                    "signup_date": user.created_at
                } for user in recent_signups
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/exercises", response_model=Dict[str, Any])
def get_exercise_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
    time_range: str = "month"
):
    try:
        now = datetime.now(timezone.utc)
        if time_range == "week":
            start_date = now - timedelta(days=7)
        elif time_range == "year":
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # Popular exercises
        popular_exercises = db.query(
            Exercise.name,
            func.count(Exercise.id).label('count')
        ).join(Workout).filter(
            Workout.date >= start_date
        ).group_by(Exercise.name).order_by(desc('count')).limit(10).all()

        # Exercise categories
        exercise_categories = db.query(
            Exercise.category,
            func.count(Exercise.id).label('count')
        ).join(Workout).filter(
            Workout.date >= start_date
        ).group_by(Exercise.category).order_by(desc('count')).all()

        # Average weight and reps
        avg_stats = db.query(
            func.avg(Set.weight).label('avg_weight'),
            func.avg(Set.reps).label('avg_reps')
        ).join(Exercise).join(Workout).filter(
            Workout.date >= start_date,
            Set.weight.isnot(None),
            Set.reps.isnot(None)
        ).first()

        # Most common rep range
        rep_ranges = db.query(
            Set.reps,
            func.count(Set.id).label('count')
        ).join(Exercise).join(Workout).filter(
            Workout.date >= start_date,
            Set.reps.isnot(None)
        ).group_by(Set.reps).order_by(desc('count')).first()

        return {
            "popular_exercises": [
                {"name": name, "count": count}
                for name, count in popular_exercises
            ],
            "exercise_categories": [
                {"name": cat or "Uncategorized", "count": count}
                for cat, count in exercise_categories
            ],
            "avg_weight": round(avg_stats[0] or 0, 1),
            "avg_reps_per_set": round(avg_stats[1] or 0, 1),
            "most_common_rep_range": str(rep_ranges[0]) if rep_ranges else "N/A"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/workouts", response_model=Dict[str, Any])
def get_workout_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
    time_range: str = "month"
):
    try:
        now = datetime.now(timezone.utc)
        if time_range == "week":
            start_date = now - timedelta(days=7)
        elif time_range == "year":
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # Basic stats
        total_workouts = db.query(func.count(Workout.id)).scalar()
        recent_workouts = db.query(func.count(Workout.id)).filter(
            Workout.date >= start_date
        ).scalar()

        # Calculate growth rate
        previous_period_start = start_date - (now - start_date)
        previous_workouts = db.query(func.count(Workout.id)).filter(
            Workout.date >= previous_period_start,
            Workout.date < start_date
        ).scalar()
        workout_growth = ((recent_workouts - previous_workouts) / (previous_workouts or 1)) * 100

        # Average duration calculation
        avg_duration = db.query(
            func.avg(
                func.extract('epoch', Workout.end_time) -
                func.extract('epoch', Workout.start_time)
            ) / 60
        ).filter(
            Workout.start_time.isnot(None),
            Workout.end_time.isnot(None)
        ).scalar() or 0

        # Calculate duration change
        previous_avg_duration = db.query(
            func.avg(
                func.extract('epoch', Workout.end_time) -
                func.extract('epoch', Workout.start_time)
            ) / 60
        ).filter(
            Workout.date >= previous_period_start,
            Workout.date < start_date,
            Workout.start_time.isnot(None),
            Workout.end_time.isnot(None)
        ).scalar() or 0
        duration_change = ((avg_duration - previous_avg_duration) / (previous_avg_duration or 1)) * 100

        # Popular workout types
        popular_types = db.query(
            Workout.name,
            func.count(Workout.id).label('count')
        ).group_by(Workout.name).order_by(desc('count')).limit(5).all()

        # Completion rate by day
        completion_by_day = {}
        for day in range(7):
            total = db.query(func.count(Workout.id)).filter(
                func.extract('dow', Workout.date) == day
            ).scalar()
            completed = db.query(func.count(Workout.id)).filter(
                func.extract('dow', Workout.date) == day,
                Workout.end_time.isnot(None)
            ).scalar()
            completion_by_day[day] = (completed / (total or 1)) * 100

        # Most popular time
        most_popular_hour = db.query(
            func.extract('hour', Workout.start_time).label('hour'),
            func.count(Workout.id).label('count')
        ).filter(
            Workout.start_time.isnot(None)
        ).group_by('hour').order_by(desc('count')).first()

        most_popular_time = f"{int(most_popular_hour[0]):02d}:00" if most_popular_hour else "N/A"

        return {
            "total_workouts": total_workouts,
            "workouts_last_month": recent_workouts,
            "workout_growth": round(workout_growth, 1),
            "avg_workout_duration": round(avg_duration, 1),
            "duration_change": round(duration_change, 1),
            "most_popular_time": most_popular_time,
            "popular_workout_types": [
                {"name": name, "count": count}
                for name, count in popular_types
            ],
            "completion_by_day": completion_by_day
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users", response_model=List[Dict[str, Any]])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    users = db.query(User).offset(skip).limit(limit).all()

    return [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "is_admin": user.is_admin,
        "is_verified": user.is_verified,
        "workout_count": len(user.workouts),
        "has_preferences": user.workout_preferences is not None
    } for user in users]


@router.post("/users/{user_id}/make-admin")
def make_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    # Verify the current user is an admin
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    db.commit()
    return {"message": f"User {user.username} is now an admin"}


@router.post("/users/{user_id}/remove-admin")
def remove_admin_privileges(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(
            status_code=400, detail="Cannot remove your own admin privileges")

    user.is_admin = False
    db.commit()
    return {"message": f"Admin privileges removed from {user.username}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} has been deleted"}


class AdminSettingsUpdate(BaseModel):
    auto_verify_users: bool = False
    require_email_verification: bool = True
    require_2fa_admins: bool = True
    session_timeout: int = Field(ge=15, le=1440, default=60)  # 15 minutes to 24 hours
    backup_frequency: str = Field(pattern="^(daily|weekly|monthly)$", default="daily")
    data_retention_months: int = Field(ge=0, le=120, default=24)  # 0 to 10 years
    notify_new_users: bool = True
    notify_system_alerts: bool = True


class AdminSettingsResponse(BaseModel):
    message: str
    settings: AdminSettingsUpdate


@router.get("/settings", response_model=AdminSettingsUpdate)
def get_admin_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get current admin settings"""
    settings = db.query(AdminSettings).first()
    if not settings:
        # Create default settings if none exist
        settings = AdminSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.post("/settings", response_model=AdminSettingsResponse)
def update_admin_settings(
    settings_update: AdminSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update admin settings"""
    try:
        # Get existing settings or create new ones
        existing_settings = db.query(AdminSettings).first()
        if not existing_settings:
            existing_settings = AdminSettings()
            db.add(existing_settings)

        # Update settings
        for field, value in settings_update.dict().items():
            setattr(existing_settings, field, value)
        
        # Set update metadata
        existing_settings.last_updated = datetime.now(timezone.utc)
        existing_settings.updated_by = admin.id

        db.commit()
        db.refresh(existing_settings)

        # Log the settings change
        print(f"Admin settings updated by {admin.username} at {existing_settings.last_updated}")

        return {
            "message": "Settings saved successfully",
            "settings": existing_settings
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update admin settings: {str(e)}"
        )


@router.post("/users/{user_id}/toggle-verification", response_model=dict)
def toggle_user_verification(
    user_id: int,
    verification_data: dict = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Toggle a user's verification status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update verification status
    user.is_verified = verification_data.get("is_verified", False)
    db.commit()
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_verified": user.is_verified,
        "message": f"User verification status updated to {user.is_verified}"
    }
