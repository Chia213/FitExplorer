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
    UserAchievementResponse,
    WorkoutTemplateCreate,
    WorkoutTemplateResponse
)
from models import (
    Workout, User, Exercise, Set, Routine, CustomExercise, SavedWorkoutProgram, RoutineFolder, WorkoutPreferences, 
    Notification, Achievement, UserAchievement, AdminSettings, NutritionMeal, NutritionGoal, UserProfile, CommonFood,
    WorkoutTemplate, UserUnlockedTemplates
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
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Body, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from background_task import send_summary_emails
from email_service import (send_summary_email, send_security_alert, send_verification_email, send_password_reset_email,
                           send_password_changed_email, send_account_deletion_email, notify_admin_new_registration)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt as pyjwt
from passlib.context import CryptContext
from nutrition import router as nutrition_router
from ai_workout import router as ai_workout_router
from sqlalchemy.sql import text


Base.metadata.create_all(bind=engine)

UPLOAD_DIRECTORY = "uploads/profile_pictures"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://accounts.google.com"
    ],  # Include both localhost variations and Google's domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"]
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
        # Create workout
        db_workout = Workout(
            name=workout.name,
            date=workout.date,
            start_time=workout.start_time,
            end_time=workout.end_time,
            bodyweight=workout.bodyweight,
            weight_unit=workout.weight_unit,
            notes=workout.notes,
            user_id=user.id
        )
        db.add(db_workout)
        db.flush()  # Assign ID but don't commit yet
        
        for exercise_data in workout.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category or "Uncategorized",
                is_cardio=exercise_data.is_cardio,
                workout_id=db_workout.id
            )
            db.add(new_exercise)
            db.flush()  # Assign ID but don't commit yet
            
            # Validate sets exist
            if not exercise_data.sets or len(exercise_data.sets) == 0:
                raise ValueError(f"Exercise '{exercise_data.name}' must contain at least one set")
            
            # Add sets
            for i, set_data in enumerate(exercise_data.sets):
                new_set = Set(
                    weight=set_data.weight,
                    reps=set_data.reps,
                    distance=set_data.distance,
                    duration=set_data.duration,
                    intensity=set_data.intensity,
                    notes=set_data.notes,
                    exercise_id=new_exercise.id,
                    order=getattr(set_data, 'order', i),  # Use provided order or index as default
                    # Add support for set types
                    is_warmup=getattr(set_data, 'is_warmup', False),
                    is_drop_set=getattr(set_data, 'is_drop_set', False),
                    is_superset=getattr(set_data, 'is_superset', False),
                    is_amrap=getattr(set_data, 'is_amrap', False),
                    is_restpause=getattr(set_data, 'is_restpause', False),
                    is_pyramid=getattr(set_data, 'is_pyramid', False),
                    is_giant=getattr(set_data, 'is_giant', False),
                    # Additional set properties
                    drop_number=getattr(set_data, 'drop_number', None),
                    original_weight=getattr(set_data, 'original_weight', None),
                    superset_with=getattr(set_data, 'superset_with', None),
                    rest_pauses=getattr(set_data, 'rest_pauses', None),
                    pyramid_type=getattr(set_data, 'pyramid_type', None),
                    pyramid_step=getattr(set_data, 'pyramid_step', None),
                    giant_with=getattr(set_data, 'giant_with', None)
                )
                db.add(new_set)
        
        # Commit all changes at once when we're sure everything is valid
        db.commit()
        db.refresh(db_workout)
        
        # Check achievements after workout creation
        try:
            check_achievements(user, db)
        except Exception as achievement_error:
            print(f"Error checking achievements: {str(achievement_error)}")
            # Don't fail the whole workout save if achievements checking fails
            
        return db_workout
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        print(f"Error creating workout: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating workout: {str(e)}")


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


@app.delete("/api/workouts-delete-all")
async def delete_all_workouts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get count of workouts to be deleted
        workout_count = db.query(Workout).filter(Workout.user_id == user.id).count()
        
        # Delete all related sets first
        db.query(Set).filter(
            Set.exercise_id.in_(
                db.query(Exercise.id).filter(
                    Exercise.workout_id.in_(
                        db.query(Workout.id).filter(Workout.user_id == user.id)
                    )
                )
            )
        ).delete(synchronize_session=False)

        # Delete all related exercises
        db.query(Exercise).filter(
            Exercise.workout_id.in_(
                db.query(Workout.id).filter(Workout.user_id == user.id)
            )
        ).delete(synchronize_session=False)

        # Finally delete all workouts
        db.query(Workout).filter(Workout.user_id == user.id).delete(synchronize_session=False)
        
        db.commit()
        return {"message": f"All workouts deleted successfully. {workout_count} workout(s) removed."}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting workouts: {str(e)}"
        )

