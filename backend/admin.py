from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from dependencies import get_admin_user
from models import User, Workout, Exercise, Set, UserPreferences, Routine, SavedWorkoutProgram
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])


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


@router.get("/stats/users", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    # This ensures only admins can access
    admin: User = Depends(get_admin_user)
):
    # Use the admin parameter to confirm access or log admin details if needed
    total_users = db.query(func.count(User.id)).scalar()

    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)

    active_users = db.query(func.count(User.id)).join(Workout).filter(
        Workout.date >= one_month_ago
    ).scalar()

    new_users = db.query(func.count(User.id)).filter(
        User.created_at >= one_month_ago
    ).scalar()

    return {
        "total_users": total_users,
        "active_users_last_month": active_users,
        "new_users_last_month": new_users
    }


@router.get("/stats/exercises", response_model=ExerciseStatsResponse)
def get_exercise_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    popular_exercises = db.query(
        Exercise.name,
        func.count(Exercise.id).label("count")
    ).group_by(Exercise.name).order_by(desc("count")).limit(10).all()

    exercise_categories = db.query(
        Exercise.category,
        func.count(Exercise.id).label("count")
    ).group_by(Exercise.category).order_by(desc("count")).all()

    return {
        "popular_exercises": [{"name": ex[0], "count": ex[1]} for ex in popular_exercises],
        "exercise_categories": [{"category": cat[0] or "Uncategorized", "count": cat[1]} for cat in exercise_categories]
    }


@router.get("/stats/workouts", response_model=WorkoutStatsResponse)
def get_workout_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    total_workouts = db.query(func.count(Workout.id)).scalar()

    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_workouts = db.query(func.count(Workout.id)).filter(
        Workout.date >= one_month_ago
    ).scalar()

    # Calculate average duration in minutes
    duration_query = db.query(
        func.avg(
            func.extract('epoch', Workout.end_time) -
            func.extract('epoch', Workout.start_time)
        ) / 60
    ).filter(
        Workout.start_time.isnot(None),
        Workout.end_time.isnot(None)
    ).scalar() or 0

    return {
        "total_workouts": total_workouts,
        "workouts_last_month": recent_workouts,
        "avg_workout_duration": round(duration_query, 1)
    }


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
        "workout_count": len(user.workouts),
        "has_preferences": user.preferences is not None
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
