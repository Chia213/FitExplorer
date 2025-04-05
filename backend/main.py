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


@app.post("/admin/users/{user_id}/reset-password", response_model=dict)
def admin_reset_password(
    user_id: int,
    password_data: dict = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Reset a user's password (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password
    new_password = password_data.get("password")
    if not new_password or len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "message": f"Password reset successfully for user {user.username}"
    }


@app.get("/personal-records")
def get_personal_records(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workouts = db.query(Workout).filter(Workout.user_id == user.id).order_by(Workout.date.desc()).all()
    personal_records = {}
    for workout in workouts:
        for exercise in workout.exercises:
            if not exercise.is_cardio:
                max_weight = 0
                for set_data in exercise.sets:
                    if set_data.weight and set_data.weight > max_weight:
                        max_weight = set_data.weight
                if max_weight > 0:
                    if exercise.name not in personal_records:
                        personal_records[exercise.name] = {'weight': max_weight, 'date': workout.date}
                    elif max_weight > personal_records[exercise.name]['weight']:
                        personal_records[exercise.name] = {'weight': max_weight, 'date': workout.date}
    return personal_records


@app.get("/workout-streak")
def get_workout_streak(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's workout frequency goal
    preferences = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).first()
    frequency_goal = preferences.workout_frequency_goal if preferences else None

    # Get all workouts for the user, ordered by date
    workouts = db.query(Workout).filter(
        Workout.user_id == user.id
    ).order_by(Workout.date.desc()).all()

    if not workouts:
        return {"streak": 0, "last_workout": None, "frequency_goal": frequency_goal}

    # Get the last workout date
    last_workout = workouts[0].date
    today = datetime.now(timezone.utc).date()
    
    # If no frequency goal is set, use daily streak logic
    if not frequency_goal:
        if last_workout.date() != today:
            return {"streak": 0, "last_workout": last_workout, "frequency_goal": frequency_goal}

        streak = 1
        current_date = today - timedelta(days=1)
        
        for workout in workouts[1:]:
            if workout.date.date() == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
    else:
        # Calculate weekly streak based on frequency goal
        streak = 0
        current_week = today.isocalendar()[1]
        current_year = today.year
        
        # Count workouts in the current week
        workouts_this_week = sum(1 for w in workouts 
                               if w.date.date().isocalendar()[1] == current_week 
                               and w.date.date().year == current_year)
        
        if workouts_this_week >= frequency_goal:
            streak = 1
            
            # Check previous weeks
            week = current_week - 1
            year = current_year
            if week == 0:
                week = 52
                year -= 1
                
            while True:
                workouts_in_week = sum(1 for w in workouts 
                                     if w.date.date().isocalendar()[1] == week 
                                     and w.date.date().year == year)
                
                if workouts_in_week >= frequency_goal:
                    streak += 1
                    week -= 1
                    if week == 0:
                        week = 52
                        year -= 1
                else:
                    break

    return {"streak": streak, "last_workout": last_workout, "frequency_goal": frequency_goal}


@app.get("/workout-preferences", response_model=WorkoutPreferencesResponse)
async def get_workout_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preferences = db.query(WorkoutPreferences).filter(
        WorkoutPreferences.user_id == current_user.id
    ).first()
    
    if not preferences:
        # Create default preferences if none exist
        preferences = WorkoutPreferences(
            user_id=current_user.id,
            last_weight_unit="kg"
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    
    return preferences

@app.put("/workout-preferences", response_model=WorkoutPreferencesResponse)
async def update_workout_preferences(
    preferences_update: WorkoutPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preferences = db.query(WorkoutPreferences).filter(
        WorkoutPreferences.user_id == current_user.id
    ).first()
    
    if not preferences:
        preferences = WorkoutPreferences(user_id=current_user.id)
        db.add(preferences)
    
    for field, value in preferences_update.dict(exclude_unset=True).items():
        setattr(preferences, field, value)
    
    db.commit()
    db.refresh(preferences)
    return preferences

@app.get("/last-saved-routine")
def get_last_saved_routine(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get the most recently created routine for the user
        last_routine = db.query(Routine)\
            .filter(Routine.user_id == user.id)\
            .order_by(Routine.created_at.desc())\
            .first()

        if not last_routine:
            return {"message": "No saved routines found"}

        # If the routine has a workout, load its exercises
        if last_routine.workout_id:
            workout = db.query(Workout)\
                .options(
                    joinedload(Workout.exercises)
                    .joinedload(Exercise.sets)
                )\
                .filter(Workout.id == last_routine.workout_id)\
                .first()
            exercises = workout.exercises if workout else []
        else:
            exercises = []

        return {
            "id": last_routine.id,
            "name": last_routine.name,
            "description": last_routine.description,
            "created_at": last_routine.created_at.isoformat(),
            "exercises": [
                {
                    "id": exercise.id,
                    "name": exercise.name,
                    "sets": [
                        {
                            "id": set.id,
                            "reps": set.reps,
                            "weight": set.weight
                        } for set in exercise.sets
                    ]
                } for exercise in exercises
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching last routine: {str(e)}")


# Helper function to generate a token without circular imports
def create_profile_token(username, minutes):
    from datetime import datetime, timezone, timedelta
    import jwt
    from config import settings
    
    to_encode = {"sub": username}
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    
    # Add admin status to token
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            to_encode["is_admin"] = user.is_admin
    finally:
        db.close()
        
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


@app.put("/update-profile")
def update_user_profile(
    profile_data: UserProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if username is being updated
        username_changed = profile_data.username and profile_data.username != user.username
        
        # If username is changing, check if it already exists
        if username_changed:
            existing_user = db.query(User).filter(
                User.username == profile_data.username,
                User.id != user.id  # Exclude current user
            ).first()
            
            if existing_user:
                raise HTTPException(
                    status_code=409,
                    detail="Username already taken. Please choose a different username."
                )
        
        # Update user fields from request data
        for field, value in profile_data.dict(exclude_unset=True).items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)

        # If username changed, generate a new access token
        access_token = None
        if username_changed:
            # Query for admin settings to get session timeout
            admin_settings = db.query(AdminSettings).first()
            session_timeout = admin_settings.session_timeout if admin_settings else 60
            
            access_token = create_profile_token(user.username, session_timeout)

        return {
            "message": "Profile updated successfully",
            "username": user.username,
            "height": user.height,
            "weight": user.weight,
            "age": user.age,
            "gender": user.gender,
            "fitness_goals": user.fitness_goals,
            "bio": user.bio,
            "access_token": access_token  # Return new token if username changed
        }
    except HTTPException:
        # Re-raise HTTP exceptions we created
        raise
    except Exception as e:
        db.rollback()
        # Check for unique violation and provide a friendly message
        if "UniqueViolation" in str(e) and "users_username_key" in str(e):
            raise HTTPException(
                status_code=409,
                detail="Username already taken. Please choose a different username."
            )
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/achievements", response_model=List[UserAchievementResponse])
def get_user_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get all achievements
        all_achievements = db.query(Achievement).all()
        
        # Get user's achievements
        user_achievements = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id
        ).all()
        
        # Create a map of achievement_id to user_achievement for quick lookup
        user_achievement_map = {ua.achievement_id: ua for ua in user_achievements}
        
        # Prepare response with progress for all achievements
        response = []
        for achievement in all_achievements:
            user_achievement = user_achievement_map.get(achievement.id)
            response.append({
                "id": achievement.id,
                "name": achievement.name,
                "description": achievement.description,
                "icon": achievement.icon,
                "category": achievement.category,
                "requirement": achievement.requirement,
                "progress": user_achievement.progress if user_achievement else 0,
                "achieved_at": user_achievement.achieved_at if user_achievement else None,
                "is_achieved": bool(user_achievement and user_achievement.progress >= achievement.requirement)
            })
        
        # Sort achievements by progress in descending order
        response.sort(key=lambda x: (x["progress"] / x["requirement"] if x["requirement"] > 0 else 0), reverse=True)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/achievements/check")
def check_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_achievements = []

    try:
        # Get all achievements
        achievements = db.query(Achievement).all()

        # Check each achievement independently with its own transaction
        for achievement in achievements:
            try:
                # Create a new session for each achievement check
                with db.begin_nested():  # Use a savepoint
                    # Get or create user achievement
                    user_achievement = db.query(UserAchievement).filter(
                        UserAchievement.user_id == user.id,
                        UserAchievement.achievement_id == achievement.id
                    ).first()

                    if not user_achievement:
                        user_achievement = UserAchievement(
                            user_id=user.id,
                            achievement_id=achievement.id,
                            progress=0
                        )
                        db.add(user_achievement)
                        
                    # Initialize progress variable
                    progress = 0

                    # Update progress based on achievement category
                    if achievement.category == "workout":
                        # Count total workouts
                        progress = db.query(Workout).filter(
                            Workout.user_id == user.id
                        ).count()
                        
                        # For "Workout Variety Master" achievement
                        if achievement.name == "Workout Variety Master":
                            # Count unique exercises performed by the user
                            unique_exercises = db.query(func.count(func.distinct(Exercise.name)))\
                                .join(Workout)\
                                .filter(Workout.user_id == user.id)\
                                .scalar() or 0
                            progress = unique_exercises
                    elif achievement.category == "streak":
                        # Calculate current streak
                        progress = calculate_workout_streak(user.id, db)
                        
                        # For "Workout Frequency Champion" achievement
                        if achievement.name == "Workout Frequency Champion":
                            # Get the user's workout frequency goal
                            preferences = db.query(WorkoutPreferences).filter(
                                WorkoutPreferences.user_id == user.id
                            ).first()
                            
                            if not preferences or not preferences.workout_frequency_goal:
                                progress = 0
                            else:
                                # Get all workouts for the past 12 weeks
                                today = datetime.now(timezone.utc).date()
                                twelve_weeks_ago = today - timedelta(weeks=12)
                                
                                workouts = db.query(Workout).filter(
                                    Workout.user_id == user.id,
                                    Workout.date >= twelve_weeks_ago
                                ).order_by(Workout.date.desc()).all()
                                
                                # Group workouts by week
                                workout_weeks = {}
                                for workout in workouts:
                                    week_num = workout.date.date().isocalendar()[1]
                                    year = workout.date.date().year
                                    week_key = f"{year}-{week_num}"
                                    
                                    if week_key not in workout_weeks:
                                        workout_weeks[week_key] = 0
                                    workout_weeks[week_key] += 1
                                
                                # Count consecutive weeks meeting the goal
                                frequency_goal = int(preferences.workout_frequency_goal)
                                consecutive_weeks = 0
                                max_consecutive_weeks = 0
                                
                                # Start from current week and go backwards
                                for i in range(12):
                                    check_date = today - timedelta(weeks=i)
                                    week_num = check_date.isocalendar()[1]
                                    year = check_date.year
                                    week_key = f"{year}-{week_num}"
                                    
                                    if week_key in workout_weeks and workout_weeks[week_key] >= frequency_goal:
                                        consecutive_weeks += 1
                                    else:
                                        # Break in the streak
                                        max_consecutive_weeks = max(max_consecutive_weeks, consecutive_weeks)
                                        consecutive_weeks = 0
                                
                                # Final check in case the streak is ongoing
                                max_consecutive_weeks = max(max_consecutive_weeks, consecutive_weeks)
                                progress = max_consecutive_weeks
                        
                        # For "Consistency King" achievement
                        elif achievement.name == "Consistency King":
                            # Get all workouts for the past 12 weeks
                            today = datetime.now(timezone.utc).date()
                            twelve_weeks_ago = today - timedelta(weeks=12)
                            
                            workouts = db.query(Workout).filter(
                                Workout.user_id == user.id,
                                Workout.date >= twelve_weeks_ago
                            ).order_by(Workout.date.desc()).all()
                            
                            # Group workouts by week
                            workout_weeks = {}
                            for workout in workouts:
                                week_num = workout.date.date().isocalendar()[1]
                                year = workout.date.date().year
                                week_key = f"{year}-{week_num}"
                                
                                if week_key not in workout_weeks:
                                    workout_weeks[week_key] = 0
                                workout_weeks[week_key] += 1
                            
                            # Count consecutive weeks with at least 3 workouts
                            consecutive_weeks = 0
                            max_consecutive_weeks = 0
                            
                            # Start from current week and go backwards
                            for i in range(12):
                                check_date = today - timedelta(weeks=i)
                                week_num = check_date.isocalendar()[1]
                                year = check_date.year
                                week_key = f"{year}-{week_num}"
                                
                                if week_key in workout_weeks and workout_weeks[week_key] >= 3:
                                    consecutive_weeks += 1
                                else:
                                    # Break in the streak
                                    max_consecutive_weeks = max(max_consecutive_weeks, consecutive_weeks)
                                    consecutive_weeks = 0
                            
                            # Final check in case the streak is ongoing
                            max_consecutive_weeks = max(max_consecutive_weeks, consecutive_weeks)
                            progress = max_consecutive_weeks
                    elif achievement.category == "profile":
                        if achievement.name == "Profile Picture":
                            # Check if user has a profile picture
                            progress = 1 if user.profile_picture else 0
                        elif achievement.name == "Personal Info":
                            # Count completed personal info fields
                            completed_fields = 0
                            if user.height is not None:
                                completed_fields += 1
                            if user.weight is not None:
                                completed_fields += 1
                            if user.age is not None:
                                completed_fields += 1
                            if user.gender is not None and user.gender.strip():
                                completed_fields += 1
                            if user.fitness_goals is not None and user.fitness_goals.strip():
                                completed_fields += 1
                            if user.bio is not None and user.bio.strip():
                                completed_fields += 1
                            progress = completed_fields
                        elif achievement.name == "Weight Goal Achiever":
                            # Check if user has reached their goal weight
                            user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                            if user_profile and user_profile.goal_weight and user.weight:
                                # Goal achieved if current weight is equal to or better than goal weight
                                # For weight goals, "better" depends on whether the goal was to gain or lose weight
                                initial_weight = user.initial_weight if user.initial_weight else user.weight
                                if (initial_weight > user_profile.goal_weight and user.weight <= user_profile.goal_weight) or \
                                   (initial_weight < user_profile.goal_weight and user.weight >= user_profile.goal_weight):
                                    progress = 1
                                else:
                                    progress = 0
                            else:
                                progress = 0
                        elif achievement.name == "Username Change":
                            username_is_custom = False
                            if user.username and user.email:
                                email_prefix = user.email.split('@')[0]
                                if user.username != email_prefix:
                                    username_is_custom = True
                            progress = 1 if username_is_custom else 0
                    elif achievement.category == "customization":
                        if achievement.name == "Color Customizer":
                            # Check if user has customized their card color
                            user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                            default_color = "#dbeafe"
                            progress = 1 if user_profile and user_profile.card_color != default_color else 0
                        elif achievement.name == "Theme Switcher":
                            user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                            progress = 1 if user_profile else 0
                    elif achievement.category == "nutrition":
                        if achievement.name in ["Nutrition Tracker", "Nutrition Expert"]:
                            try:
                                # Count the number of meals logged by the user
                                meal_count = db.query(NutritionMeal).filter(
                                    NutritionMeal.user_id == user.id
                                ).count()
                                progress = meal_count
                            except Exception as nutrition_error:
                                print(f"Error checking nutrition achievements: {nutrition_error}")
                                progress = 0
                    elif achievement.category == "routines":
                        if achievement.name == "Routine Creator":
                            # Count the number of custom routines created by the user
                            routine_count = db.query(Routine).filter(
                                Routine.user_id == user.id
                            ).count()
                            progress = routine_count
                    elif achievement.category == "social":
                        if achievement.name == "Social Butterfly":
                            progress = 1 if user.profile_picture else 0
                    elif achievement.category == "app":
                        if achievement.name == "Fitness Explorer":
                            sections_visited = 0
                            if db.query(Workout).filter(Workout.user_id == user.id).count() > 0:
                                sections_visited += 1
                            try:
                                if db.query(NutritionMeal).filter(NutritionMeal.user_id == user.id).count() > 0:
                                    sections_visited += 1
                            except Exception:
                                pass
                            if user.profile_picture:
                                sections_visited += 1
                            if user.bio and user.fitness_goals:
                                sections_visited += 1
                            sections_visited += 1
                            progress = sections_visited
                        elif achievement.name == "Dedicated User":
                            if user.created_at:
                                days_since_creation = (datetime.now(timezone.utc) - user.created_at).days
                                progress = min(days_since_creation, 30)
                            else:
                                progress = 0

                    # Update progress if changed
                    if progress != user_achievement.progress:
                        user_achievement.progress = progress
                        if progress >= achievement.requirement and not user_achievement.achieved_at:
                            user_achievement.achieved_at = datetime.now(timezone.utc)
                            
                            # Create notification for newly achieved achievement
                            try:
                                new_notification = Notification(
                                    user_id=user.id,
                                    message=f"🏆 Achievement Unlocked: {achievement.name} - {achievement.description}",
                                    type="achievement_earned",
                                    icon=achievement.icon or "trophy",
                                    icon_color="text-yellow-500",
                                    is_read=False,
                                    created_at=datetime.now(timezone.utc)
                                )
                                db.add(new_notification)
                            except Exception as notif_error:
                                print(f"Error creating achievement notification: {notif_error}")
                            
                        updated_achievements.append(achievement.name)

            except Exception as achievement_error:
                print(f"Error processing achievement {achievement.name}: {achievement_error}")
                # Continue with next achievement instead of aborting everything
                
        # Final commit for all successful updates
        db.commit()
        
        if updated_achievements:
            return {"message": f"Updated achievements: {', '.join(updated_achievements)}"}
        return {"message": "No achievements updated"}

    except Exception as e:
        db.rollback()
        print(f"Error checking achievements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/admin/unlock-all-achievements")
def admin_unlock_all_achievements(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Unlock all achievements for an admin user"""
    try:
        # Get all achievements
        achievements = db.query(Achievement).all()
        unlocked_count = 0
        
        # Set maximum progress for all achievements
        for achievement in achievements:
            # Get or create user achievement
            user_achievement = db.query(UserAchievement).filter(
                UserAchievement.user_id == admin.id,
                UserAchievement.achievement_id == achievement.id
            ).first()
            
            if not user_achievement:
                user_achievement = UserAchievement(
                    user_id=admin.id,
                    achievement_id=achievement.id,
                    progress=0
                )
                db.add(user_achievement)
            
            # Set progress to max requirement
            if user_achievement.progress < achievement.requirement:
                user_achievement.progress = achievement.requirement
                user_achievement.achieved_at = datetime.now(timezone.utc)
                unlocked_count += 1
        
        db.commit()
        
        return {
            "message": f"All achievements unlocked for admin user {admin.username}",
            "unlocked_count": unlocked_count,
            "total_achievements": len(achievements)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/admin/claim-all-rewards")
def admin_claim_all_rewards(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Claim all achievement rewards for an admin user"""
    try:
        # Get all achievements that have been unlocked
        user_achievements = db.query(UserAchievement).join(Achievement).filter(
            UserAchievement.user_id == admin.id,
            UserAchievement.progress >= Achievement.requirement
        ).all()
        
        claimed_rewards = []
        
        # Get user profile for storing rewards
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == admin.id).first()
        if not user_profile:
            user_profile = UserProfile(user_id=admin.id)
            db.add(user_profile)
        
        # Special admin handling - unlock all types of rewards regardless of achievements
        
        # 1. Unlock workout templates
        user_profile.workout_templates_unlocked = True
        claimed_rewards.append("Expert Workout Templates")
        
        # 2. Set theme access (handled via frontend/useTheme.jsx which checks for isAdmin)
        # No explicit action needed in backend for themes
        claimed_rewards.append("Premium Themes")
        
        # 3. Enable stats features
        user_profile.stats_features_unlocked = True
        claimed_rewards.append("Stats Analysis")
        
        # Mark all eligible achievements as having their rewards claimed
        for user_achievement in user_achievements:
            if not user_achievement.reward_claimed:
                user_achievement.reward_claimed = True
        
        db.commit()
        
        return {
            "message": f"All achievement rewards claimed for admin user {admin.username}",
            "claimed_rewards": claimed_rewards,
            "total_claimed": len(claimed_rewards)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/admin/unlock-workout-templates")
def admin_unlock_workout_templates(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Unlock all workout templates for an admin user"""
    try:
        # Placeholder for workout templates - will need to be updated when implementing actual templates
        # Save the admin's access to workout templates in UserProfile or another appropriate table
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == admin.id).first()
        
        if not user_profile:
            user_profile = UserProfile(user_id=admin.id)
            db.add(user_profile)
        
        # Set a flag or field to indicate all templates are unlocked
        # This is a placeholder - actual implementation will depend on your data model
        user_profile.workout_templates_unlocked = True
        
        db.commit()
        
        return {
            "message": f"All workout templates unlocked for admin user {admin.username}",
            "status": "success"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/workout-templates")
def get_workout_templates(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all workout templates, with a flag indicating whether they are 
    unlocked for the current user
    """
    try:
        # Check if user is admin
        is_admin = user.is_admin
        
        # Check if user has unlocked all templates (from achievement rewards)
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        all_templates_unlocked = (user_profile and user_profile.workout_templates_unlocked) or is_admin
        
        # Placeholder for workout templates - this would be replaced with actual template data
        # In a real implementation, these would be fetched from the database
        templates = [
            {
                "id": "template-1",
                "name": "Beginner Full Body",
                "description": "A complete full body workout for beginners",
                "difficulty": "beginner",
                "category": "strength",
                "premium": False,
                "exercises": [
                    {"name": "Squats", "sets": 3, "reps": 10},
                    {"name": "Push-ups", "sets": 3, "reps": 10},
                    {"name": "Lunges", "sets": 3, "reps": 10, "per_side": True},
                    {"name": "Plank", "sets": 3, "duration": 30}
                ]
            },
            {
                "id": "template-2",
                "name": "Advanced HIIT",
                "description": "High-intensity interval training for experienced users",
                "difficulty": "advanced",
                "category": "cardio",
                "premium": True,
                "exercises": [
                    {"name": "Burpees", "sets": 4, "reps": 15},
                    {"name": "Mountain Climbers", "sets": 4, "duration": 45},
                    {"name": "Jump Squats", "sets": 4, "reps": 20},
                    {"name": "High Knees", "sets": 4, "duration": 45}
                ]
            },
            {
                "id": "template-3",
                "name": "Strength Upper Body",
                "description": "Build strength in your upper body",
                "difficulty": "intermediate",
                "category": "strength",
                "premium": True,
                "exercises": [
                    {"name": "Bench Press", "sets": 4, "reps": "8-10"},
                    {"name": "Overhead Press", "sets": 4, "reps": "8-10"},
                    {"name": "Bent Over Rows", "sets": 4, "reps": "8-10"},
                    {"name": "Pull-ups", "sets": 3, "reps": "max"}
                ]
            }
        ]
        
        # Mark templates as unlocked for admin or if user has unlocked all templates
        for template in templates:
            template["unlocked"] = not template["premium"] or all_templates_unlocked
        
        return {
            "is_admin": is_admin,
            "all_templates_unlocked": all_templates_unlocked,
            "templates": templates
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/achievements/new", response_model=List[UserAchievementResponse])
def get_new_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get newly earned achievements that the user hasn't seen yet"""
    try:
        # Find achievements where is_achieved is true but the notification hasn't been sent
        user_achievements = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id,
            UserAchievement.achieved_at.isnot(None),
            UserAchievement.reward_claimed == False  # Using reward_claimed to track if notification was sent
        ).all()
        
        # Get the achievement details
        achievement_ids = [ua.achievement_id for ua in user_achievements]
        achievements = db.query(Achievement).filter(
            Achievement.id.in_(achievement_ids)
        ).all()
        
        # Create achievement map for quick lookup
        achievement_map = {a.id: a for a in achievements}
        
        # Prepare response
        response = []
        for user_achievement in user_achievements:
            achievement = achievement_map.get(user_achievement.achievement_id)
            if achievement:
                response.append({
                    "id": achievement.id,
                    "name": achievement.name,
                    "description": achievement.description,
                    "icon": achievement.icon,
                    "category": achievement.category,
                    "requirement": achievement.requirement,
                    "progress": user_achievement.progress,
                    "achieved_at": user_achievement.achieved_at,
                    "is_achieved": True
                })
                
                # Mark as notified to prevent sending the same notification again
                user_achievement.reward_claimed = True
                
        # Commit changes to mark achievements as notified
        db.commit()
        
        return response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/achievements/refresh")
def refresh_user_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually refresh achievements for the current user.
    This is useful after adding new achievements to check progress right away.
    """
    try:
        # Call the existing achievement check function
        result = check_achievements(user, db)
        
        # Return achievements with progress
        achievements = get_user_achievements(user, db)
        
        return {
            "message": result.get("message", "Achievements refreshed"),
            "achievements": achievements
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing achievements: {str(e)}")


@app.get("/achievements/all", response_model=List[AchievementSchema])
def get_all_achievements(
    user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all achievements in the system (admin only).
    This is useful for debugging and checking which achievements exist.
    """
    try:
        achievements = db.query(Achievement).all()
        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching achievements: {str(e)}")


@app.get("/test/search")
def test_search(query: str = Query(..., description="Food search query"), db: Session = Depends(get_db)):
    """Test endpoint for food search without authentication requirements"""
    try:
        # Search common_foods table
        foods = db.query(CommonFood).filter(
            CommonFood.name.ilike(f"%{query}%")
        ).limit(10).all()
        
        results = [
            {
                "name": food.name,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "serving_size": food.serving_size,
                "source": "test"
            }
            for food in foods
        ]
        
        return {
            "query": query,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

