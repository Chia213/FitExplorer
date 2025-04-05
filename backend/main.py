from security import hash_password, verify_password, generate_verification_token
from config import settings
from notifications import router as notifications_router
from security import create_access_token
from schemas import (
    WorkoutCreate,
    WorkoutResponse,
    ProfileUpdateRequest,
    UserProfileUpdate,
    WorkoutStatsResponse,
    ChangePasswordRequest,
    RoutineCreate,
    RoutineResponse,
    SavedWorkoutProgramCreate,
    SavedWorkoutProgramResponse,
    RoutineFolderCreate,
    RoutineFolderResponse,
    WorkoutPreferencesCreate,
    WorkoutPreferencesUpdate,
    WorkoutPreferencesResponse,
    TokenVerificationRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ConfirmAccountDeletionRequest,
    UserProfileUpdateRequest,
    AchievementCreate,
    Achievement as AchievementSchema,
    UserAchievementResponse
)
from models import (
    Workout, User, Exercise, Set, Routine, CustomExercise, SavedWorkoutProgram, RoutineFolder, WorkoutPreferences, 
    Notification, Achievement, UserAchievement, AdminSettings, NutritionMeal, NutritionGoal, UserProfile, CommonFood
)
from typing import List, Dict, Any, Optional
from admin import router as admin_router
from dependencies import get_current_user, get_admin_user
from auth import router as auth_router
from datetime import datetime, timezone, timedelta
from database import engine, Base, get_db, SessionLocal
from sqlalchemy import func, desc, extract
from sqlalchemy.orm import Session, joinedload
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from background_task import send_summary_emails
from email_service import (send_summary_email, send_security_alert, send_verification_email, send_password_reset_email,
                           send_password_changed_email, send_account_deletion_email, notify_admin_new_registration)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from passlib.context import CryptContext
from nutrition import router as nutrition_router
from ai_workout import router as ai_workout_router


Base.metadata.create_all(bind=engine)

UPLOAD_DIRECTORY = "uploads/profile_pictures"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.on_event("startup")
async def startup_event():
    print("Starting background task for email summaries")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(send_summary_emails)
    
    # Initialize achievements
    db = SessionLocal()
    try:
        initialize_achievements(db)
    finally:
        db.close()


def initialize_achievements(db: Session):
    """Initialize achievements in the database if they don't exist"""
    # New achievements to add
    new_achievements = [
        {
            "name": "Weight Goal Achiever",
            "description": "Reach your target weight goal",
            "icon": "weight-hanging",
            "category": "profile",
            "requirement": 1
        },
        {
            "name": "Routine Creator",
            "description": "Create 3 or more custom workout routines",
            "icon": "dumbbell",
            "category": "routines",
            "requirement": 3
        },
        {
            "name": "Workout Frequency Champion",
            "description": "Maintain your workout frequency goal for 4 or more consecutive weeks",
            "icon": "calendar-check",
            "category": "streak",
            "requirement": 4
        },
        {
            "name": "Workout Variety Master",
            "description": "Perform 20 different exercises across your workouts",
            "icon": "dumbbell",
            "category": "workout",
            "requirement": 20
        },
        {
            "name": "Consistency King",
            "description": "Complete at least 3 workouts per week for 4 consecutive weeks",
            "icon": "crown",
            "category": "streak",
            "requirement": 4
        }
    ]
    
    # Check for existing achievements and add new ones
    for achievement_data in new_achievements:
        # Check if achievement already exists
        existing = db.query(Achievement).filter(
            Achievement.name == achievement_data["name"]
        ).first()
        
        if not existing:
            print(f"Adding new achievement: {achievement_data['name']}")
            new_achievement = Achievement(
                name=achievement_data["name"],
                description=achievement_data["description"],
                icon=achievement_data["icon"],
                category=achievement_data["category"],
                requirement=achievement_data["requirement"]
            )
            db.add(new_achievement)
    
    # Commit changes
    db.commit()


@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(nutrition_router)
app.include_router(ai_workout_router)


@app.get("/protected-route")
def protected_route(user: User = Depends(get_current_user)):
    return {"email": user.email}


@app.post("/trigger-email-summary")
def trigger_email_summary(background_tasks: BackgroundTasks):
    background_tasks.add_task(send_summary_emails)
    return {"message": "Email summary task started!"}


