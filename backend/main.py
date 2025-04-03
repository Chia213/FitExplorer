from security import hash_password, verify_password, generate_verification_token
from config import settings
from itertools import groupby
from security import create_access_token
from schemas import (
    WorkoutCreate,
    WorkoutResponse,
    ProfileUpdateRequest,
    UserPreferencesUpdate,
    WorkoutStatsResponse,
    ChangePasswordRequest,
    RoutineCreate,
    RoutineResponse,
    SavedWorkoutProgramCreate,
    SavedWorkoutProgramResponse,
    RoutineFolderCreate,
    RoutineFolderResponse
)
from models import Workout, User, Exercise, Set, UserPreferences, Routine, CustomExercise, SavedWorkoutProgram, RoutineFolder
from typing import List, Dict, Any
from admin import router as admin_router
from dependencies import get_current_user
from auth import router as auth_router
from datetime import datetime, timezone, timedelta
from database import engine, Base, get_db
from sqlalchemy import func, desc, extract
from sqlalchemy.orm import Session, joinedload
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import os
import secrets
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from background_task import send_summary_emails
from email_service import (send_summary_email, send_security_alert, send_verification_email, send_password_reset_email,
                           send_password_changed_email, send_account_deletion_email, notify_admin_new_registration)


Base.metadata.create_all(bind=engine)

UPLOAD_DIRECTORY = "uploads/profile_pictures"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

app = FastAPI()


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response


@app.on_event("startup")
async def startup_event():
    print("Starting background task for email summaries")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(send_summary_emails)


@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(admin_router)


@app.get("/protected-route")
def protected_route(user: User = Depends(get_current_user)):
    return {"email": user.email}


@app.post("/trigger-email-summary")
def trigger_email_summary(background_tasks: BackgroundTasks):
    background_tasks.add_task(send_summary_emails)
    return {"message": "Email summary task started!"}