@app.delete("/api/workouts-delete-selected")
async def delete_selected_workouts(
    workout_ids: List[int] = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not workout_ids:
        return {"message": "No workouts selected for deletion"}
    
    try:
        # Verify all workouts belong to this user
        for workout_id in workout_ids:
            workout = db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == user.id).first()
            if not workout:
                raise HTTPException(
                    status_code=404,
                    detail=f"Workout with id {workout_id} not found or does not belong to you"
                )
        
        # Delete all related sets first
        db.query(Set).filter(
            Set.exercise_id.in_(
                db.query(Exercise.id).filter(
                    Exercise.workout_id.in_(workout_ids)
                )
            )
        ).delete(synchronize_session=False)

        # Delete all related exercises
        db.query(Exercise).filter(
            Exercise.workout_id.in_(workout_ids)
        ).delete(synchronize_session=False)

        # Finally delete the workouts
        deleted_count = db.query(Workout).filter(
            Workout.id.in_(workout_ids), Workout.user_id == user.id
        ).delete(synchronize_session=False)
        
        db.commit()
        return {"message": f"Successfully deleted {deleted_count} workout(s)"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting workouts: {str(e)}"
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


@app.get("/progress/strength")
def get_strength_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get strength progress data for the main lifts"""
    try:
        # Define the main lifts we want to track
        main_lifts = ['Bench Press', 'Squat', 'Deadlift']
        
        # Query to find max weight for each main lift across time
        strength_data = []
        
        # For each workout, get the maximum weight lifted for each main lift
        workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == False  # Exclude templates
        ).order_by(Workout.date).all()
        
        for workout in workouts:
            # Find exercises matching main lifts
            exercise_data = {}
            exercise_data['date'] = workout.date.isoformat() if workout.date else None
            
            # For each main lift, find max weight
            for lift in main_lifts:
                exercise = db.query(Exercise).filter(
                    Exercise.workout_id == workout.id,
                    Exercise.name.ilike(f"%{lift}%")  # Case-insensitive partial match
                ).first()
                
                if exercise:
                    # Find max weight for this exercise
                    max_weight_set = db.query(Set).filter(
                        Set.exercise_id == exercise.id,
                        Set.weight.isnot(None)
                    ).order_by(Set.weight.desc()).first()
                    
                    if max_weight_set:
                        # Convert lift name to camelCase for frontend
                        lift_key = 'benchPress' if lift == 'Bench Press' else lift.lower()
                        exercise_data[lift_key] = max_weight_set.weight
            
            # Only add to results if at least one lift was recorded
            if len(exercise_data) > 1:  # More than just the date
                for lift in main_lifts:
                    lift_key = 'benchPress' if lift == 'Bench Press' else lift.lower()
                    if lift_key not in exercise_data:
                        # Find the most recent value for this lift
                        recent_entries = [entry for entry in strength_data if lift_key in entry]
                        if recent_entries:
                            exercise_data[lift_key] = recent_entries[-1][lift_key]
                        else:
                            exercise_data[lift_key] = 0
                            
                strength_data.append(exercise_data)
        
        return strength_data
    except Exception as e:
        print(f"Error fetching strength progress: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching strength progress: {str(e)}")


@app.get("/progress/cardio")
def get_cardio_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get cardio progress data"""
    try:
        # Query to find cardio workouts over time
        cardio_data = []
        
        # Get all workouts
        workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == False  # Exclude templates
        ).order_by(Workout.date).all()
        
        for workout in workouts:
            # Find cardio exercises
            cardio_exercises = db.query(Exercise).filter(
                Exercise.workout_id == workout.id,
                Exercise.is_cardio == True
            ).all()
            
            if cardio_exercises:
                for exercise in cardio_exercises:
                    # Get all sets for this cardio exercise
                    sets = db.query(Set).filter(Set.exercise_id == exercise.id).all()
                    
                    for set_item in sets:
                        if set_item.duration or set_item.distance:
                            entry = {
                                'date': workout.date.isoformat() if workout.date else None,
                                'exercise': exercise.name,
                                'duration': set_item.duration or 0,
                                'distance': set_item.distance or 0,
                                'intensity': set_item.intensity or 'Medium'
                            }
                            
                            # Calculate pace if both distance and duration are present
                            if set_item.duration and set_item.distance and set_item.distance > 0:
                                # Pace in minutes per km
                                entry['pace'] = (set_item.duration / 60) / (set_item.distance / 1000)
                            else:
                                entry['pace'] = 0
                                
                            cardio_data.append(entry)
        
        return cardio_data
    except Exception as e:
        print(f"Error fetching cardio progress: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching cardio progress: {str(e)}")


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

        # Add exercises and sets to the workout
        for exercise_data in routine.exercises:
            new_exercise = Exercise(
                name=exercise_data.name,
                category=exercise_data.category,
                is_cardio=exercise_data.is_cardio,
                workout_id=new_workout.id
            )
            db.add(new_exercise)
            db.flush()

            # Add sets if they exist in the request
            if hasattr(exercise_data, 'sets') and exercise_data.sets:
                for i, set_data in enumerate(exercise_data.sets):
                    new_set = Set(
                        exercise_id=new_exercise.id,
                        weight=getattr(set_data, 'weight', None),
                        reps=getattr(set_data, 'reps', None),
                        distance=getattr(set_data, 'distance', None),
                        duration=getattr(set_data, 'duration', None),
                        intensity=getattr(set_data, 'intensity', None),
                        notes=getattr(set_data, 'notes', None),
                        order=getattr(set_data, 'order', i),  # Use provided order or index as default
                        is_warmup=getattr(set_data, 'is_warmup', False),
                        is_drop_set=getattr(set_data, 'is_drop_set', False),
                        is_superset=getattr(set_data, 'is_superset', False),
                        is_amrap=getattr(set_data, 'is_amrap', False),
                        is_restpause=getattr(set_data, 'is_restpause', False),
                        is_pyramid=getattr(set_data, 'is_pyramid', False),
                        is_giant=getattr(set_data, 'is_giant', False),
                        drop_number=getattr(set_data, 'drop_number', None),
                        original_weight=getattr(set_data, 'original_weight', None),
                        superset_with=getattr(set_data, 'superset_with', None),
                        rest_pauses=getattr(set_data, 'rest_pauses', None),
                        pyramid_type=getattr(set_data, 'pyramid_type', None),
                        pyramid_step=getattr(set_data, 'pyramid_step', None),
                        giant_with=getattr(set_data, 'giant_with', None)
                    )
                    db.add(new_set)
            # If no sets provided, create empty sets based on initial_sets count
            else:
                initial_sets = exercise_data.initial_sets or 1
                for i in range(initial_sets):
                    if exercise_data.is_cardio:
                        new_set = Set(
                            distance=None,
                            duration=None,
                            intensity="",
                            notes="",
                            exercise_id=new_exercise.id,
                            order=i,  # Set order based on index
                            is_warmup=False,
                            is_drop_set=False,
                            is_superset=False,
                            is_amrap=False,
                            is_restpause=False,
                            is_pyramid=False,
                            is_giant=False
                        )
                    else:
                        new_set = Set(
                            weight=None,
                            reps=None,
                            notes="",
                            exercise_id=new_exercise.id,
                            order=i,  # Set order based on index
                            is_warmup=False,
                            is_drop_set=False,
                            is_superset=False,
                            is_amrap=False,
                            is_restpause=False,
                            is_pyramid=False,
                            is_giant=False
                        )
                    db.add(new_set)

        db.commit()
        db.refresh(new_routine)

        return new_routine

    except Exception as e:
        db.rollback()
        print(f"Error creating routine: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/routines")
