import uuid
import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Request
from background_task import send_summary_emails
from email_service import send_summary_email, send_security_alert
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from database import engine, Base, get_db
from auth import router as auth_router
from dependencies import get_current_user
from datetime import datetime, timezone
from models import Workout, User, Exercise, Set, UserPreferences, Routine, CustomExercise
from schemas import (
    WorkoutCreate,
    WorkoutResponse,
    ExerciseCreate,
    SetCreate,
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("⏳ Starting background task for email summaries...")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(send_summary_emails)
    yield

app = FastAPI(lifespan=lifespan)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n>>> Request received: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"<<< Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"!!! Error processing request: {str(e)}")
        raise

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)

@app.get("/test")
def test_endpoint():
    print("Test endpoint called")
    return {"message": "Test successful"}

@app.get("/protected-route")
def protected_route(user: User = Depends(get_current_user)):
    return {"email": user.email}

@app.post("/trigger-email-summary")
def trigger_email_summary(background_tasks: BackgroundTasks):
    """Manually trigger email summary for testing"""
    background_tasks.add_task(send_summary_emails)
    return {"message": "Email summary task started!"}

@app.get("/send-summary")
async def send_summaries(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    users = db.query(User).join(UserPreferences).filter(
        UserPreferences.email_notifications == True
    ).all()

    for user in users:
        frequency = user.preferences.summary_frequency
        if frequency:
            workout_count = db.query(Workout).filter(
                Workout.user_id == user.id
            ).count()

            background_tasks.add_task(
                send_summary_email, user.email, frequency, workout_count
            )

    return {"message": "Scheduled summary emails"}

@app.get("/workouts", response_model=list[WorkoutResponse])
def get_workouts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workouts = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.user_id == user.id)\
        .all()

    return workouts

@app.post("/workouts", response_model=WorkoutResponse)
def add_workout(workout: WorkoutCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkoutResponse:
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

    new_exercises = []
    new_sets = []

    if workout.exercises:
        for exercise_data in workout.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category,
                is_cardio=exercise_data.is_cardio, 
                workout_id=new_workout.id
            )
            new_exercises.append(new_exercise)

    db.add_all(new_exercises)
    db.commit()

    for exercise, exercise_data in zip(new_exercises, workout.exercises):
        for set_data in exercise_data.sets:
            new_set = Set(
                weight=set_data.weight,
                reps=set_data.reps,
                distance=set_data.distance,
                duration=set_data.duration,
                intensity=set_data.intensity,
                notes=set_data.notes,
                exercise_id=exercise.id
            )
            new_sets.append(new_set)

    db.add_all(new_sets)
    db.commit()

    workout_data = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.id == new_workout.id)\
        .first()

    if not workout_data:
        raise HTTPException(status_code=404, detail="Workout not found")

    return workout_data

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

    updated_prefs = preferences_data.model_dump(exclude_unset=True)
    
    if "email_notifications" in updated_prefs and not updated_prefs["email_notifications"]:
        updated_prefs["summary_frequency"] = None

    for key, value in updated_prefs.items():
        setattr(user_preferences, key, value)

    db.commit()
    db.refresh(user_preferences)

    return {
        "weight_unit": user_preferences.weight_unit,
        "goal_weight": user_preferences.goal_weight,
        "email_notifications": user_preferences.email_notifications,
        "summary_frequency": user_preferences.summary_frequency
    }

@app.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user.hashed_password = hash_password(request.new_password)
    db.commit()

    # Send security alert email
    background_tasks.add_task(send_security_alert, user.email)

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

@app.get("/workout-stats", response_model=WorkoutStatsResponse)
def get_workout_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_workouts = db.query(Workout).filter(Workout.user_id == user.id).count()

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

    total_cardio_duration = db.query(func.sum(func.coalesce(Set.duration, 0)))\
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
        favorite_exercise=favorite_exercise,
        last_workout=last_workout.date if last_workout else None,
        total_cardio_duration=round(total_cardio_duration, 2),
        weight_progression=weight_progression_data
    )

@app.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
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
    
    new_workout = Workout(
        name=f"{routine.name} Template",
        date=datetime.now(timezone.utc),
        user_id=user.id
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    
    new_routine.workout_id = new_workout.id
    db.commit()
    
    new_exercises = []
    if routine.exercises:
        for exercise_data in routine.exercises:
            
            custom_exercise = db.query(CustomExercise).filter(
                CustomExercise.name == exercise_data.name,
                CustomExercise.user_id == user.id
            ).first()
            
            if not custom_exercise:
                custom_exercise = CustomExercise(
                    name=exercise_data.name,
                    category=exercise_data.category or "Uncategorized",
                    user_id=user.id
                )
                db.add(custom_exercise)
                db.commit()
            
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio or False,
                workout_id=new_workout.id
            )
            new_exercises.append(new_exercise)
    
    db.add_all(new_exercises)
    db.commit()
    
    new_sets = []
    for i, (exercise, exercise_data) in enumerate(zip(new_exercises, routine.exercises)):
        initial_sets = exercise_data.initial_sets or 1
        for _ in range(initial_sets):
            new_set = Set(
                exercise_id=exercise.id
            )
            new_sets.append(new_set)
    
    db.add_all(new_sets)
    db.commit()
    
    routine_data = db.query(Routine)\
    .options(joinedload(Routine.workout).joinedload(Workout.exercises).joinedload(Exercise.sets))\
    .filter(Routine.id == new_routine.id)\
    .first()

    return routine_data

@app.put("/routines/{routine_id}", response_model=RoutineResponse)
def update_routine(
    routine_id: int,
    routine_data: RoutineCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == user.id
    ).first()
    
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    routine.name = routine_data.name
    
    if routine.workout_id:
        db.query(Exercise).filter(Exercise.workout_id == routine.workout_id).delete()
        
        for exercise_data in routine_data.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio or False,
                workout_id=routine.workout_id
            )
            db.add(new_exercise)
    
    db.commit()
    db.refresh(routine)
    
    return routine

@app.delete("/routines/{routine_id}")
def delete_routine(
    routine_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == user.id
    ).first()
    
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    db.delete(routine)
    db.commit()
    
    return {"message": "Routine deleted successfully"}

@app.get("/routines", response_model=list[RoutineResponse])
def get_routines(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    routines = db.query(Routine)\
        .options(
            joinedload(Routine.workout)
            .joinedload(Workout.exercises)
            .joinedload(Exercise.sets)
        )\
        .filter(Routine.user_id == user.id)\
        .all()
    return routines