@app.get("/send-summary")
async def send_summaries(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    users = db.query(User).join(UserPreferences).filter(
        UserPreferences.email_notifications == True
    ).all()

    for user in users:
        frequency = UserPreferences.summary_frequency if user.preferences else None
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
        .filter(Workout.user_id == user.id, Workout.is_template == False)\
        .all()

    return workouts


@app.post("/workouts", response_model=WorkoutResponse)
def add_workout(
    workout: WorkoutCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_workout = Workout(
        name=workout.name,
        date=workout.date,
        start_time=workout.start_time,
        end_time=workout.end_time,
        bodyweight=workout.bodyweight,  # Capture bodyweight
        weight_unit=workout.weight_unit,
        notes=workout.notes,
        user_id=user.id
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    # Process max lifts if provided
    if workout.max_lifts:
        for exercise_name, max_weight in workout.max_lifts.items():
            # Find or create the exercise
            exercise = db.query(Exercise).filter(
                Exercise.workout_id == new_workout.id,
                Exercise.name == exercise_name
            ).first()

            if not exercise:
                exercise = Exercise(
                    name=exercise_name,
                    workout_id=new_workout.id,
                    category=_determine_exercise_category(exercise_name)
                )
                db.add(exercise)
                db.commit()
                db.refresh(exercise)

            # Add a set representing the max lift
            max_lift_set = Set(
                weight=max_weight,
                exercise_id=exercise.id,
                notes="Max lift tracking"
            )
            db.add(max_lift_set)

    # Process cardio summary
    if workout.cardio_summary:
        cardio_exercise = Exercise(
            name="Cardio",
            is_cardio=True,
            workout_id=new_workout.id
        )
        db.add(cardio_exercise)
        db.commit()
        db.refresh(cardio_exercise)

        cardio_set = Set(
            distance=workout.cardio_summary.get('distance'),
            duration=workout.cardio_summary.get('duration'),
            intensity=workout.cardio_summary.get('intensity', ''),
            exercise_id=cardio_exercise.id
        )
        db.add(cardio_set)

    db.commit()
    db.refresh(new_workout)

    return db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.id == new_workout.id)\
        .first()


def _determine_exercise_category(exercise_name):
    # Helper function to categorize exercises
    strength_categories = {
        'Bench Press': 'Upper Body',
        'Squat': 'Lower Body',
        'Deadlift': 'Full Body',
        'Overhead Press': 'Upper Body',
        'Row': 'Upper Body'
    }
    return strength_categories.get(exercise_name, 'Other')


@app.delete("/workouts/{workout_id}")
def delete_workout(
    workout_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # First check if the workout exists and belongs to the user
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == user.id
    ).first()

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found or you don't have permission to delete it"
        )

    try:
        # Delete all related sets first
        db.query(Set).filter(
            Set.exercise_id.in_(
                db.query(Exercise.id).filter(Exercise.workout_id == workout_id)
            )
        ).delete(synchronize_session=False)

        # Delete all related exercises
        db.query(Exercise).filter(
            Exercise.workout_id == workout_id
        ).delete(synchronize_session=False)

        # Finally delete the workout
        db.query(Workout).filter(Workout.id == workout_id).delete()

        db.commit()
        return {"message": "Workout deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting workout: {str(e)}"
        )


@app.get("/profile")
def profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_preferences = db.query(
        UserPreferences).filter_by(user_id=user.id).first()

    return {
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture,
        "created_at": user.created_at,
        "preferences": {
            "goal_weight": user_preferences.goal_weight if user_preferences else None,
            "email_notifications": user_preferences.email_notifications if user_preferences else False,
            "summary_frequency": user_preferences.summary_frequency if user_preferences else None,
            "card_color": user_preferences.card_color if user_preferences else "#dbeafe"
        }
    }


@app.put("/update-profile")
def update_profile(
    profile_data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.username:
        # Check if the new username already exists for another user
        existing_username = db.query(User).filter(
            User.username == profile_data.username,
            User.id != user.id
        ).first()

        if existing_username:
            raise HTTPException(
                status_code=400, detail="Username already exists")

    # Update the username
    user.username = profile_data.username
    db.commit()
    db.refresh(user)

    # Generate a new access token with the updated username
    access_token = create_access_token(
        {"sub": user.username},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "username": user.username,
        "email": user.email,
        "access_token": access_token  # Return new token to client
    }


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
        "goal_weight": user_preferences.goal_weight,
        "email_notifications": user_preferences.email_notifications,
        "summary_frequency": user_preferences.summary_frequency,
        "card_color": user_preferences.card_color
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
    total_workouts = db.query(Workout).filter(
        Workout.user_id == user.id).count()

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
            "date": Workout.date,
            "bodyweight": Workout.bodyweight
        } for Workout in weight_progression
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


# In main.py, modify the create_routine function to save set information:

@app.post("/routines", response_model=RoutineResponse)
def create_routine(
    routine: RoutineCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if routine with this name already exists for this user
        existing_routine = db.query(Routine).filter(
            Routine.user_id == user.id,
            func.lower(Routine.name) == func.lower(routine.name)
        ).first()

        if existing_routine:
            return JSONResponse(
                status_code=409,
                content={"detail": "Routine with this name already exists",
                         "routine_id": existing_routine.id}
            )

        new_workout = Workout(
            name=routine.name,
            user_id=user.id,
            date=datetime.now(timezone.utc),
            weight_unit=routine.weight_unit if hasattr(
                routine, 'weight_unit') else "kg",
            is_template=True
        )
        db.add(new_workout)
        db.commit()
        db.refresh(new_workout)

        new_routine = Routine(
            name=routine.name,
            user_id=user.id,
            workout_id=new_workout.id,
            weight_unit=routine.weight_unit if hasattr(
                routine, 'weight_unit') else "kg"
        )
        db.add(new_routine)

        for exercise_data in routine.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio,
                workout_id=new_workout.id
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)

            # Add sets if they exist in the request
            if hasattr(exercise_data, 'sets') and exercise_data.sets:
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
            # If no sets provided, create empty sets based on initial_sets count
            else:
                initial_sets = exercise_data.initial_sets or 1
                for _ in range(initial_sets):
                    if exercise_data.is_cardio:
                        new_set = Set(
                            distance=None,
                            duration=None,
                            intensity="",
                            notes="",
                            exercise_id=new_exercise.id
                        )
                    else:
                        new_set = Set(
                            weight=None,
                            reps=None,
                            notes="",
                            exercise_id=new_exercise.id
                        )
                    db.add(new_set)

            # Add custom exercise to user's custom exercises
            new_custom_exercise = CustomExercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                user_id=user.id
            )
            db.add(new_custom_exercise)

        db.commit()
        db.refresh(new_routine)

        return new_routine

    except Exception as e:
        db.rollback()
        print(f"Error creating routine: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# In main.py, update the update_routine function to handle sets properly:


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
        # Delete existing sets first
        db.query(Set).filter(
            Set.exercise_id.in_(
                db.query(Exercise.id).filter(
                    Exercise.workout_id == routine.workout_id)
            )
        ).delete(synchronize_session=False)

        # Then delete exercises
        db.query(Exercise).filter(
            Exercise.workout_id == routine.workout_id
        ).delete(synchronize_session=False)

        # Create new exercises with sets
        for exercise_data in routine_data.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio or False,
                workout_id=routine.workout_id
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)

            # Add sets if they exist in the request
            if hasattr(exercise_data, 'sets') and exercise_data.sets:
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
            # If no sets provided, create empty sets based on initial_sets count
            else:
                initial_sets = exercise_data.initial_sets or 1
                for _ in range(initial_sets):
                    if exercise_data.is_cardio:
                        new_set = Set(
                            distance=None,
                            duration=None,
                            intensity="",
                            notes="",
                            exercise_id=new_exercise.id
                        )
                    else:
                        new_set = Set(
                            weight=None,
                            reps=None,
                            notes="",
                            exercise_id=new_exercise.id
                        )
                    db.add(new_set)

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
    try:
        routines = db.query(Routine)\
            .options(
                joinedload(Routine.workout)
                .joinedload(Workout.exercises)
                .joinedload(Exercise.sets)
        )\
            .filter(Routine.user_id == user.id)\
            .all()

        # Transform routines to include folder_name
        return [
            {
                "id": routine.id,
                "name": routine.name,
                "workout_id": routine.workout_id,
                "folder_id": routine.folder_id,
                "folder_name": routine.folder.name if routine.folder else None,
                "workout": routine.workout
            }
            for routine in routines
        ]
    except Exception as e:
        print(f"Error fetching routines: {e}")
        raise HTTPException(status_code=500, detail="Error fetching routines")


