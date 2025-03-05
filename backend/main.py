import os
import uuid
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from PIL import Image
from database import engine, Base, get_db
from auth import router as auth_router
from dependencies import get_current_user
from models import Workout, User, Exercise, Set, UserPreferences
from schemas import (
    WorkoutCreate,
    WorkoutResponse,
    ProfileUpdateRequest,
    UserPreferencesUpdate,
    WorkoutStatsResponse,
    ChangePasswordRequest
)
from security import hash_password, verify_password

Base.metadata.create_all(bind=engine)

UPLOAD_DIRECTORY = "uploads/profile_pictures"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)


@app.get("/protected-route")
def protected_route(user: dict = Depends(get_current_user)):
    return {"email": user.email}


@app.get("/workouts", response_model=list[WorkoutResponse])
def get_workouts(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    workouts = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.user_id == user.id)\
        .all()
    return workouts


@app.post("/workouts", response_model=WorkoutResponse)
def add_workout(workout: WorkoutCreate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    new_workout = Workout(
        name=workout.name,
        date=workout.date,
        start_time=workout.start_time,
        end_time=workout.end_time,
        bodyweight=workout.bodyweight,
        notes=workout.notes,
        user_id=user.id
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    if hasattr(workout, 'exercises') and workout.exercises:
        for exercise_data in workout.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=getattr(exercise_data, 'category', None),
                is_cardio=getattr(exercise_data, 'isCardio', False),
                workout_id=new_workout.id
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)

            if hasattr(exercise_data, 'sets') and exercise_data.sets:
                for set_data in exercise_data.sets:
                    new_set = Set(
                        weight=getattr(set_data, 'weight', None),
                        reps=getattr(set_data, 'reps', None),
                        distance=getattr(set_data, 'distance', None),
                        duration=getattr(set_data, 'duration', None),
                        intensity=getattr(set_data, 'intensity', None),
                        notes=getattr(set_data, 'notes', None),
                        exercise_id=new_exercise.id
                    )
                    db.add(new_set)
                db.commit()

    complete_workout = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.id == new_workout.id)\
        .first()

    return complete_workout


@app.get("/profile")
def profile(user: User = Depends(get_current_user)):
    return {
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture
    }


@app.put("/update-profile")
def update_profile(
    profile_data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.username:
        existing_username = db.query(User).filter(
            User.username == profile_data.username,
            User.id != user.id
        ).first()
        if existing_username:
            raise HTTPException(
                status_code=400, detail="Username already exists")

    user.username = profile_data.username
    db.commit()
    db.refresh(user)

    return {"username": user.username, "email": user.email}


@app.patch("/update-preferences")
def update_preferences(
    preferences_data: UserPreferencesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_preferences = db.query(
        UserPreferences).filter_by(user_id=user.id).first()

    if not user_preferences:
        user_preferences = UserPreferences(user_id=user.id)
        db.add(user_preferences)

    for key, value in preferences_data.dict(exclude_unset=True).items():
        setattr(user_preferences, key, value)

    db.commit()
    db.refresh(user_preferences)

    return {
        "weight_unit": user_preferences.weight_unit,
        "goal_weight": user_preferences.goal_weight,
        "email_notifications": user_preferences.email_notifications
    }


@app.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_data = db.query(User).filter(User.id == user.id).first()

    if not user_data or not verify_password(request.old_password, user_data.password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user_data.password = hash_password(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@app.delete("/delete-account")
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db.query(Set).filter(Set.exercise.has(workout=Workout(
            user_id=user.id))).delete(synchronize_session=False)
        db.query(Exercise).filter(Exercise.workout.has(
            user_id=user.id)).delete(synchronize_session=False)
        db.query(Workout).filter(Workout.user_id ==
                                 user.id).delete(synchronize_session=False)

        if user.profile_picture:
            file_path = os.path.join(".", user.profile_picture.lstrip("/"))
            if os.path.exists(file_path):
                os.remove(file_path)

        db.delete(user)
        db.commit()

        return {"message": "Account deleted successfully"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting account")


@app.get("/workout-stats")
def get_workout_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_workouts = db.query(Workout).filter(
        Workout.user_id == user.id).count()

    total_volume_query = db.query(func.sum(Set.weight * Set.reps))\
        .join(Exercise)\
        .join(Workout)\
        .filter(Workout.user_id == user.id, Exercise.is_cardio == False)\
        .scalar() or 0

    favorite_exercise_query = db.query(Exercise.name, func.count(Exercise.id))\
        .join(Workout)\
        .filter(Workout.user_id == user.id)\
        .group_by(Exercise.name)\
        .order_by(func.count(Exercise.id).desc())\
        .first()

    favorite_exercise = favorite_exercise_query[0] if favorite_exercise_query else None

    last_workout = db.query(Workout)\
        .filter(Workout.user_id == user.id)\
        .order_by(desc(Workout.date))\
        .first()

    return WorkoutStatsResponse(
        total_workouts=total_workouts,
        total_volume=round(total_volume_query, 2),
        favorite_exercise=favorite_exercise,
        last_workout=last_workout.date if last_workout else None
    )