async def get_routines(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"==== FETCHING ROUTINES START ====")
        print(f"Fetching routines for user: {user.username} (ID: {user.id})")
        
        # First check how many templates are in the system for this user
        template_workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == True
        ).all()
        print(f"User has {len(template_workouts)} template workouts in database")
        for tw in template_workouts:
            print(f"  - Template workout: {tw.name} (ID: {tw.id}, is_template: {tw.is_template})")
            
        # Get all routines with their associated workouts and exercises
        routines = db.query(Routine).options(
            joinedload(Routine.workout).options(
                joinedload(Workout.exercises).options(
                    joinedload(Exercise.sets)
                )
            )
        ).filter(
            Routine.user_id == user.id
        ).all()
        
        print(f"Found {len(routines)} total routines for user")
        
        result = []
        
        for routine in routines:
            # Build dictionary with routine info
            routine_dict = {
                "id": routine.id,
                "name": routine.name,
                "workout_id": routine.workout_id,
                "weight_unit": routine.weight_unit,
                "folder_id": routine.folder_id,
                "created_at": routine.created_at.isoformat() if routine.created_at else None,
                "exercises": []
            }
            
            # Check if this routine has a workout
            if routine.workout:
                # Gather exercises
                for exercise in routine.workout.exercises:
                    exercise_dict = {
                        "id": exercise.id,
                        "name": exercise.name,
                        "category": exercise.category,
                        "is_cardio": exercise.is_cardio,
                        "sets": []
                    }
                    
                    # Sort sets based on type priority and order
                    sorted_sets = sorted(exercise.sets, key=lambda s: (
                        0 if s.is_warmup else
                        1 if not any([s.is_drop_set, s.is_superset, s.is_amrap, s.is_restpause, s.is_pyramid, s.is_giant]) else  # Normal sets
                        2 if s.is_drop_set else
                        3 if s.is_superset else
                        4 if s.is_amrap else
                        5 if s.is_restpause else
                        6 if s.is_pyramid else
                        7 if s.is_giant else 8,
                        s.order if s.order is not None else float('inf')  # Use order as secondary sort key
                    ))
                    
                    # Add sets for this exercise (they are now sorted by type and order)
                    for exercise_set in sorted_sets:
                        set_dict = {
                            "id": exercise_set.id,
                            "weight": exercise_set.weight,
                            "reps": exercise_set.reps,
                            "distance": exercise_set.distance,
                            "duration": exercise_set.duration,
                            "intensity": exercise_set.intensity,
                            "notes": exercise_set.notes,
                            "order": exercise_set.order,
                            "is_warmup": exercise_set.is_warmup,
                            "is_drop_set": exercise_set.is_drop_set,
                            "is_superset": exercise_set.is_superset,
                            "is_amrap": exercise_set.is_amrap,
                            "is_restpause": exercise_set.is_restpause,
                            "is_pyramid": exercise_set.is_pyramid,
                            "is_giant": exercise_set.is_giant,
                            "drop_number": exercise_set.drop_number,
                            "original_weight": exercise_set.original_weight,
                            "superset_with": exercise_set.superset_with,
                            "rest_pauses": exercise_set.rest_pauses,
                            "pyramid_type": exercise_set.pyramid_type,
                            "pyramid_step": exercise_set.pyramid_step,
                            "giant_with": exercise_set.giant_with
                        }
                        exercise_dict["sets"].append(set_dict)
                        
                    routine_dict["exercises"].append(exercise_dict)
                
            result.append(routine_dict)
        
        print(f"Sending {len(result)} routines back to client")
        print(f"==== FETCHING ROUTINES COMPLETE ====")
        
        return result
    except Exception as e:
        print(f"Error fetching routines: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching routines: {str(e)}"
        )


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

    # Update routine fields
    routine.name = routine_data.name
    routine.weight_unit = routine_data.weight_unit
    routine.folder_id = routine_data.folder_id
    routine.updated_at = datetime.now(timezone.utc)

    # If there's no workout associated with this routine, create one
    if not routine.workout:
        new_workout = Workout(
            name=routine_data.name,
            user_id=user.id,
            weight_unit=routine_data.weight_unit,
            is_template=True
        )
        db.add(new_workout)
        db.flush()
        routine.workout_id = new_workout.id
    else:
        # Update existing workout
        routine.workout.name = routine_data.name
        routine.workout.weight_unit = routine_data.weight_unit

    # Delete existing exercises and their sets
    for exercise in routine.workout.exercises:
        db.query(Set).filter(Set.exercise_id == exercise.id).delete()
        db.delete(exercise)

    # Add new exercises and sets
    for exercise_data in routine_data.exercises:
        new_exercise = Exercise(
            name=exercise_data.name,
            category=exercise_data.category,
            is_cardio=exercise_data.is_cardio,
            workout_id=routine.workout_id
        )
        db.add(new_exercise)
        db.flush()

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
                    exercise_id=new_exercise.id,
                    # Set type flags
                    is_warmup=getattr(set_data, 'is_warmup', False),
                    is_drop_set=getattr(set_data, 'is_drop_set', False),
                    is_superset=getattr(set_data, 'is_superset', False),
                    is_amrap=getattr(set_data, 'is_amrap', False),
                    is_restpause=getattr(set_data, 'is_restpause', False),
                    is_pyramid=getattr(set_data, 'is_pyramid', False),
                    is_giant=getattr(set_data, 'is_giant', False),
                    # Additional set properties
                    drop_number=getattr(set_data, 'drop_number', None),
                    original_weight=getattr(set_data, 'original_weight', None),
                    superset_with=getattr(set_data, 'superset_with', None),
                    rest_pauses=getattr(set_data, 'rest_pauses', None),
                    pyramid_type=getattr(set_data, 'pyramid_type', None),
                    pyramid_step=getattr(set_data, 'pyramid_step', None),
                    giant_with=getattr(set_data, 'giant_with', None)
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
                        exercise_id=new_exercise.id,
                        # Set type flags
                        is_warmup=False,
                        is_drop_set=False,
                        is_superset=False,
                        is_amrap=False,
                        is_restpause=False,
                        is_pyramid=False,
                        is_giant=False
                    )
                else:
                    new_set = Set(
                        weight=None,
                        reps=None,
                        notes="",
                        exercise_id=new_exercise.id,
                        # Set type flags
                        is_warmup=False,
                        is_drop_set=False,
                        is_superset=False,
                        is_amrap=False,
                        is_restpause=False,
                        is_pyramid=False,
                        is_giant=False
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
    """Delete a routine by ID"""
    # Check if the routine exists and belongs to the user
    routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == user.id
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=404,
            detail="Routine not found or you don't have permission to delete it"
        )
    
    db.delete(routine)
    db.commit()

    return {"message": "Routine deleted successfully"}


@app.delete("/routines-delete-all")
def delete_all_routines(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all routines for the current user"""
    try:
        # Count how many routines we're deleting for logging purposes
        count = db.query(Routine).filter(
            Routine.user_id == user.id
        ).count()
        
        # Delete all routines for this user
        db.query(Routine).filter(
            Routine.user_id == user.id
        ).delete(synchronize_session=False)
        
        db.commit()
        
        return {"message": f"Successfully deleted {count} routines"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting all routines: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting all routines: {str(e)}"
        )


@app.get("/user/routines")
async def get_routines(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"==== FETCHING ROUTINES START ====")
        print(f"Fetching routines for user: {user.username} (ID: {user.id})")
        
        # First check how many templates are in the system for this user
        template_workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == True
        ).all()
        print(f"User has {len(template_workouts)} template workouts in database")
        for tw in template_workouts:
            print(f"  - Template workout: {tw.name} (ID: {tw.id}, is_template: {tw.is_template})")
            
        # Get all routines with their associated workouts and exercises
        routines = db.query(Routine).options(
            joinedload(Routine.workout).options(
                joinedload(Workout.exercises).options(
                    joinedload(Exercise.sets)
                )
            )
        ).filter(
            Routine.user_id == user.id
        ).all()
        
        print(f"Found {len(routines)} total routines for user")
        
        result = []
        
        for routine in routines:
            # Build dictionary with routine info
            routine_dict = {
                "id": routine.id,
                "name": routine.name,
                "workout_id": routine.workout_id,
                "weight_unit": routine.weight_unit,
                "folder_id": routine.folder_id,
                "created_at": routine.created_at.isoformat() if routine.created_at else None,
                "exercises": []
            }
            
            # Check if this routine has a workout
            if routine.workout:
                # Gather exercises
                for exercise in routine.workout.exercises:
                    exercise_dict = {
                        "id": exercise.id,
                        "name": exercise.name,
                        "category": exercise.category,
                        "is_cardio": exercise.is_cardio,
                        "sets": []
                    }
                    
                    # Sort sets based on type priority and order
                    sorted_sets = sorted(exercise.sets, key=lambda s: (
                        0 if s.is_warmup else
                        1 if not any([s.is_drop_set, s.is_superset, s.is_amrap, s.is_restpause, s.is_pyramid, s.is_giant]) else  # Normal sets
                        2 if s.is_drop_set else
                        3 if s.is_superset else
                        4 if s.is_amrap else
                        5 if s.is_restpause else
                        6 if s.is_pyramid else
                        7 if s.is_giant else 8,
                        s.order if s.order is not None else float('inf')  # Use order as secondary sort key
                    ))
                    
                    # Add sets for this exercise (they are now sorted by type and order)
                    for exercise_set in sorted_sets:
                        set_dict = {
                            "id": exercise_set.id,
                            "weight": exercise_set.weight,
                            "reps": exercise_set.reps,
                            "distance": exercise_set.distance,
                            "duration": exercise_set.duration,
                            "intensity": exercise_set.intensity,
                            "notes": exercise_set.notes,
                            "order": exercise_set.order,
                            "is_warmup": exercise_set.is_warmup,
                            "is_drop_set": exercise_set.is_drop_set,
                            "is_superset": exercise_set.is_superset,
                            "is_amrap": exercise_set.is_amrap,
                            "is_restpause": exercise_set.is_restpause,
                            "is_pyramid": exercise_set.is_pyramid,
                            "is_giant": exercise_set.is_giant,
                            "drop_number": exercise_set.drop_number,
                            "original_weight": exercise_set.original_weight,
                            "superset_with": exercise_set.superset_with,
                            "rest_pauses": exercise_set.rest_pauses,
                            "pyramid_type": exercise_set.pyramid_type,
                            "pyramid_step": exercise_set.pyramid_step,
                            "giant_with": exercise_set.giant_with
                        }
                        exercise_dict["sets"].append(set_dict)
                        
                    routine_dict["exercises"].append(exercise_dict)
                
            result.append(routine_dict)
        
        print(f"Sending {len(result)} routines back to client")
        print(f"==== FETCHING ROUTINES COMPLETE ====")
        
        return result
    except Exception as e:
        print(f"Error fetching routines: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching routines: {str(e)}"
        )


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


# Achievement Endpoints

@app.get("/achievements")
def get_user_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all achievements with user progress"""
    try:
        # Get all achievements
        achievements = db.query(Achievement).all()
        
        # Get user's achievement progress
        user_achievements = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id
        ).all()
        
        # Create a mapping of achievement_id to user progress
        progress_map = {ua.achievement_id: ua for ua in user_achievements}
        
        # Format response
        result = []
        for achievement in achievements:
            user_achievement = progress_map.get(achievement.id)
            
            is_achieved = user_achievement is not None and user_achievement.progress >= achievement.requirement
            
            result.append({
                "id": achievement.id,
                "name": achievement.name,
                "description": achievement.description,
                "icon": achievement.icon,
                "category": achievement.category,
                "requirement": achievement.requirement,
                "progress": user_achievement.progress if user_achievement else 0,
                "achieved_at": user_achievement.achieved_at if user_achievement and is_achieved else None,
                "is_achieved": is_achieved
            })
            
        return result
    except Exception as e:
        print(f"Error fetching achievements: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching achievements: {str(e)}")