@app.post("/saved-programs", response_model=SavedWorkoutProgramResponse)
def create_saved_program(
    program: SavedWorkoutProgramCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        new_saved_program = SavedWorkoutProgram(
            user_id=user.id,
            program_data=program.program_data,  # Store as JSON, not as a string
            current_week=program.current_week or 1,
            completed_weeks=program.completed_weeks if program.completed_weeks else []
        )
        db.add(new_saved_program)
        db.commit()
        db.refresh(new_saved_program)

        return new_saved_program
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Change the return type
@app.get("/saved-programs", response_model=List[Dict[str, Any]])
def get_saved_programs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        saved_programs = db.query(SavedWorkoutProgram)\
            .filter(SavedWorkoutProgram.user_id == user.id)\
            .order_by(SavedWorkoutProgram.created_at.desc())\
            .all()

        # Convert to dicts and ensure all data is serializable
        result = []
        for program in saved_programs:
            program_dict = {
                "id": program.id,
                "user_id": program.user_id,
                "program_data": program.program_data,
                "created_at": program.created_at.isoformat(),
                "current_week": program.current_week,
                "completed_weeks": program.completed_weeks if isinstance(program.completed_weeks, list) else []
            }
            result.append(program_dict)

        return result
    except Exception as e:
        print(f"Error in get_saved_programs: {str(e)}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/saved-programs/{program_id}", response_model=SavedWorkoutProgramResponse)
def update_saved_program(
    program_id: int,
    program_data: SavedWorkoutProgramCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        saved_program = db.query(SavedWorkoutProgram)\
            .filter(SavedWorkoutProgram.id == program_id, SavedWorkoutProgram.user_id == user.id)\
            .first()

        if not saved_program:
            raise HTTPException(
                status_code=404, detail="Saved program not found")

        saved_program.program_data = program_data.program_data  # Store as JSON
        saved_program.current_week = program_data.current_week
        saved_program.completed_weeks = program_data.completed_weeks if program_data.completed_weeks else []

        db.commit()
        db.refresh(saved_program)
        return saved_program
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/saved-programs/{program_id}")
def delete_saved_program(
    program_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        saved_program = db.query(SavedWorkoutProgram)\
            .filter(SavedWorkoutProgram.id == program_id, SavedWorkoutProgram.user_id == user.id)\
            .first()

        if not saved_program:
            raise HTTPException(
                status_code=404, detail="Saved program not found")

        db.delete(saved_program)
        db.commit()

        return {"message": "Saved program deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/saved-programs/clear")
def clear_saved_programs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db.query(SavedWorkoutProgram).filter(
            SavedWorkoutProgram.user_id == user.id
        ).delete(synchronize_session=False)
        db.commit()
        return {"message": "All saved programs cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# In main.py
@app.post("/routines/check-name")
def check_routine_name(
    data: dict = Body(..., example={"name": "My Routine"}),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        name = data.get("name", "")
        if not name:
            raise HTTPException(
                status_code=400, detail="Routine name is required")

        existing_routine = db.query(Routine).filter(
            Routine.user_id == user.id,
            func.lower(Routine.name) == func.lower(name)
        ).first()

        return {
            "exists": existing_routine is not None,
            "id": existing_routine.id if existing_routine else None,
            "name": existing_routine.name if existing_routine else name
        }
    except Exception as e:
        print(f"Error checking routine name: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error checking routine name: {str(e)}")


@app.post("/routine-folders", response_model=RoutineFolderResponse)
def create_routine_folder(
    folder: RoutineFolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_folder = RoutineFolder(
        name=folder.name,
        user_id=user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder


@app.get("/routine-folders", response_model=List[RoutineFolderResponse])
def get_routine_folders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folders = db.query(RoutineFolder).filter(
        RoutineFolder.user_id == user.id
    ).order_by(RoutineFolder.name).all()
    return folders


@app.put("/routine-folders/{folder_id}", response_model=RoutineFolderResponse)
def update_routine_folder(
    folder_id: int,
    folder_data: RoutineFolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(RoutineFolder).filter(
        RoutineFolder.id == folder_id,
        RoutineFolder.user_id == user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    folder.name = folder_data.name
    db.commit()
    db.refresh(folder)
    return folder


@app.delete("/routine-folders/{folder_id}")
def delete_routine_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(RoutineFolder).filter(
        RoutineFolder.id == folder_id,
        RoutineFolder.user_id == user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Remove folder_id from associated routines
    db.query(Routine).filter(
        Routine.folder_id == folder_id,
        Routine.user_id == user.id
    ).update({"folder_id": None})

    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted successfully"}

# Add endpoint to move routine to a folder


@app.put("/routines/{routine_id}/move-to-folder", response_model=RoutineResponse)
def move_routine_to_folder(
    routine_id: int,
    request: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder_id = request.get("folder_id")

    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == user.id
    ).first()

    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")

    # Ensure folder_id is properly typed
    if folder_id is not None:
        try:
            # Convert to integer if it came in as string
            folder_id = int(folder_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400, detail="Invalid folder_id format")

        # Verify folder exists
        folder = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id,
            RoutineFolder.user_id == user.id
        ).first()

        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")

    routine.folder_id = folder_id
    db.commit()
    db.refresh(routine)

    # Prepare response
    if folder_id is not None:
        folder_name = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id).first().name
    else:
        folder_name = "Unassigned"

    return {
        "id": routine.id,
        "name": routine.name,
        "workout_id": routine.workout_id,
        "folder_id": routine.folder_id,
        "folder_name": folder_name,
        "workout": routine.workout
    }


class TokenVerificationRequest(BaseModel):
    token: str


@app.post("/auth/verify-email")
async def verify_email(token_data: TokenVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.verification_token == token_data.token,
        User.verification_token_expires_at > datetime.now(timezone.utc)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()

    return {"message": "Email verified successfully"}


class ResendVerificationRequest(BaseModel):
    email: str


@app.post("/auth/resend-verification")
async def resend_verification(
    request: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        # Return success to prevent email enumeration
        return {"message": "Verification email sent if account exists"}

    if user.is_verified:
        return {"message": "Account already verified"}

    # Generate new token
    token = generate_verification_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=24)

    user.verification_token = token
    user.verification_token_expires_at = expires
    db.commit()

    # Send verification email
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    background_tasks.add_task(
        send_verification_email,
        user.email,
        verification_url
    )

    return {"message": "Verification email sent"}


class ForgotPasswordRequest(BaseModel):
    email: str


@app.post("/auth/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send password reset link to user's email"""
    user = db.query(User).filter(User.email == request.email).first()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If an account with this email exists, a password reset link has been sent."}

    # Generate reset token
    reset_token = generate_verification_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    user.reset_token = reset_token
    user.reset_token_expires_at = expires
    db.commit()

    # Send password reset email
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    background_tasks.add_task(
        send_password_reset_email,
        user.email,
        reset_url
    )

    return {"message": "If an account with this email exists, a password reset link has been sent."}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@app.post("/auth/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Reset password using token"""
    user = db.query(User).filter(
        User.reset_token == request.token,
        User.reset_token_expires_at > datetime.now(timezone.utc)
    ).first()

    if not user:
        raise HTTPException(
            status_code=400, detail="Invalid or expired reset token")

    # Update password
    user.hashed_password = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    # Send confirmation email
    background_tasks.add_task(
        send_password_changed_email,
        user.email
    )

    return {"message": "Password has been reset successfully"}


@app.post("/request-account-deletion")
async def request_account_deletion(
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send account deletion confirmation email"""
    token = generate_verification_token()
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    user.deletion_token = token
    user.deletion_token_expires_at = expires
    db.commit()

    # Send confirmation email
    deletion_url = f"{settings.FRONTEND_URL}/confirm-deletion?token={token}"
    background_tasks.add_task(
        send_account_deletion_email,
        user.email,
        deletion_url
    )

    return {"message": "Account deletion request received. Please check your email to confirm."}


class ConfirmAccountDeletionRequest(BaseModel):
    token: str


@app.post("/confirm-account-deletion")
async def confirm_account_deletion(
    request: ConfirmAccountDeletionRequest,
    db: Session = Depends(get_db)
):
    """Confirm and execute account deletion"""
    user = db.query(User).filter(
        User.deletion_token == request.token,
        User.deletion_token_expires_at > datetime.now(timezone.utc)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    try:
        # Delete user data - reusing existing deletion logic
        user_data = db.query(User).filter(User.id == user.id).first()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # Rest of your deletion logic...

        db.delete(user)
        db.commit()

        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting account: {str(e)}")


@app.get("/check-admin")
def check_admin_status(user: User = Depends(get_current_user)):
    return {
        "username": user.username,
        "is_admin": user.is_admin
    }


@app.get("/progress/strength")
def get_strength_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Debug: Print user ID to verify authentication
        print(f"Fetching strength progress for user ID: {user.id}")

        # Fetch workouts with strength exercises for this user
        workouts = db.query(Workout)\
            .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
            .filter(Workout.user_id == user.id)\
            .all()

        # Process strength data manually
        processed_data = []
        strength_exercises = ['Bench Press', 'Squat', 'Deadlift']

        for workout in workouts:
            for exercise in workout.exercises:
                if exercise.name in strength_exercises:
                    # Find max weight for this exercise in this workout
                    max_weight = max(
                        (set.weight for set in exercise.sets if set.weight is not None),
                        default=0
                    )

                    if max_weight > 0:
                        processed_data.append({
                            'date': workout.date.isoformat(),
                            'exercise': exercise.name,
                            'weight': max_weight
                        })

        # Debug: Print processed data
        print(f"Strength progress data: {processed_data}")

        return processed_data

    except Exception as e:
        print(f"Error in strength progress: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching strength progress: {str(e)}")


@app.get("/progress/cardio")
def get_cardio_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Debug: Print user ID
        print(f"Fetching cardio progress for user ID: {user.id}")

        # Fetch workouts with cardio exercises
        workouts = db.query(Workout)\
            .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
            .filter(Workout.user_id == user.id, Exercise.is_cardio == True)\
            .all()

        processed_data = []
        for workout in workouts:
            total_distance = sum(
                set.distance for exercise in workout.exercises
                for set in exercise.sets if set.distance is not None
            )
            total_duration = sum(
                set.duration for exercise in workout.exercises
                for set in exercise.sets if set.duration is not None
            )

            # Calculate pace safely
            running_pace = (total_duration /
                            total_distance) if total_distance > 0 else None

            processed_data.append({
                'date': workout.date.isoformat(),
                'runningDistance': round(total_distance, 2),
                'runningPace': round(running_pace, 2) if running_pace is not None else None
            })

        # Debug: Print processed data
        print(f"Cardio progress data: {processed_data}")

        return processed_data

    except Exception as e:
        print(f"Error in cardio progress: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching cardio progress: {str(e)}")


@app.get("/progress/workout-frequency")
def get_workout_frequency(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Debug: Print user ID
        print(f"Fetching workout frequency for user ID: {user.id}")

        # Count workouts per month
        monthly_workouts = db.query(
            func.to_char(Workout.date, 'Mon'),
            func.count(Workout.id)
        )\
            .filter(Workout.user_id == user.id)\
            .group_by(func.to_char(Workout.date, 'Mon'))\
            .order_by(func.to_char(Workout.date, 'Mon'))\
            .all()

        processed_data = [
            {
                'month': month,
                'workouts': count
            } for month, count in monthly_workouts
        ]

        # Debug: Print processed data
        print(f"Workout frequency data: {processed_data}")

        return processed_data

    except Exception as e:
        print(f"Error in workout frequency: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching workout frequency: {str(e)}")


@app.get("/progress/body-composition")
def get_body_composition_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Debug print
        print(f"Fetching body composition for user ID: {user.id}")

        body_weight_data = db.query(Workout.date, Workout.bodyweight)\
            .filter(
                Workout.user_id == user.id,
                Workout.bodyweight.isnot(None)
        )\
            .order_by(Workout.date)\
            .all()

        # Debug print
        print(f"Found {len(body_weight_data)} body weight entries")

        return [
            {
                'date': date.isoformat(),
                'bodyweight': float(bodyweight)  # Ensure it's a float
            } for date, bodyweight in body_weight_data
        ]
    except Exception as e:
        print(f"Error in body composition progress: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/progress/strength-lifts")
def get_strength_lift_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Debug print
        print(f"Fetching strength lifts for user ID: {user.id}")

        strength_exercises = ['Bench Press', 'Squat', 'Deadlift']

        progress_data = {}
        for exercise_name in strength_exercises:
            max_lifts = db.query(Workout.date, func.max(Set.weight))\
                .join(Exercise)\
                .join(Set)\
                .filter(
                    Workout.user_id == user.id,
                    Exercise.name == exercise_name
            )\
                .group_by(Workout.date)\
                .order_by(Workout.date)\
                .all()

            # Debug print
            print(f"Found {len(max_lifts)} max lifts for {exercise_name}")

            progress_data[exercise_name] = [
                {
                    'date': date.isoformat(),
                    'max_weight': float(max_weight) if max_weight is not None else None
                } for date, max_weight in max_lifts
            ]

        return progress_data
    except Exception as e:
        print(f"Error in strength lifts progress: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")