@app.get("/send-summary")
async def send_summaries(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    users = db.query(User).join(UserProfile).filter(
        UserProfile.email_notifications == True
    ).all()

    for user in users:
        frequency = user.profile.summary_frequency if user.profile else None
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
def create_workout(
    workout: WorkoutCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Create the workout
        db_workout = Workout(
            name=workout.name,
            date=datetime.now(timezone.utc),
            start_time=workout.start_time,
            end_time=workout.end_time,
            bodyweight=workout.bodyweight,
            notes=workout.notes,
            user_id=user.id,
            weight_unit=workout.weight_unit,
            is_template=False
        )
        db.add(db_workout)
        db.commit()
        db.refresh(db_workout)

        # Add exercises and sets
        for exercise_data in workout.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio,
                workout_id=db_workout.id
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)

            # Add sets
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
        db.refresh(db_workout)

        # Check achievements after workout creation
        check_achievements(user, db)

        return db_workout
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


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


@app.get("/user-profile")
def profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Get user profile
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        # If no profile exists, create one with default values
        if not user_profile:
            user_profile = UserProfile(
                user_id=user.id,
                goal_weight=None,
                email_notifications=True,
                summary_frequency=None,
                summary_day=None,
                card_color="#dbeafe"
            )
            db.add(user_profile)
            db.commit()
            db.refresh(user_profile)

        return {
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "profile_picture": user.profile_picture,
            "height": user.height,
            "weight": user.weight,
            "age": user.age,
            "gender": user.gender,
            "fitness_goals": user.fitness_goals,
            "bio": user.bio,
            "preferences": {
                "goal_weight": user_profile.goal_weight,
                "email_notifications": user_profile.email_notifications,
                "summary_frequency": user_profile.summary_frequency,
                "summary_day": user_profile.summary_day,
                "card_color": user_profile.card_color
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/user-profile")
def update_profile(
    preferences: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get or create user profile
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not user_profile:
            user_profile = UserProfile(user_id=user.id)
            db.add(user_profile)

        # Update profile fields
        for field, value in preferences.dict(exclude_unset=True).items():
            setattr(user_profile, field, value)

        db.commit()
        db.refresh(user_profile)

        return {
            "message": "Profile updated successfully",
            "preferences": {
                "goal_weight": user_profile.goal_weight,
                "email_notifications": user_profile.email_notifications,
                "summary_frequency": user_profile.summary_frequency,
                "summary_day": user_profile.summary_day,
                "card_color": user_profile.card_color
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/user/settings/notifications")
def update_notification_preferences(
    preferences_data: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_preferences = db.query(UserProfile).filter_by(user_id=user.id).first()

    if not user_preferences:
        user_preferences = UserProfile(user_id=user.id)
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
        db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id ==
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
                routine, 'weight_unit') else "kg",
            created_at=datetime.now(timezone.utc)
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

    # Update routine details but preserve created_at
    routine.name = routine_data.name
    routine.weight_unit = routine_data.weight_unit if hasattr(
        routine_data, 'weight_unit') else "kg"
    routine.updated_at = datetime.now(timezone.utc)  # Update the last modified time
    # Note: We don't update created_at here to preserve the original creation time

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
            .order_by(Routine.created_at.desc())\
            .all()

        # Transform routines to include folder_name
        return [
            {
                "id": routine.id,
                "name": routine.name,
                "workout_id": routine.workout_id,
                "folder_id": routine.folder_id,
                "folder_name": routine.folder.name if routine.folder else None,
                "workout": routine.workout,
                "created_at": routine.created_at,
                "updated_at": routine.updated_at
            }
            for routine in routines
        ]
    except Exception as e:
        print(f"Error fetching routines: {e}")
        raise HTTPException(status_code=500, detail="Error fetching routines")


@app.post("/saved-programs", response_model=dict)
async def create_saved_program(
    program_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Received program_data keys: {program_data.keys()}")
        
        # Extract program data fields
        name = program_data.get("name", "Workout Program")
        description = program_data.get("description", "")
        category = program_data.get("category", "General")
        
        # Debug nested structure if it exists
        if "program_data" in program_data:
            print("Found nested program_data structure")
            # Extract from nested structure
            nested_data = program_data.get("program_data")
            if isinstance(nested_data, str):
                try:
                    import json
                    nested_data = json.loads(nested_data)
                    print(f"Parsed nested program_data: {nested_data.keys() if isinstance(nested_data, dict) else 'not a dict'}")
                except Exception as e:
                    print(f"Error parsing nested program_data: {e}")
        
        # Create a new saved program
        new_program = SavedWorkoutProgram(
            user_id=user.id,
            name=name,
            description=description,
            category=category,
            program_data=program_data,  # Store the entire object as JSON
            current_week=program_data.get("current_week", 1),
            completed_weeks=program_data.get("completed_weeks", []),
            exercise_weights=program_data.get("exercise_weights", {}),
            exercise_notes=program_data.get("exercise_notes", {}),
            weight_unit=program_data.get("weight_unit", "kg")
        )
        
        db.add(new_program)
        db.commit()
        db.refresh(new_program)
        
        # Return the created program
        return {
            "id": new_program.id,
            "name": new_program.name,
            "description": new_program.description,
            "category": new_program.category,
            "created_at": new_program.created_at
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating saved program: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating saved program: {str(e)}")


@app.put("/saved-programs/{program_id}")
async def update_saved_program(
    program_id: int,
    update_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Updating program {program_id} with data keys: {update_data.keys()}")
        
        # Find the program
        program = db.query(SavedWorkoutProgram).filter(
            SavedWorkoutProgram.id == program_id,
            SavedWorkoutProgram.user_id == user.id
        ).first()
        
        if not program:
            raise HTTPException(status_code=404, detail="Program not found")
        
        # Update basic fields if provided
        if "name" in update_data:
            program.name = update_data["name"]
            
        if "description" in update_data:
            program.description = update_data["description"]
            
        if "category" in update_data:
            program.category = update_data["category"]
            
        # Update program tracking fields
        if "current_week" in update_data:
            program.current_week = update_data["current_week"]
            
        if "completed_weeks" in update_data:
            program.completed_weeks = update_data["completed_weeks"]
            
        if "exercise_weights" in update_data:
            program.exercise_weights = update_data["exercise_weights"]
            
        if "exercise_notes" in update_data:
            program.exercise_notes = update_data["exercise_notes"]
            
        if "weight_unit" in update_data:
            program.weight_unit = update_data["weight_unit"]
            
        # If there's a program_data field, update the whole program data
        if "program_data" in update_data:
            program_data = update_data["program_data"]
            # Handle string JSON if needed
            if isinstance(program_data, str):
                try:
                    import json
                    program_data = json.loads(program_data)
                except Exception as e:
                    print(f"Error parsing program_data string: {e}")
            
            program.program_data = program_data
        
        db.commit()
        
        return {"message": "Program updated successfully", "id": program.id}
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Error updating program: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating program: {str(e)}")


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
                "name": program.name,
                "description": program.description,
                "category": program.category,
                "program_data": program.program_data,
                "created_at": program.created_at.isoformat() if program.created_at else None,
                "current_week": program.current_week,
                "completed_weeks": program.completed_weeks if isinstance(program.completed_weeks, list) else []
            }
            result.append(program_dict)

        return result
    except Exception as e:
        print(f"Error in get_saved_programs: {str(e)}")  # Debug print
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/saved-programs/{program_id}", response_model=Dict[str, Any])
def get_saved_program_by_id(
    program_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        program = db.query(SavedWorkoutProgram)\
            .filter(
                SavedWorkoutProgram.id == program_id,
                SavedWorkoutProgram.user_id == user.id
            )\
            .first()

        if not program:
            raise HTTPException(status_code=404, detail="Saved program not found")

        # Convert to dict and ensure data is serializable
        program_dict = {
            "id": program.id,
            "user_id": program.user_id,
            "name": program.name,
            "description": program.description,
            "category": program.category,
            "program_data": program.program_data,
            "created_at": program.created_at.isoformat() if program.created_at else None,
            "current_week": program.current_week,
            "completed_weeks": program.completed_weeks if isinstance(program.completed_weeks, list) else [],
            "exercise_weights": program.exercise_weights or {},
            "exercise_notes": program.exercise_notes or {},
            "weight_unit": program.weight_unit or "kg"
        }

        return program_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_saved_program_by_id: {str(e)}")
        import traceback
        traceback.print_exc()
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
        print(f"Error deleting saved program: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