@app.post("/achievements/check")
def check_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check and update user's achievement progress"""
    try:
        # Get all achievements
        achievements = db.query(Achievement).all()
        
        # Check and update progress for each achievement
        updated_count = 0
        newly_achieved = 0
        
        for achievement in achievements:
            # Get current user progress
            user_achievement = db.query(UserAchievement).filter(
                UserAchievement.user_id == user.id,
                UserAchievement.achievement_id == achievement.id
            ).first()
            
            # If user doesn't have this achievement record yet, create it
            if not user_achievement:
                user_achievement = UserAchievement(
                    user_id=user.id,
                    achievement_id=achievement.id,
                    progress=0
                )
                db.add(user_achievement)
                
            # Calculate progress based on achievement category
            # This is a simplified version - you'd need to implement the actual logic
            # based on your achievement categories and requirements
            if achievement.category == "workout":
                # Count user's workouts
                workout_count = db.query(Workout).filter(Workout.user_id == user.id).count()
                user_achievement.progress = workout_count
                
            elif achievement.category == "streak":
                # Get user's workout preferences to find their frequency goal
                workout_prefs = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).first()
                frequency_goal = workout_prefs.workout_frequency_goal if workout_prefs else None
                
                if achievement.name == "Workout Frequency Champion" and frequency_goal:
                    # This achievement tracks if user maintains their workout frequency goal
                    # Get workouts from the past 4 weeks (28 days)
                    four_weeks_ago = datetime.now(timezone.utc) - timedelta(days=28)
                    workouts = db.query(Workout).filter(
                        Workout.user_id == user.id,
                        Workout.date >= four_weeks_ago,
                        Workout.is_template == False
                    ).order_by(Workout.date.desc()).all()
                    
                    # Group workouts by week
                    weeks_achieved = 0
                    workouts_by_week = {}
                    
                    for workout in workouts:
                        # Calculate the week number (0-3, where 0 is current week)
                        days_ago = (datetime.now(timezone.utc) - workout.date).days
                        week_number = min(3, days_ago // 7)
                        
                        if week_number not in workouts_by_week:
                            workouts_by_week[week_number] = 0
                        workouts_by_week[week_number] += 1
                    
                    # Check how many weeks met the frequency goal
                    for week in range(4):  # Check all 4 weeks
                        week_workouts = workouts_by_week.get(week, 0)
                        if week_workouts >= frequency_goal:
                            weeks_achieved += 1
                    
                    # Update progress (number of weeks the goal was achieved)
                    user_achievement.progress = weeks_achieved
                
                elif achievement.name == "Consistency King":
                    # This checks for completing at least 3 workouts per week for 4 consecutive weeks
                    four_weeks_ago = datetime.now(timezone.utc) - timedelta(days=28)
                    workouts = db.query(Workout).filter(
                        Workout.user_id == user.id,
                        Workout.date >= four_weeks_ago,
                        Workout.is_template == False
                    ).order_by(Workout.date.desc()).all()
                    
                    # Group workouts by week
                    weeks_with_three_plus = 0
                    workouts_by_week = {}
                    
                    for workout in workouts:
                        # Calculate the week number (0-3, where 0 is current week)
                        days_ago = (datetime.now(timezone.utc) - workout.date).days
                        week_number = min(3, days_ago // 7)
                        
                        if week_number not in workouts_by_week:
                            workouts_by_week[week_number] = 0
                        workouts_by_week[week_number] += 1
                    
                    # Check how many weeks had at least 3 workouts
                    for week in range(4):  # Check all 4 weeks
                        week_workouts = workouts_by_week.get(week, 0)
                        if week_workouts >= 3:  # At least 3 workouts
                            weeks_with_three_plus += 1
                    
                    # Update progress
                    user_achievement.progress = weeks_with_three_plus
                
            elif achievement.category == "profile":
                # Check if user has completed profile
                user_data = db.query(User).filter(User.id == user.id).first()
                if user_data and user_data.profile_picture:
                    user_achievement.progress = 1
                    
            elif achievement.category == "routines":
                # Count user's routines
                routine_count = db.query(Routine).filter(Routine.user_id == user.id).count()
                user_achievement.progress = routine_count
                
            # Check if achievement is newly completed
            was_achieved = user_achievement.progress >= achievement.requirement
            is_achieved = user_achievement.progress >= achievement.requirement
            
            if is_achieved and not was_achieved:
                user_achievement.achieved_at = datetime.now(timezone.utc)
                user_achievement.earned_at = datetime.now(timezone.utc)
                user_achievement.is_read = False  # Mark as unread so it shows up in notifications
                user_achievement.title = achievement.name
                user_achievement.description = achievement.description
                newly_achieved += 1
                
            updated_count += 1
            
        db.commit()
        
        return {
            "message": f"Checked {updated_count} achievements. {newly_achieved} newly achieved!",
            "updated_count": updated_count,
            "newly_achieved": newly_achieved
        }
    except Exception as e:
        db.rollback()
        print(f"Error checking achievements: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error checking achievements: {str(e)}")


@app.post("/achievements/create")
def create_achievement(
    achievement_data: AchievementCreate,
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Create a new achievement"""
    try:
        # Check if achievement with same name already exists
        existing = db.query(Achievement).filter(
            Achievement.name == achievement_data.name
        ).first()
        
        if existing:
            return {"message": f"Achievement '{achievement_data.name}' already exists", "id": existing.id}
        
        # Create new achievement
        new_achievement = Achievement(
            name=achievement_data.name,
            description=achievement_data.description,
            icon=achievement_data.icon,
            category=achievement_data.category,
            requirement=achievement_data.requirement
        )
        
        db.add(new_achievement)
        db.commit()
        db.refresh(new_achievement)
        
        return {"message": "Achievement created successfully", "id": new_achievement.id}
    except Exception as e:
        db.rollback()
        print(f"Error creating achievement: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating achievement: {str(e)}")


@app.post("/achievements/cleanup-duplicates")
def cleanup_duplicate_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean up duplicate achievements"""
    try:
        # Get all achievements grouped by name
        achievements = db.query(Achievement).all()
        
        # Group by name
        achievement_groups = {}
        for achievement in achievements:
            if achievement.name not in achievement_groups:
                achievement_groups[achievement.name] = []
            achievement_groups[achievement.name].append(achievement)
        
        # Find duplicates
        duplicates_found = 0
        duplicates_deleted = 0
        
        for name, group in achievement_groups.items():
            if len(group) > 1:
                duplicates_found += len(group) - 1
                
                # Keep the first one, delete the rest
                # Be careful with foreign key constraints
                for duplicate in group[1:]:
                    # Check if there are user achievements referencing this
                    has_references = db.query(UserAchievement).filter(
                        UserAchievement.achievement_id == duplicate.id
                    ).first() is not None
                    
                    if not has_references:
                        db.delete(duplicate)
                        duplicates_deleted += 1
                    
        db.commit()
        
        if duplicates_deleted == 0 and duplicates_found > 0:
            return {"message": "No achievements were deleted due to foreign key references. Use force cleanup if needed."}
        
        return {
            "message": f"Found {duplicates_found} duplicates, deleted {duplicates_deleted} achievements.",
            "duplicates_found": duplicates_found,
            "duplicates_deleted": duplicates_deleted
        }
    except Exception as e:
        db.rollback()
        print(f"Error cleaning up achievements: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error cleaning up achievements: {str(e)}")


# User Theme Management

@app.get("/user/themes")
def get_user_themes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the user's theme preferences"""
    try:
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Return theme settings
        return {
            "theme": profile.theme_mode or "light",  # default to light
            "premium_theme": profile.premium_theme or "default",  # default to default theme
            "unlocked_themes": profile.unlocked_themes or ["default"],  # default to only default theme
        }
    except Exception as e:
        print(f"Error getting user themes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/themes/mode")
def set_theme_mode(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set the user's theme mode (light/dark)"""
    try:
        theme_mode = theme_data.get("theme_mode")
        if theme_mode not in ["light", "dark"]:
            raise HTTPException(status_code=400, detail="Invalid theme mode. Must be 'light' or 'dark'")
            
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            profile = UserProfile(user_id=user.id, theme_mode=theme_mode)
            db.add(profile)
        else:
            profile.theme_mode = theme_mode
            
        db.commit()
        
        return {"message": "Theme mode updated successfully", "theme_mode": theme_mode}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error setting theme mode: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/themes/premium")
def set_premium_theme(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set the user's premium theme"""
    try:
        theme_key = theme_data.get("theme_key")
        
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            profile = UserProfile(user_id=user.id, premium_theme=theme_key)
            db.add(profile)
        else:
            # Check if theme is unlocked for the user, or user is admin
            is_admin = db.query(User.is_admin).filter(User.id == user.id).scalar() or False
            unlocked_themes = profile.unlocked_themes or ["default"]
            
            if theme_key not in unlocked_themes and not is_admin:
                raise HTTPException(status_code=403, detail="Theme not unlocked for this user")
                
            profile.premium_theme = theme_key
            
        db.commit()
        
        return {"message": "Premium theme updated successfully", "premium_theme": theme_key}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error setting premium theme: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/themes/unlock")
def unlock_theme(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock a premium theme for the user"""
    try:
        theme_key = theme_data.get("theme_key")
        
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            profile = UserProfile(user_id=user.id, unlocked_themes=[theme_key])
            db.add(profile)
        else:
            # Update unlocked themes
            unlocked_themes = profile.unlocked_themes or ["default"]
            
            if theme_key not in unlocked_themes:
                unlocked_themes.append(theme_key)
                profile.unlocked_themes = unlocked_themes
            
        db.commit()
        
        return {"message": f"Theme '{theme_key}' unlocked successfully", "unlocked_themes": profile.unlocked_themes}
    except Exception as e:
        db.rollback()
        print(f"Error unlocking theme: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/themes/unlock-all")
def unlock_all_themes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock all premium themes for the user"""
    try:
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            # Create profile with all themes unlocked
            # We'd need to know all theme keys here, but we'll use a placeholder
            all_themes = ["default", "forest", "ocean", "sunset", "cosmos", "royal"]
            profile = UserProfile(user_id=user.id, unlocked_themes=all_themes)
            db.add(profile)
        else:
            # Add all available themes to the unlocked list
            all_themes = ["default", "forest", "ocean", "sunset", "cosmos", "royal"]
            profile.unlocked_themes = all_themes
            
        db.commit()
        
        return {"message": "All themes unlocked successfully", "unlocked_themes": profile.unlocked_themes}
    except Exception as e:
        db.rollback()
        print(f"Error unlocking all themes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/database/add-theme-columns", response_model=Dict[str, str])
async def add_theme_columns(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Admin endpoint to manually add theme columns to the user_profiles table"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403, detail="Only admin users can perform this action")
    
    try:
        # Execute raw SQL to add the columns if they don't exist
        # Check if columns exist first to avoid errors if columns already exist
        db.execute(text("""
        DO $$
        BEGIN
            -- Add theme_mode column if it doesn't exist
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'user_profiles' AND column_name = 'theme_mode'
            ) THEN
                ALTER TABLE user_profiles ADD COLUMN theme_mode VARCHAR DEFAULT 'light';
            END IF;

            -- Add premium_theme column if it doesn't exist
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'user_profiles' AND column_name = 'premium_theme'
            ) THEN
                ALTER TABLE user_profiles ADD COLUMN premium_theme VARCHAR DEFAULT 'default';
            END IF;

            -- Add unlocked_themes column if it doesn't exist
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'user_profiles' AND column_name = 'unlocked_themes'
            ) THEN
                ALTER TABLE user_profiles ADD COLUMN unlocked_themes JSONB DEFAULT '["default"]'::jsonb;
            END IF;
        END
        $$;
        """))
        
        db.commit()
        return {"status": "success", "message": "Theme columns added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to add columns: {str(e)}")


@app.get("/workout-streak", response_model=Dict[str, Any])
def get_workout_streak(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the user's current workout streak and frequency goal"""
    try:
        # Get user's workout preferences to get the frequency goal
        workout_prefs = db.query(WorkoutPreferences).filter(
            WorkoutPreferences.user_id == user.id
        ).first()
        
        frequency_goal = None
        if workout_prefs:
            frequency_goal = workout_prefs.workout_frequency_goal
        
        # Get all of the user's workouts, sorted by date
        workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == False  # Exclude templates
        ).order_by(desc(Workout.date)).all()
        
        if not workouts:
            return {
                "streak": 0,
                "frequency_goal": frequency_goal
            }
        
        # Calculate workout streak
        today = datetime.now(timezone.utc).date()
        streak = 0
        last_date = None
        
        # Handle first workout separately
        first_workout = workouts[0]
        first_date = first_workout.date.date() if first_workout.date else None
        
        if first_date and (today - first_date).days <= 1:
            # The most recent workout is today or yesterday, streak starts at 1
            streak = 1
            last_date = first_date
            
            # Check the rest of the workouts for consecutive days
            for workout in workouts[1:]:
                workout_date = workout.date.date() if workout.date else None
                if not workout_date:
                    continue
                    
                # If the date difference is 1 day, increment streak
                if last_date and (last_date - workout_date).days == 1:
                    streak += 1
                    last_date = workout_date
                # If it's the same day, skip (multiple workouts in one day)
                elif last_date and (last_date - workout_date).days == 0:
                    last_date = workout_date
                # If there's a gap, stop counting
                else:
                    break
        
        return {
            "streak": streak,
            "frequency_goal": frequency_goal
        }
    except Exception as e:
        print(f"Error calculating workout streak: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating workout streak: {str(e)}")


@app.post("/user/themes/check-access")
def check_theme_access(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has access to a specific theme"""
    theme_key = theme_data.get("theme_key")
    
    if not theme_key:
        raise HTTPException(status_code=400, detail="Theme key is required")
    
    # Default theme is always accessible
    if theme_key == "default":
        return {"has_access": True}
    
    # Admin users have access to all themes
    if user.is_admin:
        return {"has_access": True}
    
    # Check if theme is in user's unlocked themes
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not user_profile:
        return {"has_access": False}
    
    # Get the unlocked themes array
    unlocked_themes = user_profile.unlocked_themes or []
    
    # Check if the requested theme is in the unlocked themes
    has_access = theme_key in unlocked_themes
    
    return {"has_access": has_access}


@app.post("/user/workouts/save-templates")
async def save_workout_templates(
    request: Request,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"==== SAVE WORKOUT TEMPLATES START ====")
        print(f"Request from user: {user.username} (ID: {user.id})")
        
        # Define expert workout templates
        expert_templates = [
            {
                "name": "Full Body Strength",
                "description": "A comprehensive full body workout focusing on strength development",
                "is_template": True,
                "exercises": [
                    {"name": "Barbell Squat", "sets": 4, "reps": 8, "weight": 0, "notes": "Focus on form"},
                    {"name": "Bench Press", "sets": 4, "reps": 8, "weight": 0, "notes": "Control the descent"},
                    {"name": "Deadlift", "sets": 3, "reps": 8, "weight": 0, "notes": "Maintain neutral spine"},
                    {"name": "Pull-ups", "sets": 3, "reps": 8, "weight": 0, "notes": "Full range of motion"},
                    {"name": "Overhead Press", "sets": 3, "reps": 10, "weight": 0, "notes": "Brace your core"}
                ]
            },
            {
                "name": "HIIT Cardio",
                "description": "High intensity interval training for cardiovascular health and fat loss",
                "is_template": True,
                "exercises": [
                    {"name": "Sprints", "sets": 10, "reps": 1, "duration": 30, "rest": 30, "notes": "All out effort"},
                    {"name": "Burpees", "sets": 5, "reps": 15, "rest": 45, "notes": "Quick transitions"},
                    {"name": "Mountain Climbers", "sets": 5, "reps": 30, "rest": 45, "notes": "Keep hips low"},
                    {"name": "Jump Squats", "sets": 5, "reps": 15, "rest": 45, "notes": "Explosive power"}
                ]
            },
            {
                "name": "Upper Body Focus",
                "description": "Targeted upper body workout for strength and definition",
                "is_template": True,
                "exercises": [
                    {"name": "Bench Press", "sets": 4, "reps": 8, "weight": 0, "notes": "Control the movement"},
                    {"name": "Lat Pulldown", "sets": 4, "reps": 10, "weight": 0, "notes": "Engage your lats"},
                    {"name": "Overhead Press", "sets": 3, "reps": 10, "weight": 0, "notes": "Keep core tight"},
                    {"name": "Dumbbell Row", "sets": 3, "reps": 10, "weight": 0, "notes": "Pull to hip"},
                    {"name": "Tricep Pushdown", "sets": 3, "reps": 12, "weight": 0, "notes": "Isolate triceps"},
                    {"name": "Bicep Curl", "sets": 3, "reps": 12, "weight": 0, "notes": "Control the curl"}
                ]
            }
        ]
        
        # First check all workouts with is_template=True
        all_template_workouts = db.query(Workout).filter(
            Workout.is_template == True
        ).all()
        print(f"All template workouts in system: {len(all_template_workouts)}")
        for w in all_template_workouts:
            print(f"  - ID: {w.id}, Name: {w.name}, User ID: {w.user_id}")
        
        # Now check user's specific template workouts
        template_workouts = db.query(Workout).filter(
            Workout.user_id == user.id,
            Workout.is_template == True
        ).all()
        print(f"User's template workouts found: {len(template_workouts)}")
        for w in template_workouts:
            print(f"  - ID: {w.id}, Name: {w.name}, is_template value: {w.is_template}")
        
        # First check if user has any routines
        print(f"Checking existing routines for user {user.username} (ID: {user.id})...")
        routines = db.query(Routine).filter(Routine.user_id == user.id).all()
        print(f"Found {len(routines)} existing routines")
        
        # Get existing template names to avoid duplicates
        existing_template_names = []
        template_workout_ids = []
        
        for r in routines:
            if r.workout_id is not None:
                # Load the associated workout explicitly
                workout = db.query(Workout).filter(Workout.id == r.workout_id).first()
                if workout and workout.is_template:
                    existing_template_names.append(r.name)
                    template_workout_ids.append(r.workout_id)
                    print(f"Found existing template: {r.name} (Workout ID: {r.workout_id}, is_template: {workout.is_template})")
                
        print(f"Existing template names: {existing_template_names}")
        print(f"Associated workout IDs: {template_workout_ids}")
        
        # Add only new templates
        templates_added = 0
        for template in expert_templates:
            if template["name"] not in existing_template_names:
                print(f"Creating new template: {template['name']}")
                
                # Create workout first with is_template=True
                new_workout = Workout(
                    name=template["name"],
                    user_id=user.id,
                    date=datetime.now(timezone.utc),
                    weight_unit="kg",
                    is_template=True
                )
                db.add(new_workout)
                db.commit()
                db.refresh(new_workout)
                
                # CRITICAL: Verify workout was created with is_template=True
                print(f"Workout created with ID: {new_workout.id}, is_template: {new_workout.is_template}")
                
                # Double check the is_template flag is set
                db_workout = db.query(Workout).filter(Workout.id == new_workout.id).first()
                if not db_workout.is_template:
                    print(f"ERROR: Workout {db_workout.id} has is_template=False. Fixing...")
                    db_workout.is_template = True
                    db.commit()
                    db.refresh(db_workout)
                    print(f"After fix: is_template is now {db_workout.is_template}")
                
                # Create routine linked to workout
                new_routine = Routine(
                    name=template["name"],
                    user_id=user.id,
                    workout_id=new_workout.id,
                    weight_unit="kg",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(new_routine)
                db.commit()
                db.refresh(new_routine)
                print(f"Routine created with ID: {new_routine.id}, linked to workout ID: {new_routine.workout_id}")
                
                # Verify routine was created properly
                db_routine = db.query(Routine).options(
                    joinedload(Routine.workout)
                ).filter(Routine.id == new_routine.id).first()
                
                if db_routine and db_routine.workout:
                    print(f"Routine verification - Name: {db_routine.name}, Workout ID: {db_routine.workout_id}")
                    print(f"Associated workout is_template: {db_routine.workout.is_template}")
                else:
                    print(f"ERROR: Could not verify routine {new_routine.id} properly")
                
                # Add exercises to workout
                for exercise_data in template["exercises"]:
                    new_exercise = Exercise(
                        name=exercise_data["name"],
                        category="Uncategorized",
                        is_cardio=False,
                        workout_id=new_workout.id
                    )
                    db.add(new_exercise)
                    db.commit()
                    db.refresh(new_exercise)
                    print(f"  - Added exercise: {new_exercise.name} (ID: {new_exercise.id})")
                    
                    # Add sets for this exercise
                    sets_added = 0
                    for _ in range(exercise_data["sets"]):
                        new_set = Set(
                            weight=0,
                            reps=exercise_data.get("reps", 0),
                            distance=exercise_data.get("distance", None),
                            duration=exercise_data.get("duration", None),
                            notes=exercise_data.get("notes", ""),
                            exercise_id=new_exercise.id
                        )
                        db.add(new_set)
                        sets_added += 1
                    
                    db.commit()
                    print(f"    - Added {sets_added} sets to exercise")
                
                templates_added += 1
        
        # Update user profile to mark workout templates as unlocked
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not user_profile:
            # Create profile if it doesn't exist
            print("Creating new user profile...")
            user_profile = UserProfile(
                user_id=user.id,
                unlocked_features=["workouts"]
            )
            db.add(user_profile)
        else:
            # Ensure unlocked_features exists and add workouts
            print("Updating existing user profile...")
            unlocked_features = user_profile.unlocked_features or []
            if "workouts" not in unlocked_features:
                unlocked_features.append("workouts")
                user_profile.unlocked_features = unlocked_features
                
        db.commit()
        
        # Double check that templates were created correctly
        print("Final verification of templates...")
        final_templates = db.query(Routine).join(Workout).filter(
            Routine.user_id == user.id,
            Workout.is_template == True
        ).all()
        
        print(f"Final templates count: {len(final_templates)}")
        for template in final_templates:
            print(f"Template: {template.name}, Workout ID: {template.workout_id}")
            # Load the workout with exercises
            workout = db.query(Workout).options(
                joinedload(Workout.exercises).joinedload(Exercise.sets)
            ).filter(Workout.id == template.workout_id).first()
            
            if workout:
                print(f"  - Workout found: {workout.name}, is_template: {workout.is_template}")
                print(f"  - Has {len(workout.exercises) if workout.exercises else 0} exercises")
            else:
                print(f"  - ERROR: Workout {template.workout_id} not found")
                
        print(f"==== SAVE WORKOUT TEMPLATES COMPLETE ====")
            
        return {
            "success": True,
            "message": f"Added {templates_added} expert workout templates to your routines",
            "templates_added": templates_added
        }
    except Exception as e:
        db.rollback()
        print(f"Error saving workout templates: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving workout templates: {str(e)}"
        )


@app.get("/routine-folders", response_model=list[RoutineFolderResponse])
def get_routine_folders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all routine folders for the user"""
    try:
        folders = db.query(RoutineFolder).filter(
            RoutineFolder.user_id == user.id
        ).all()
        
        return folders
    except Exception as e:
        print(f"Error fetching routine folders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching routine folders: {str(e)}")


@app.post("/routine-folders", response_model=RoutineFolderResponse)
def create_routine_folder(
    folder: RoutineFolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new routine folder"""
    try:
        # Check if folder with this name already exists
        existing_folder = db.query(RoutineFolder).filter(
            RoutineFolder.user_id == user.id,
            RoutineFolder.name == folder.name
        ).first()
        
        if existing_folder:
            raise HTTPException(status_code=400, detail=f"Folder with name '{folder.name}' already exists")
        
        # Create new folder
        new_folder = RoutineFolder(
            name=folder.name,
            user_id=user.id,
            color=folder.color
        )
        
        db.add(new_folder)
        db.commit()
        db.refresh(new_folder)
        
        return new_folder
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating routine folder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating routine folder: {str(e)}")


@app.put("/routines/{routine_id}/folder", response_model=dict)
def assign_routine_to_folder(
    routine_id: int,
    folder_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign a routine to a folder"""
    try:
        # Check if routine exists and belongs to user
        routine = db.query(Routine).filter(
            Routine.id == routine_id,
            Routine.user_id == user.id
        ).first()
        
        if not routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        folder_id = folder_data.get("folder_id")
        
        # If folder_id is None, remove from current folder
        if folder_id is None:
            routine.folder_id = None
            db.commit()
            return {"message": "Routine removed from folder"}
        
        # Check if folder exists and belongs to user
        folder = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id,
            RoutineFolder.user_id == user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Assign routine to folder
        routine.folder_id = folder_id
        db.commit()
        
        return {"message": f"Routine assigned to folder '{folder.name}'"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error assigning routine to folder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error assigning routine to folder: {str(e)}")


@app.delete("/routine-folders/{folder_id}")
def delete_routine_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a routine folder"""
    try:
        # Check if folder exists and belongs to user
        folder = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id,
            RoutineFolder.user_id == user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Update routines to remove folder_id reference
        db.query(Routine).filter(
            Routine.folder_id == folder_id
        ).update({"folder_id": None})
        
        # Delete the folder
        db.delete(folder)
        db.commit()
        
        return {"message": f"Folder '{folder.name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting routine folder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting routine folder: {str(e)}")


# Workout Templates endpoints
@app.get("/workout-templates", response_model=List[WorkoutTemplateResponse], tags=["workout-templates"])
async def get_all_templates(
    is_premium: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all non-premium workout templates or filter by parameters.
    Premium templates require separate endpoint.
    """
    query = db.query(WorkoutTemplate)
    
    # Apply filters if provided
    if is_premium is not None:
        query = query.filter(WorkoutTemplate.is_premium == is_premium)
    if category:
        query = query.filter(WorkoutTemplate.category == category)
    if level:
        query = query.filter(WorkoutTemplate.level == level)
    
    # If requesting non-premium templates only
    if is_premium is False:
        templates = query.all()
        return templates
    
    # If a filter isn't specifying premium status, only return non-premium by default
    if is_premium is None:
        query = query.filter(WorkoutTemplate.is_premium == False)
        templates = query.all()
        return templates

    # Otherwise, check for premium access
    # Get user unlocked templates
    user_unlocked = db.query(UserUnlockedTemplates).filter(
        UserUnlockedTemplates.user_id == user.id
    ).first()
    
    if user.is_admin:
        # Admins have access to all templates
        templates = query.all()
        return templates
    
    if not user_unlocked:
        # User hasn't unlocked any premium templates
        if is_premium:
            return []  # Return empty list if only premium templates requested
        templates = query.filter(WorkoutTemplate.is_premium == False).all()
        return templates
    
    # Get templates that user has unlocked
    unlocked_ids = user_unlocked.template_ids
    
    if is_premium:
        # If specifically requesting premium templates, return only unlocked premium
        templates = query.filter(WorkoutTemplate.id.in_(unlocked_ids)).all()
        return templates
    
    # Otherwise return non-premium + unlocked premium
    non_premium = query.filter(WorkoutTemplate.is_premium == False).all()
    premium = query.filter(
        WorkoutTemplate.is_premium == True,
        WorkoutTemplate.id.in_(unlocked_ids)
    ).all()
    
    return non_premium + premium

@app.get("/workout-templates/premium", response_model=List[WorkoutTemplateResponse], tags=["workout-templates"])
async def get_premium_templates(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get premium workout templates that the user has unlocked.
    """
    if user.is_admin:
        # Admins have access to all premium templates
        premium_templates = db.query(WorkoutTemplate).filter(
            WorkoutTemplate.is_premium == True
        ).all()
        return premium_templates
    
    # For regular users, check unlocked templates
    user_unlocked = db.query(UserUnlockedTemplates).filter(
        UserUnlockedTemplates.user_id == user.id
    ).first()
    
    if not user_unlocked:
        return []  # No unlocked templates
    
    unlocked_ids = user_unlocked.template_ids
    premium_templates = db.query(WorkoutTemplate).filter(
        WorkoutTemplate.is_premium == True,
        WorkoutTemplate.id.in_(unlocked_ids)
    ).all()
    
    return premium_templates

@app.get("/workout-templates/available-premium", response_model=List[WorkoutTemplateResponse], tags=["workout-templates"])
async def get_available_premium_templates(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get premium templates that are available but the user hasn't unlocked yet.
    """
    if user.is_admin:
        # Admins have access to all templates, so there are no "available but not unlocked"
        return []
    
    # For regular users, check unlocked templates
    user_unlocked = db.query(UserUnlockedTemplates).filter(
        UserUnlockedTemplates.user_id == user.id
    ).first()
    
    if not user_unlocked:
        # No unlocked templates, all premium templates are available
        premium_templates = db.query(WorkoutTemplate).filter(
            WorkoutTemplate.is_premium == True
        ).all()
        return premium_templates
    
    unlocked_ids = user_unlocked.template_ids
    available_templates = db.query(WorkoutTemplate).filter(
        WorkoutTemplate.is_premium == True,
        ~WorkoutTemplate.id.in_(unlocked_ids)  # Not in unlocked IDs
    ).all()
    
    return available_templates

@app.get("/workout-templates/{template_id}", response_model=WorkoutTemplateResponse, tags=["workout-templates"])
async def get_template(
    template_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific workout template by ID.
    """
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # If template is not premium, return it
    if not template.is_premium:
        return template
    
    if user.is_admin:
        # Admins have access to all templates
        return template
    
    # For regular users, check if they've unlocked this template
    user_unlocked = db.query(UserUnlockedTemplates).filter(
        UserUnlockedTemplates.user_id == user.id
    ).first()
    
    if not user_unlocked or template_id not in user_unlocked.template_ids:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this premium template. Unlock it through achievements."
        )
    
    return template

@app.post("/workout-templates/unlock/{template_id}", status_code=status.HTTP_200_OK, tags=["workout-templates"])
async def unlock_template(
    template_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unlock a premium workout template.
    """
    # Check if template exists and is premium
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_premium:
        return {"message": "Template is not premium and doesn't need to be unlocked"}
    
    if user.is_admin:
        return {"message": "As an admin, you already have access to all premium templates"}
    
    # Check if user already has unlocked templates
    user_unlocked = db.query(UserUnlockedTemplates).filter(
        UserUnlockedTemplates.user_id == user.id
    ).first()
    
    if not user_unlocked:
        # Create new record for user
        new_unlocked = UserUnlockedTemplates(
            user_id=user.id,
            template_ids=[template_id]
        )
        db.add(new_unlocked)
        db.commit()
    else:
        # Update existing record
        if template_id not in user_unlocked.template_ids:
            user_unlocked.template_ids.append(template_id)
            db.commit()
    
    return {"message": f"Template {template_id} unlocked successfully"}

@app.post("/workout-templates", response_model=WorkoutTemplateResponse, status_code=status.HTTP_201_CREATED, tags=["workout-templates"])
async def create_template(
    template: WorkoutTemplateCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workout template (admin only).
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can create workout templates"
        )
    
    new_template = WorkoutTemplate(
        id=str(uuid.uuid4()),
        name=template.name,
        description=template.description,
        level=template.level,
        category=template.category,
        creator=template.creator,
        image_url=template.image_url,
        is_premium=template.is_premium,
        workouts=[workout.dict() for workout in template.workouts]
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return new_template

# Workout Preferences Endpoints
@app.get("/api/workout-preferences", response_model=WorkoutPreferencesResponse)
def get_workout_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's workout preferences"""
    preferences = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).first()
    
    if not preferences:
        # Create default preferences if they don't exist
        preferences = WorkoutPreferences(user_id=user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        
    return preferences


@app.put("/api/workout-preferences", response_model=WorkoutPreferencesResponse)
def update_workout_preferences(
    preferences: WorkoutPreferencesCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's workout preferences"""
    db_preferences = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).first()
    
    if not db_preferences:
        # Create preferences if they don't exist
        db_preferences = WorkoutPreferences(user_id=user.id)
        db.add(db_preferences)
    
    # Update preferences
    for key, value in preferences.dict(exclude_unset=True).items():
        setattr(db_preferences, key, value)
    
    db_preferences.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_preferences)
    
    return db_preferences

# Add user routines endpoint
@app.get("/user/routines", response_model=List[Dict[str, Any]])
def get_user_routines(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's workout routines"""
    routines = db.query(Workout).filter(
        Workout.user_id == user.id,
        Workout.is_template == True
    ).all()
    
    return [
        {
            "id": routine.id,
            "name": routine.name,
            "description": routine.description,
            "exercises": routine.exercises
        }
        for routine in routines
    ]

# Add user routines endpoints for creation and updating
@app.post("/user/routines", response_model=Dict[str, Any])
def create_user_routine(
    routine_data: Dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new workout routine for the current user"""
    # Create a new workout as a template (is_template=True)
    new_routine = Workout(
        user_id=user.id,
        name=routine_data.get("name", "Untitled Routine"),
        is_template=True,
        exercises=routine_data.get("exercises", []),
        date=datetime.now(timezone.utc)
    )
    
    db.add(new_routine)
    db.commit()
    db.refresh(new_routine)
    
    return {
        "id": new_routine.id,
        "name": new_routine.name,
        "description": new_routine.description,
        "exercises": new_routine.exercises
    }


@app.put("/user/routines/{routine_id}", response_model=Dict[str, Any])
def update_user_routine(
    routine_id: int,
    routine_data: Dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing workout routine for the current user"""
    # Find the routine by ID for the current user
    routine = db.query(Workout).filter(
        Workout.id == routine_id,
        Workout.user_id == user.id,
        Workout.is_template == True
    ).first()
    
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    # Update the routine
    routine.name = routine_data.get("name", routine.name)
    routine.exercises = routine_data.get("exercises", routine.exercises)
    routine.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(routine)
    
    return {
        "id": routine.id,
        "name": routine.name,
        "description": routine.description,
        "exercises": routine.exercises
    }

# Add endpoint for getting last saved routine
@app.get("/api/last-saved-routine", response_model=Dict[str, Any])
def get_last_saved_routine(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the last saved routine for the current user"""
    # Find the most recent workout
    last_workout = db.query(Workout).filter(
        Workout.user_id == user.id,
        Workout.is_template == False  # Only real workouts, not templates
    ).order_by(Workout.date.desc()).first()
    
    if not last_workout:
        return {
            "message": "No workouts found",
            "data": None
        }
    
    # Get the exercises for this workout
    exercises = db.query(Exercise).filter(
        Exercise.workout_id == last_workout.id
    ).all()
    
    exercise_data = []
    for exercise in exercises:
        # Get sets for this exercise
        sets = db.query(Set).filter(
            Set.exercise_id == exercise.id
        ).all()
        
        # Format sets data
        sets_data = []
        for set_item in sets:
            set_dict = {
                "id": set_item.id,
                "weight": set_item.weight,
                "reps": set_item.reps,
                "distance": set_item.distance,
                "duration": set_item.duration,
                "intensity": set_item.intensity,
                "notes": set_item.notes
            }
            sets_data.append(set_dict)
        
        # Format exercise data
        exercise_dict = {
            "id": exercise.id,
            "name": exercise.name,
            "category": exercise.category,
            "is_cardio": exercise.is_cardio,
            "sets": sets_data
        }
        exercise_data.append(exercise_dict)
    
    return {
        "id": last_workout.id,
        "name": last_workout.name,
        "date": last_workout.date.isoformat() if last_workout.date else None,
        "exercises": exercise_data
    }

# Add endpoint for getting new achievements
@app.get("/api/achievements/new", response_model=List[Dict[str, Any]])
def get_new_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get new/unread achievements for the current user"""
    try:
        # Get user achievements that haven't been read yet
        user_achievements = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id,
            UserAchievement.is_read == False
        ).all()
        
        result = []
        for user_achievement in user_achievements:
            # Get the associated achievement
            achievement = db.query(Achievement).filter(
                Achievement.id == user_achievement.achievement_id
            ).first()
            
            if not achievement:
                continue
                
            # Mark as read
            user_achievement.is_read = True
            
            # Use fields from user_achievement if available, otherwise fall back to achievement
            result.append({
                "id": user_achievement.id,
                "type": user_achievement.achievement_type or "achievement",
                "title": user_achievement.title or achievement.name,
                "description": user_achievement.description or achievement.description,
                "earned_at": user_achievement.earned_at.isoformat() if user_achievement.earned_at else 
                             (user_achievement.achieved_at.isoformat() if user_achievement.achieved_at else None),
                "icon": user_achievement.icon or achievement.icon or "trophy",
                "level": user_achievement.level or 1
            })
        
        # Commit changes to mark achievements as read
        db.commit()
        
        return result
    except Exception as e:
        db.rollback()
        print(f"Error fetching new achievements: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching new achievements: {str(e)}")

