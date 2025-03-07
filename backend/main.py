import uuid
import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from database import engine, Base, get_db
from auth import router as auth_router
from dependencies import get_current_user
from models import Workout, User, Exercise, Set, UserPreferences, Routine, CustomExercise
from schemas import (
    WorkoutCreate,
    WorkoutResponse,
    ProfileUpdateRequest,
    UserPreferencesUpdate,
    WorkoutStatsResponse,
    ChangePasswordRequest,
    RoutineCreate,
    RoutineResponse
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

    
    if workout.exercises:
        for exercise_data in workout.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category,
                is_cardio=exercise_data.isCardio,
                workout_id=new_workout.id
            )
            db.add(new_exercise)

            for set_data in exercise_data.sets:
                new_set = Set(
                    weight=set_data.weight,
                    reps=set_data.reps,
                    distance=set_data.distance,
                    duration=set_data.duration,
                    intensity=set_data.intensity,
                    notes=set_data.notes,
                    exercise_id=new_exercise.id
                )
                db.add(new_set)
        db.commit()

    return db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.id == new_workout.id)\
        .first()


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
        db.commit()

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

    if not user_data or not verify_password(request.old_password, user_data.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user_data.hashed_password = hash_password(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@app.delete("/delete-account")
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_data = db.query(User).filter(User.id == user.id).first()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        db.query(Set).filter(Set.exercise_id.in_(
            db.query(Exercise.id).filter(Exercise.workout_id.in_(
                db.query(Workout.id).filter(Workout.user_id == user.id)
            ))
        )).delete(synchronize_session=False)

        db.query(Exercise).filter(Exercise.workout_id.in_(
            db.query(Workout.id).filter(Workout.user_id == user.id)
        )).delete(synchronize_session=False)

        db.query(Workout).filter(Workout.user_id ==
                                 user.id).delete(synchronize_session=False)
        db.query(UserPreferences).filter(UserPreferences.user_id ==
                                         user.id).delete(synchronize_session=False)

        if user.profile_picture:
            try:
                file_path = os.path.join(".", user.profile_picture.lstrip("/"))
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Failed to delete profile picture: {str(e)}")

        db.delete(user)
        db.commit()

        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting account: {str(e)}")


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

    total_cardio_duration = db.query(func.sum(Set.duration))\
        .join(Exercise)\
        .join(Workout)\
        .filter(Workout.user_id == user.id, Exercise.is_cardio == True)\
        .scalar() or 0

    weight_progression = db.query(Workout.date, Workout.bodyweight)\
        .filter(Workout.user_id == user.id, Workout.bodyweight.isnot(None))\
        .order_by(desc(Workout.date))\
        .limit(5)\
        .all()

    weight_progression_data = [
        {
            "date": workout.date,
            "bodyweight": workout.bodyweight
        } for workout in weight_progression
    ]

    return WorkoutStatsResponse(
        total_workouts=total_workouts,
        total_volume=round(total_volume_query, 2),
        favorite_exercise=favorite_exercise,
        last_workout=last_workout.date if last_workout else None,
        total_cardio_duration=round(total_cardio_duration, 2),
        weight_progression=weight_progression_data
    )


@app.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),  #
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_extension = file.filename.split(".")[-1]
    if file_extension.lower() not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    user.profile_picture = file_path
    db.commit()

    return {"message": "Profile picture uploaded", "file_path": file_path}


@app.delete("/remove-profile-picture")
def remove_profile_picture(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user.profile_picture:
        raise HTTPException(
            status_code=400, detail="No profile picture to remove")

    try:
        file_path = os.path.join(".", user.profile_picture.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)

        user.profile_picture = None
        db.commit()

        return {"message": "Profile picture removed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error removing profile picture: {str(e)}")


@app.post("/routines", response_model=RoutineResponse)
def create_routine(
    routine: RoutineCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_routine = Routine(
        name=routine.name,
        user_id=user.id
    )
    db.add(new_routine)
    db.commit()
    db.refresh(new_routine)

    if routine.exercises:
        for exercise_data in routine.exercises:
            new_exercise = CustomExercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                user_id=user.id
            )
            db.add(new_exercise)

        db.commit()

    return new_routine
