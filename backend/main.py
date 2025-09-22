from security import hash_password, verify_password
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
    WorkoutTemplateResponse,
    BadgeSelectionRequest
)
from models import (
    User, UserProfile, Workout, Exercise, Set, 
    CustomExercise, Routine, RoutineFolder, 
    SavedWorkoutProgram, Notification, WorkoutPreferences,
    Achievement, UserAchievement, NutritionMeal, 
    NutritionFood, NutritionGoal, CommonFood, 
    WorkoutTemplate, UserUnlockedTemplates, UserReward,
    AdminSettings, UserSession, ExerciseMemory
)
from typing import List, Dict, Any, Optional
from admin import router as admin_router
from dependencies import get_current_user, get_admin_user
from auth import router as auth_router
print("Auth router initialized with session validation endpoints")
from datetime import datetime, timezone, timedelta, date
from database import engine, Base, get_db, SessionLocal
from sqlalchemy import func, desc, extract, asc, text, distinct, or_, and_, inspect
from sqlalchemy.orm import Session, joinedload, contains_eager, aliased
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Body, Query, Request, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from background_task import send_summary_emails
from email_service import (send_summary_email, send_security_alert, send_verification_email, send_password_reset_email,
                           send_password_changed_email, send_account_deletion_email, notify_admin_new_registration,
                           notify_admin_password_changed)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt as pyjwt
from passlib.context import CryptContext
from nutrition import router as nutrition_router
from ai_workout import router as ai_workout_router
from routers.custom_exercises import router as custom_exercises_router
from sqlalchemy.sql import text as sql_text
from sqlalchemy.exc import IntegrityError


Base.metadata.create_all(bind=engine)

UPLOAD_DIRECTORY = "uploads/profile_pictures"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fitexplorer.se",
        "https://www.fitexplorer.se", 
        "https://fitexplorerse.vercel.app",
        "http://localhost:5173",  # Local dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"]
)



@app.on_event("startup")
async def startup_event():
    """Initialize database and create default achievements if they don't exist"""
    db = SessionLocal()
    try:
        # Initialize default achievements
        default_achievements = [
            {
                "name": "Profile Pioneer",
                "description": "Complete your profile information",
                "icon": "FaUser",
                "category": "profile",
                "requirement": 6  # All profile fields filled
            },
            {
                "name": "Workout Warrior",
                "description": "Complete your first workout",
                "icon": "FaDumbbell",
                "category": "workout",
                "requirement": 1
            },
            {
                "name": "Exercise Explorer",
                "description": "Try 5 different exercises",
                "icon": "FaRunning",
                "category": "variety",
                "requirement": 5
            },
            {
                "name": "Fitness Enthusiast",
                "description": "Complete 10 workouts",
                "icon": "FaFire",
                "category": "workout",
                "requirement": 10
            },
            {
                "name": "Variety Master",
                "description": "Try 20 different exercises",
                "icon": "FaDumbbell",
                "category": "variety",
                "requirement": 20
            }
        ]

        # Check if achievements exist
        existing_count = db.query(Achievement).count()
        if existing_count == 0:
            print("Initializing default achievements...")
            for achievement_data in default_achievements:
                achievement = Achievement(**achievement_data)
                db.add(achievement)
            db.commit()
            print(f"Created {len(default_achievements)} default achievements")
        else:
            print(f"Found {existing_count} existing achievements")

    except Exception as e:
        print(f"Error during startup: {str(e)}")
        db.rollback()
    finally:
        db.close()

    print("Starting background task for email summaries")
    background_tasks = BackgroundTasks()
    background_tasks.add_task(send_summary_emails)
    
    # Initialize achievements
    try:
        initialize_achievements(db)
    finally:
        db.close()


def initialize_achievements(db: Session):
    """Initialize achievements in the database if they don't exist"""
    # Count of created achievements
    created_count = 0
    
    # New achievements to add
    new_achievements = [
        # Original achievements
        {
            "name": "Weight Goal Achiever",
            "description": "Reach your target weight goal",
            "icon": "FaWeight",
            "category": "profile",
            "requirement": 1
        },
        {
            "name": "Routine Creator",
            "description": "Create 3 or more custom workout routines",
            "icon": "FaDumbbell",
            "category": "routines",
            "requirement": 3
        },
        {
            "name": "Workout Frequency Champion",
            "description": "Maintain your workout frequency goal for 4 or more consecutive weeks",
            "icon": "FaCalendarCheck",
            "category": "streak",
            "requirement": 4
        },
        {
            "name": "Workout Variety Master",
            "description": "Perform 20 different exercises across your workouts",
            "icon": "FaDumbbell",
            "category": "workout",
            "requirement": 20
        },
        {
            "name": "Consistency King",
            "description": "Complete at least 3 workouts per week for 4 consecutive weeks",
            "icon": "FaCrown",
            "category": "streak",
            "requirement": 4
        },
        # Additional workout achievements
        {
            "name": "Workout Beginner",
            "description": "Complete your first workout",
            "icon": "FaDumbbell",
            "category": "workout",
            "requirement": 1
        },
        {
            "name": "Workout Enthusiast",
            "description": "Complete 10 workouts",
            "icon": "FaDumbbell",
            "category": "workout",
            "requirement": 10
        },
        {
            "name": "Workout Addict",
            "description": "Complete 50 workouts",
            "icon": "FaDumbbell",
            "category": "workout",
            "requirement": 50
        },
        {
            "name": "Workout Master",
            "description": "Complete 100 workouts",
            "icon": "FaDumbbell",
            "category": "workout", 
            "requirement": 100
        },
        # Additional streak achievements
        {
            "name": "Workout Streak: Week",
            "description": "Maintain a workout streak of 7 days",
            "icon": "FaFire",
            "category": "streak",
            "requirement": 7
        },
        {
            "name": "Workout Streak: Month",
            "description": "Maintain a workout streak of 30 days",
            "icon": "FaFire",
            "category": "streak",
            "requirement": 30
        },
        {
            "name": "Workout Streak: Season",
            "description": "Maintain a workout streak of 90 days",
            "icon": "FaFire",
            "category": "streak",
            "requirement": 90
        },
        # Profile achievements
        {
            "name": "Profile Picture",
            "description": "Upload your first profile picture",
            "icon": "FaUser",
            "category": "profile",
            "requirement": 1
        },
        {
            "name": "Personal Info",
            "description": "Complete all personal information fields",
            "icon": "FaIdCard",
            "category": "profile",
            "requirement": 6
        },
        {
            "name": "Username Change",
            "description": "Change your username for the first time",
            "icon": "FaUserEdit",
            "category": "profile",
            "requirement": 1
        },
        # Customization achievements
        {
            "name": "Color Customizer",
            "description": "Change your card color",
            "icon": "FaPalette",
            "category": "customization",
            "requirement": 1
        },
        {
            "name": "Theme Switcher",
            "description": "Try both light and dark themes",
            "icon": "FaMoon",
            "category": "customization",
            "requirement": 1
        },
        {
            "name": "Theme Collector",
            "description": "Unlock 3 premium themes",
            "icon": "FaPalette",
            "category": "customization",
            "requirement": 3
        },
        # Nutrition achievements
        {
            "name": "Nutrition Tracker",
            "description": "Record your first meal",
            "icon": "FaAppleAlt",
            "category": "nutrition",
            "requirement": 1
        },
        {
            "name": "Nutrition Enthusiast",
            "description": "Record 20 meals",
            "icon": "FaAppleAlt",
            "category": "nutrition",
            "requirement": 20
        },
        {
            "name": "Nutrition Expert",
            "description": "Record 50 meals",
            "icon": "FaAppleAlt",
            "category": "nutrition",
            "requirement": 50
        },
        {
            "name": "Nutrition Master",
            "description": "Record 100 meals",
            "icon": "FaAppleAlt",
            "category": "nutrition",
            "requirement": 100
        },
        # Social achievements
        {
            "name": "Social Butterfly",
            "description": "Share your first workout",
            "icon": "FaShare",
            "category": "social",
            "requirement": 1
        },
        {
            "name": "Social Influencer",
            "description": "Share 10 workouts",
            "icon": "FaShare",
            "category": "social",
            "requirement": 10
        },
        # App usage achievements
        {
            "name": "Fitness Explorer",
            "description": "Visit all main sections of the app",
            "icon": "FaCompass",
            "category": "app",
            "requirement": 5
        },
        {
            "name": "Dedicated User",
            "description": "Login to the app for 30 consecutive days",
            "icon": "FaCalendarCheck",
            "category": "app",
            "requirement": 30
        },
        {
            "name": "Fitness Enthusiast",
            "description": "Use the app for 60 days",
            "icon": "FaHeart",
            "category": "app",
            "requirement": 60
        },
        # Additional workout specific achievements
        {
            "name": "Cardio Lover",
            "description": "Complete 10 cardio workouts",
            "icon": "FaRunning",
            "category": "workout",
            "requirement": 10
        },
        {
            "name": "Strength Master",
            "description": "Complete 10 strength workouts",
            "icon": "FaDumbbell",
            "category": "workout",
            "requirement": 10
        },
        {
            "name": "Morning Person",
            "description": "Complete 5 workouts before 9 AM",
            "icon": "FaSun",
            "category": "workout",
            "requirement": 5
        },
        {
            "name": "Night Owl",
            "description": "Complete 5 workouts after 8 PM",
            "icon": "FaMoon",
            "category": "workout",
            "requirement": 5
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
            created_count += 1
    
    # Commit changes
    db.commit()
    
    # Return the count of created achievements
    return created_count


@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(nutrition_router)
app.include_router(ai_workout_router)
app.include_router(custom_exercises_router)


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
                    superset_with=str(getattr(set_data, 'superset_with', None)) if getattr(set_data, 'superset_with', None) is not None else None,
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
                card_color="#dbeafe",
                show_profile_emoji=True,
                profile_emoji="🏋️‍♂️",
                emoji_animation="lift"
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
                "card_color": user_profile.card_color,
                "show_profile_emoji": user_profile.show_profile_emoji,
                "profile_emoji": user_profile.profile_emoji,
                "emoji_animation": user_profile.emoji_animation
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/user-profile")
def update_profile(
    profile_data: UserProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if username is being updated
        username_changed = False
        if hasattr(profile_data, 'username') and profile_data.username != user.username:
            # Check if new username is already taken
            existing_user = db.query(User).filter(
                User.username == profile_data.username,
                User.id != user.id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")
            username_changed = True

        # Update user fields
        for field, value in profile_data.dict(exclude_unset=True).items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)

        # If username was changed, create new access token
        response_data = {
            "username": user.username,
            "email": user.email,
            "height": user.height,
            "weight": user.weight,
            "age": user.age,
            "gender": user.gender,
            "fitness_goals": user.fitness_goals,
            "bio": user.bio
        }

        if username_changed:
            # Create new access token with updated username
            access_token = create_access_token(
                data={"sub": user.username},
                expires_delta=timedelta(days=7)  # Match your token expiry setting
            )
            response_data["access_token"] = access_token

        return response_data
    except HTTPException:
        raise
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
        "card_color": user_preferences.card_color,
        "show_profile_emoji": user_preferences.show_profile_emoji,
        "profile_emoji": user_preferences.profile_emoji,
        "emoji_animation": user_preferences.emoji_animation
    }


@app.patch("/user/settings")
def update_user_settings(
    settings_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's settings including goal weight and card color"""
    try:
        # Get or create user profile
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not user_profile:
            user_profile = UserProfile(user_id=user.id)
            db.add(user_profile)
        
        # Update fields from request
        if "goal_weight" in settings_data:
            if settings_data["goal_weight"] is not None:
                try:
                    user_profile.goal_weight = float(settings_data["goal_weight"])
                except (ValueError, TypeError):
                    raise HTTPException(status_code=400, detail="Invalid goal weight format")
            else:
                user_profile.goal_weight = None
                
        if "email_notifications" in settings_data:
            user_profile.email_notifications = bool(settings_data["email_notifications"])
            
        if "card_color" in settings_data:
            user_profile.card_color = settings_data["card_color"]
            
        if "use_custom_card_color" in settings_data:
            user_profile.use_custom_card_color = bool(settings_data["use_custom_card_color"])
                
        if "summary_frequency" in settings_data:
            user_profile.summary_frequency = settings_data["summary_frequency"]
            
        if "summary_day" in settings_data:
            user_profile.summary_day = settings_data["summary_day"]
            
        # Handle clear_premium_theme parameter
        if "clear_premium_theme" in settings_data and settings_data["clear_premium_theme"]:
            # Clear the premium theme by setting it to default
            user.premium_theme = "default"
        
        # Commit changes
        db.commit()
        db.refresh(user_profile)
        
        # Return updated settings
        return {
            "goal_weight": user_profile.goal_weight,
            "email_notifications": user_profile.email_notifications,
            "card_color": user_profile.card_color,
            "summary_frequency": user_profile.summary_frequency,
            "summary_day": user_profile.summary_day,
            "message": "Settings updated successfully"
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating settings: {str(e)}")


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
    
    # Notify admin about password change
    background_tasks.add_task(
        notify_admin_password_changed,
        user.id,
        user.email,
        user.username
    )

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
    try:
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

        # Calculate total duration from cardio exercises
        cardio_duration = db.query(func.sum(func.coalesce(Set.duration, 0)))\
            .join(Exercise)\
            .join(Workout)\
            .filter(Workout.user_id == user.id, Exercise.is_cardio == True)\
            .scalar() or 0
            
        # Convert to float if it's a Decimal
        cardio_duration = float(cardio_duration) if cardio_duration else 0

        # Calculate total duration from workout start/end times
        workout_duration = db.query(
            func.sum(
                func.extract('epoch', Workout.end_time) - 
                func.extract('epoch', Workout.start_time)
            ) / 60  # Convert seconds to minutes
        ).filter(
            Workout.user_id == user.id,
            Workout.start_time.isnot(None),
            Workout.end_time.isnot(None)
        ).scalar() or 0
        
        # Convert to float if it's a Decimal
        workout_duration = float(workout_duration) if workout_duration else 0

        # Total duration is the sum of both (now both are floats)
        total_duration = cardio_duration + workout_duration

        weight_progression = db.query(Workout.date, Workout.bodyweight)\
            .filter(Workout.user_id == user.id, Workout.bodyweight.isnot(None))\
            .order_by(desc(Workout.date))\
            .limit(5)\
            .all()

        weight_progression_data = [
            {
                "date": workout.date,
                "bodyweight": float(workout.bodyweight) if workout.bodyweight else None
            } for workout in weight_progression
        ]

        return WorkoutStatsResponse(
            total_workouts=total_workouts,
            favorite_exercise=favorite_exercise,
            last_workout=last_workout.date if last_workout else None,
            total_cardio_duration=round(total_duration, 2),  # Use total_duration instead of just cardio_duration
            weight_progression=weight_progression_data
        )
    except Exception as e:
        print(f"Error in get_workout_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching workout stats: {str(e)}")


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
                        superset_with=str(getattr(set_data, 'superset_with', None)) if getattr(set_data, 'superset_with', None) is not None else None,
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
                    superset_with=str(getattr(set_data, 'superset_with', None)) if getattr(set_data, 'superset_with', None) is not None else None,
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
    """Get all achievements"""
    try:
        achievements = db.query(Achievement).all()
        return achievements
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching achievements: {str(e)}")


@app.get("/user/achievements/progress")
def get_user_achievements_with_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all achievements with user's progress"""
    try:
        # Get all achievements
        achievements = db.query(Achievement).all()
        
        # Get user's current achievements
        user_achievements = {
            ua.achievement_id: ua 
            for ua in db.query(UserAchievement)
            .filter(UserAchievement.user_id == user.id)
            .all()
        }
        
        # Build response with progress
        result = []
        for achievement in achievements:
            user_achievement = user_achievements.get(achievement.id)
            
            # For admin users, automatically mark all achievements as completed
            if user.is_admin:
                progress = achievement.requirement
                is_achieved = True
                achieved_at = user_achievement.achieved_at if user_achievement else datetime.now(timezone.utc)
            else:
                # Set default values
                progress = 0
                is_achieved = False
                achieved_at = None
                
                # Update with actual values if user has this achievement
                if user_achievement:
                    progress = user_achievement.progress
                    is_achieved = user_achievement.achieved_at is not None
                    achieved_at = user_achievement.achieved_at
            
            # Create response object with achievement details and progress
            achievement_data = {
                "id": achievement.id,
                "name": achievement.name,
                "description": achievement.description,
                "category": achievement.category,
                "requirement": achievement.requirement,
                "icon": achievement.icon,
                "progress": progress,
                "is_achieved": is_achieved,
                "achieved_at": achieved_at
            }
            
            result.append(achievement_data)
        
        # Sort the achievements with achieved ones first, then by achievement ID
        result = sorted(result, key=lambda x: (not x["is_achieved"], x["id"]))
            
        return result
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting achievements progress: {str(e)}")


@app.post("/achievements/check")
async def check_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check and update user's achievement progress"""
    try:
        updated_count = 0
        newly_achieved = 0
        
        # Get all achievements
        achievements = db.query(Achievement).all()
        
        # Get user's current achievements
        user_achievements = {
            ua.achievement_id: ua 
            for ua in db.query(UserAchievement)
            .filter(UserAchievement.user_id == user.id)
            .all()
        }
        
        for achievement in achievements:
            was_achieved = False
            is_achieved = False
            progress = 0
            
            # Get or create user achievement
            user_achievement = user_achievements.get(achievement.id)
            if not user_achievement:
                user_achievement = UserAchievement(
                    user_id=user.id,
                    achievement_id=achievement.id,
                    progress=0,
                    achieved_at=None
                )
                db.add(user_achievement)
                db.flush()  # Ensure the object gets an ID
            else:
                was_achieved = user_achievement.achieved_at is not None
            
            # For admin users, automatically mark all achievements as completed
            if user.is_admin:
                progress = achievement.requirement
                is_achieved = True
            else:
                # Check different achievement types
                if achievement.category == "profile":
                    # Profile completion achievements
                    profile_fields = [
                        user.height is not None,
                        user.weight is not None,
                        user.age is not None,
                        user.gender is not None and user.gender.strip() != "",
                        user.fitness_goals is not None and user.fitness_goals.strip() != "",
                        user.bio is not None and user.bio.strip() != ""
                    ]
                    progress = sum(1 for field in profile_fields if field)
                    is_achieved = progress >= achievement.requirement
                
                elif achievement.category == "workout":
                    # Workout related achievements
                    total_workouts = db.query(Workout).filter(
                        Workout.user_id == user.id,
                        Workout.is_template.is_(False)
                    ).count()
                    progress = total_workouts
                    is_achieved = progress >= achievement.requirement
                
                elif achievement.category == "variety":
                    # Exercise variety achievements
                    unique_exercises = db.query(Exercise.name).distinct().join(
                        Workout, Exercise.workout_id == Workout.id
                    ).filter(
                        Workout.user_id == user.id,
                        Workout.is_template.is_(False)
                    ).count()
                    progress = unique_exercises
                    is_achieved = progress >= achievement.requirement
                
                elif achievement.category == "streak":
                    # Get the user's current streak from the streak endpoint
                    current_streak = 0
                    try:
                        streak_data = db.query(UserProfile).filter(
                            UserProfile.user_id == user.id
                    ).first()
                        if streak_data and streak_data.current_streak:
                            current_streak = streak_data.current_streak
                    except Exception:
                        # Suppress error logging for streak data
                        pass
                    
                    progress = current_streak
                    is_achieved = progress >= achievement.requirement
            
            # Update user achievement
            user_achievement.progress = progress
            
            if is_achieved and not was_achieved:
                user_achievement.achieved_at = datetime.now(timezone.utc)
                user_achievement.earned_at = datetime.now(timezone.utc)
                user_achievement.is_read = False
                user_achievement.title = achievement.name
                user_achievement.description = achievement.description
                newly_achieved += 1
                
                # Create notification for new achievement
                try:
                    notification = Notification(
                        user_id=user.id,
                        type="achievement",
                        title=f"Achievement Unlocked: {achievement.name}",
                        message=achievement.description,
                        icon=achievement.icon or "trophy",
                        is_read=False,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(notification)
                except Exception:
                    # Suppress error logging for notification creation
                    pass
            
            updated_count += 1
        
        # Commit all changes
        db.commit()
        
        # Return updated achievements
        return {
            "message": f"Updated {updated_count} achievements, {newly_achieved} newly achieved",
            "updated": updated_count,
            "newly_achieved": newly_achieved,
            "achievements": [
                {
                    "id": achievement.id,
                    "name": achievement.name,
                    "description": achievement.description,
                    "category": achievement.category,
                    "requirement": achievement.requirement,
                    "icon": achievement.icon,
                    "progress": user_achievements[achievement.id].progress if achievement.id in user_achievements else 0,
                    "is_achieved": user_achievements[achievement.id].achieved_at is not None if achievement.id in user_achievements else False,
                    "achieved_at": user_achievements[achievement.id].achieved_at if achievement.id in user_achievements else None
                }
                for achievement in achievements
            ]
        }
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error checking achievements: {str(e)}")


@app.get("/user/badges")
def get_user_badges(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's selected badges for profile display"""
    try:
        # Get user profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            # Create default profile if not exists
            profile = UserProfile(user_id=user.id, selected_badges=[])
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Return badges (ensure it's a list even if None in database)
        return {"badges": profile.selected_badges or []}
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching user badges: {str(e)}")


@app.post("/user/badges")
def update_user_badges(
    badge_selection: BadgeSelectionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's selected badges for profile display"""
    try:
        # Validate badges (max 3)
        if len(badge_selection.badges) > 3:
            raise HTTPException(status_code=400, detail="Maximum 3 badges can be selected")
        
        # Get or create user profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            profile = UserProfile(user_id=user.id, selected_badges=badge_selection.badges)
            db.add(profile)
        else:
            profile.selected_badges = badge_selection.badges
        db.commit()
        db.refresh(profile)
        
        return {"message": "Badges updated successfully", "badges": profile.selected_badges}
    except HTTPException:
        raise
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating user badges: {str(e)}")


@app.get("/api/last-saved-routine")
def get_last_saved_routine(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's most recently saved workout routine"""
    try:
        # First try to find a routine (which links to a template workout)
        routine = db.query(Routine).filter(
            Routine.user_id == user.id
        ).order_by(Routine.created_at.desc()).first()
        
        # Check if we found a routine
        if not routine:
            return JSONResponse(status_code=404, content={"message": "No saved routines found"})
            
        if routine and routine.workout_id:
            # If we have a routine, get the associated workout template
            last_workout = db.query(Workout).get(routine.workout_id)
            
            # If the workout doesn't exist for some reason
            if not last_workout:
                return JSONResponse(status_code=404, content={"message": "Associated workout not found"})
        else:
            # No workout ID in routine
            return JSONResponse(status_code=404, content={"message": "Routine has no associated workout"})
            
        # Get exercises for this workout
        exercises = db.query(Exercise).filter(
            Exercise.workout_id == last_workout.id
        ).all() or []  # Ensure exercises is at least an empty list
        
        # Format response with safe handling of nested attributes
        result = {
            "id": last_workout.id,
            "name": last_workout.name,
            "description": getattr(last_workout, "description", None),
            "created_at": getattr(last_workout, "created_at", 
                           getattr(last_workout, "date", 
                           getattr(routine, "created_at", datetime.now(timezone.utc)))),
            "exercises": []
        }
        
        # Only process exercises if they exist
        for exercise in exercises:
            # Create exercise data with empty sets as default
            ex_data = {
                "id": exercise.id,
                "name": exercise.name,
                "category": exercise.category,
                "is_cardio": exercise.is_cardio,
                "sets": []
            }
            
            # Safely get the sets for this exercise
            try:
                # Get the sets directly from the database to avoid lazy loading issues
                sets = db.query(Set).filter(Set.exercise_id == exercise.id).all() or []
                
                for s in sets:
                    ex_data["sets"].append({
                        "id": s.id,
                        "weight": s.weight,
                        "reps": s.reps,
                        "distance": s.distance,
                        "duration": s.duration,
                        "notes": s.notes
                    })
            except Exception as set_error:
                # Log the error but continue processing other exercises
                print(f"Error processing sets for exercise {exercise.id}: {str(set_error)}")
                # Don't let set errors break the response
                continue
            
            result["exercises"].append(ex_data)
        
        return result
    except Exception as e:
        import traceback
        print(f"Error fetching last saved routine: {str(e)}")
        traceback.print_exc()
        # Return a JSON response instead of raising an exception
        return JSONResponse(
            status_code=500,
            content={"message": "Error fetching last saved routine", "detail": str(e)}
        )


@app.get("/api/workout-preferences")
def get_workout_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's workout preferences"""
    try:
        # Get workout preferences from the WorkoutPreferences model
        preferences = db.query(WorkoutPreferences).filter(
            WorkoutPreferences.user_id == user.id
        ).first()
        
        # Get user profile for other preferences
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not preferences:
            # Create default preferences
            preferences = WorkoutPreferences(
                user_id=user.id,
                workout_frequency_goal=3  # Default to 3 days per week
            )
            db.add(preferences)
            db.commit()
            db.refresh(preferences)
        
        if not profile:
            # Create default profile
            profile = UserProfile(
                user_id=user.id,
                goal_weight=None
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Return preferences
        return {
            "workout_frequency_goal": preferences.workout_frequency_goal or 3,
            "goal_weight": profile.goal_weight
        }
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching workout preferences: {str(e)}")


@app.get("/workout-streak")
def get_workout_streak(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current workout streak"""
    try:
        # Get user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()

        if not profile:
            # Create default profile
            profile = UserProfile(
                user_id=user.id,
                current_streak=0,
                best_streak=0,
                last_workout_date=None
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Get workout preferences for frequency goal
        preferences = db.query(WorkoutPreferences).filter(
            WorkoutPreferences.user_id == user.id
        ).first()
        
        frequency_goal = 3  # Default
        if preferences and preferences.workout_frequency_goal:
            frequency_goal = preferences.workout_frequency_goal
        
        # Return streak info
        return {
            "streak": profile.current_streak or 0,
            "best_streak": profile.best_streak or 0,
            "last_workout_date": profile.last_workout_date,
            "frequency_goal": frequency_goal
        }
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching workout streak: {str(e)}")


@app.get("/user/themes")
def get_user_themes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's theme settings"""
    try:
        # Get user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not profile:
            # Create default profile
            profile = UserProfile(
                user_id=user.id,
                theme_mode="light",
                premium_theme="default",
                unlocked_themes=["default"]
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Prepare unlocked themes (ensure it's a list)
        unlocked_themes = profile.unlocked_themes
        if not unlocked_themes or not isinstance(unlocked_themes, list):
            unlocked_themes = ["default"]
        
        # Return theme settings
        return {
            "theme": profile.theme_mode or "light",
            "premium_theme": profile.premium_theme or "default",
            "unlocked_themes": unlocked_themes
        }
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching user themes: {str(e)}")


@app.post("/user/themes/mode")
def update_theme_mode(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's theme mode (light/dark)"""
    try:
        # Validate theme mode
        theme_mode = theme_data.get("theme_mode")
        if theme_mode not in ["light", "dark"]:
            raise HTTPException(status_code=400, detail="Invalid theme mode. Must be 'light' or 'dark'")
        
        # Get or create user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not profile:
            profile = UserProfile(
                user_id=user.id,
                theme_mode=theme_mode
            )
            db.add(profile)
        else:
            profile.theme_mode = theme_mode
        db.commit()
        db.refresh(profile)
        
        return {"message": "Theme mode updated successfully", "theme_mode": profile.theme_mode}
    except HTTPException:
        raise
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating theme mode: {str(e)}")


@app.post("/user/themes/premium")
def update_premium_theme(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's premium theme"""
    try:
        # Get theme key
        theme_key = theme_data.get("theme_key")
        if not theme_key:
            raise HTTPException(status_code=400, detail="Theme key is required")
        
        # Get or create user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        # Check if user has unlocked this theme
        if profile and profile.unlocked_themes and isinstance(profile.unlocked_themes, list):
            if theme_key != "default" and theme_key not in profile.unlocked_themes and not user.is_admin:
                raise HTTPException(status_code=403, detail="You haven't unlocked this theme")
        
        if not profile:
            profile = UserProfile(
                user_id=user.id,
                premium_theme=theme_key
            )
            db.add(profile)
        else:
            profile.premium_theme = theme_key
        db.commit()
        db.refresh(profile)
        
        return {
            "message": "Premium theme updated successfully", 
            "premium_theme": profile.premium_theme
        }
    except HTTPException:
        raise
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating premium theme: {str(e)}")


@app.post("/user/themes/unlock")
def unlock_theme(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock a premium theme for the user"""
    try:
        # Get theme key
        theme_key = theme_data.get("theme_key")
        if not theme_key:
            raise HTTPException(status_code=400, detail="Theme key is required")
        
        # Get or create user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not profile:
            profile = UserProfile(
                user_id=user.id,
                unlocked_themes=["default", theme_key]
            )
            db.add(profile)
        else:
            # Ensure unlocked_themes is a list
            if not profile.unlocked_themes or not isinstance(profile.unlocked_themes, list):
                profile.unlocked_themes = ["default"]
            
            # Only add if not already unlocked
            if theme_key not in profile.unlocked_themes:
                profile.unlocked_themes.append(theme_key)
        db.commit()
        db.refresh(profile)
        
        return {
            "message": f"Theme '{theme_key}' unlocked successfully", 
            "unlocked_themes": profile.unlocked_themes
        }
    except HTTPException:
        raise
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error unlocking theme: {str(e)}")


@app.post("/user/themes/unlock-all")
def unlock_all_themes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlock all premium themes for the user"""
    try:
        # Define all available themes
        all_themes = ["default", "cosmos", "forest", "sunset", "ocean", "royal"]
        
        # Get or create user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not profile:
            profile = UserProfile(
                user_id=user.id,
                unlocked_themes=all_themes
            )
            db.add(profile)
        else:
            profile.unlocked_themes = all_themes
        db.commit()
        db.refresh(profile)
        
        return {
            "message": "All themes unlocked successfully", 
            "unlocked_themes": profile.unlocked_themes
        }
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error unlocking all themes: {str(e)}")


@app.post("/user/themes/check-access")
def check_theme_access(
    theme_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has access to a specific theme"""
    try:
        # Get theme key
        theme_key = theme_data.get("theme_key")
        if not theme_key:
            raise HTTPException(status_code=400, detail="Theme key is required")
        
        # Admin always has access to all themes
        if user.is_admin:
            return {"has_access": True}
        
        # Default theme is accessible to everyone
        if theme_key == "default":
            return {"has_access": True}
        
        # Get user profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id
        ).first()
        
        if not profile or not profile.unlocked_themes:
            return {"has_access": False}
        
        # Check if theme is in unlocked themes
        has_access = theme_key in profile.unlocked_themes
        
        return {"has_access": has_access}
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error checking theme access: {str(e)}")

# Add these endpoints after the themes endpoints:

@app.get("/user/rewards/claimed")
def get_claimed_rewards(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's claimed rewards"""
    try:
        # Get user rewards
        rewards = db.query(UserReward).filter(
            UserReward.user_id == user.id
        ).all()
        
        # Extract reward IDs
        reward_ids = [reward.reward_id for reward in rewards]
        
        return reward_ids
    except Exception as e:
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching claimed rewards: {str(e)}")


@app.post("/user/rewards/claim")
def claim_reward(
    reward_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Claim a reward for the user"""
    try:
        # Get reward ID
        reward_id = reward_data.get("reward_id")
        if not reward_id:
            raise HTTPException(status_code=400, detail="Reward ID is required")
        
        # Check if reward is already claimed
        existing_reward = db.query(UserReward).filter(
            UserReward.user_id == user.id,
            UserReward.reward_id == reward_id
        ).first()
        
        if existing_reward:
            return {"message": "Reward already claimed", "claimed_at": existing_reward.claimed_at}
        
        # Create new reward claim
        new_reward = UserReward(
            user_id=user.id,
            reward_id=reward_id,
            claimed_at=datetime.now(timezone.utc)
        )
        db.add(new_reward)
        
        # Check for specific rewards to unlock additional features
        if reward_id == "reward-1":  # Premium Themes
            # Get user profile
            profile = db.query(UserProfile).filter(
                UserProfile.user_id == user.id
            ).first()
            
            if not profile:
                profile = UserProfile(user_id=user.id)
                db.add(profile)
            
            # Set unlocked themes
            profile.unlocked_themes = ["default", "cosmos", "forest", "sunset", "ocean", "royal"]
            
        elif reward_id == "reward-2":  # Expert Workout Templates
            # Unlock workout templates
            profile = db.query(UserProfile).filter(
                UserProfile.user_id == user.id
            ).first()
            
            if not profile:
                profile = UserProfile(user_id=user.id)
                db.add(profile)
            
            profile.workout_templates_unlocked = True
            
        elif reward_id == "reward-3":  # Stats Analysis
            # Unlock advanced stats
            profile = db.query(UserProfile).filter(
                UserProfile.user_id == user.id
            ).first()
            
            if not profile:
                profile = UserProfile(user_id=user.id)
                db.add(profile)
            
            profile.stats_features_unlocked = True
        db.commit()
        
        # Create notification for claimed reward
        try:
            notification = Notification(
                user_id=user.id,
                type="reward",
                message=f"You claimed a new reward!",
                icon="gift",
                read=False,
                created_at=datetime.now(timezone.utc),
                title=f"Reward Claimed: {reward_id}"
            )
            db.add(notification)
            db.commit()
        except Exception:
            # Don't fail if notification creation fails
            pass
        
        return {"message": "Reward claimed successfully", "reward_id": reward_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error claiming reward: {str(e)}")

# Add these endpoints:

@app.post("/achievements/create-defaults")
def create_default_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create default achievements if they don't exist"""
    try:
        # Check if there are any achievements in the system
        existing_count = db.query(Achievement).count()
        
        # Allow creation if no achievements exist, regardless of admin status
        if existing_count == 0:
            # Call the function to initialize achievements
            created_count = initialize_achievements(db)
            return {"message": f"Created {created_count} default achievements", "count": created_count}
        
        # If achievements already exist and user is not an admin, return a success=false response
        # instead of raising an exception
        if not user.is_admin:
            return {
                "message": "Default achievements already exist. Only administrators can recreate them.",
                "count": 0,
                "success": False
            }
        
        # If admin, allow recreation of achievements
        created_count = initialize_achievements(db)
        return {"message": f"Created {created_count} default achievements", "count": created_count}
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating default achievements: {str(e)}")


@app.post("/achievements/cleanup-duplicates")
def cleanup_duplicate_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean up duplicate user achievements"""
    try:
        # Only allow admins or the user themselves
        if not user.is_admin and user.id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to perform this action")
        
        # Find duplicate user achievements (same user_id and achievement_id)
        # This query finds all duplicates
        duplicates = db.query(
            UserAchievement.user_id, 
            UserAchievement.achievement_id, 
            func.count(UserAchievement.id).label("count")
        ).group_by(
            UserAchievement.user_id, 
            UserAchievement.achievement_id
        ).having(
            func.count(UserAchievement.id) > 1
        ).all()
        
        removed_count = 0
        
        # Process each set of duplicates
        for user_id, achievement_id, count in duplicates:
            # Find all duplicates for this user-achievement pair
            user_duplicates = db.query(UserAchievement).filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            ).order_by(
                UserAchievement.achieved_at.asc() if UserAchievement.achieved_at is not None else text("id") 
            ).all()
            
            # Keep the one with the highest progress or earliest achievement date
            kept = None
            for duplicate in user_duplicates:
                if kept is None or (
                    (duplicate.achieved_at is not None and (kept.achieved_at is None or duplicate.achieved_at < kept.achieved_at)) or
                    (duplicate.progress > kept.progress)
                ):
                    kept = duplicate
            
            # Delete all except the one we're keeping
            for duplicate in user_duplicates:
                if duplicate.id != kept.id:
                    db.delete(duplicate)
                    removed_count += 1
        db.commit()
        
        return {"message": f"Removed {removed_count} duplicate achievements", "removed": removed_count}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error cleaning up duplicates: {str(e)}")


@app.post("/achievements/force-cleanup-duplicates")
def force_cleanup_duplicate_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force cleanup of all duplicate user achievements (admin only)"""
    try:
        # Only allow admins
        if not user.is_admin:
            raise HTTPException(status_code=403, detail="Only administrators can force cleanup duplicates")
        
        # More aggressive approach - delete all but the most recently created duplicates
        removed_count = 0
        
        # Get all achievements
        all_achievements = db.query(Achievement).all()
        
        for achievement in all_achievements:
            # For each user that has this achievement
            users_with_achievement = db.query(UserAchievement.user_id).filter(
                UserAchievement.achievement_id == achievement.id
            ).distinct().all()
            
            for (user_id,) in users_with_achievement:
                # Get all user's records for this achievement
                user_entries = db.query(UserAchievement).filter(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement.id
                ).order_by(
                    # Sort by progress DESC, then by achievement date ASC if achieved
                    UserAchievement.progress.desc(),
                    UserAchievement.achieved_at.asc() if UserAchievement.achieved_at is not None else text("id")
                ).all()
                
                # If more than one record exists, delete all except the first (best) one
                if len(user_entries) > 1:
                    for entry in user_entries[1:]:
                        db.delete(entry)
                        removed_count += 1
        db.commit()
        
        return {"message": f"Force removed {removed_count} duplicate achievements", "removed": removed_count}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error force cleaning up duplicates: {str(e)}")

@app.get("/api/achievements/new")
def get_new_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's new (unread) achievements"""
    try:
        # Find user achievements that haven't been read yet
        new_achievements = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id,
            UserAchievement.is_read == False,
            UserAchievement.achieved_at.is_not(None)  # Only consider achieved ones
        ).order_by(
            UserAchievement.achieved_at.desc()
        ).all()
        
        if not new_achievements:
            return []
        
        # Get the actual achievement data
        result = []
        for user_achievement in new_achievements:
            # Get the achievement data
            achievement = db.query(Achievement).filter(
                Achievement.id == user_achievement.achievement_id
            ).first()
            
            if achievement:
                result.append({
                    "id": achievement.id,
                    "name": achievement.name,
                    "description": achievement.description,
                    "icon": achievement.icon,
                    "category": achievement.category,
                    "achieved_at": user_achievement.achieved_at,
                    "is_read": user_achievement.is_read
                })
                
                # Mark as read
                user_achievement.is_read = True
        
        # Commit the changes to mark achievements as read
        db.commit()
        
        return result
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching new achievements: {str(e)}")

# ================ ROUTINE FOLDERS ENDPOINTS ================

@app.get("/routine-folders", response_model=List[RoutineFolderResponse])
def get_routine_folders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all routine folders for the current user"""
    try:
        folders = db.query(RoutineFolder).filter(
            RoutineFolder.user_id == user.id
        ).order_by(RoutineFolder.name).all()
        
        return folders
    except Exception as e:
        print(f"Error fetching routine folders: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching routine folders: {str(e)}"
        )


@app.post("/routine-folders", response_model=RoutineFolderResponse)
def create_routine_folder(
    folder_data: RoutineFolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new routine folder"""
    try:
        # Check if folder with same name already exists
        existing_folder = db.query(RoutineFolder).filter(
            RoutineFolder.user_id == user.id,
            func.lower(RoutineFolder.name) == func.lower(folder_data.name)
        ).first()
        
        if existing_folder:
            raise HTTPException(
                status_code=400,
                detail="A folder with this name already exists"
            )
        
        # Create new folder
        new_folder = RoutineFolder(
            name=folder_data.name,
            user_id=user.id,
            color=folder_data.color
        )
        db.add(new_folder)
        db.commit()
        db.refresh(new_folder)
        
        return new_folder
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating routine folder: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating routine folder: {str(e)}"
        )


@app.put("/routine-folders/{folder_id}", response_model=RoutineFolderResponse)
def update_routine_folder(
    folder_id: int,
    folder_data: RoutineFolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a routine folder"""
    try:
        folder = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id,
            RoutineFolder.user_id == user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Check if another folder with the same name exists
        existing_folder = db.query(RoutineFolder).filter(
            RoutineFolder.user_id == user.id,
            func.lower(RoutineFolder.name) == func.lower(folder_data.name),
            RoutineFolder.id != folder_id
        ).first()
        
        if existing_folder:
            raise HTTPException(
                status_code=400,
                detail="Another folder with this name already exists"
            )
        
        # Update folder
        folder.name = folder_data.name
        if folder_data.color is not None:
            folder.color = folder_data.color
        
        db.commit()
        db.refresh(folder)
        
        return folder
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating routine folder: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error updating routine folder: {str(e)}"
        )


@app.delete("/routine-folders/{folder_id}")
def delete_routine_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a routine folder"""
    try:
        folder = db.query(RoutineFolder).filter(
            RoutineFolder.id == folder_id,
            RoutineFolder.user_id == user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Update routines that are in this folder to have no folder
        db.query(Routine).filter(
            Routine.folder_id == folder_id
        ).update({Routine.folder_id: None}, synchronize_session=False)
        
        # Delete the folder
        db.delete(folder)
        db.commit()
        
        return {"message": "Folder deleted successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting routine folder: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting routine folder: {str(e)}"
        )


@app.put("/routines/{routine_id}/move-to-folder")
def move_routine_to_folder(
    routine_id: int,
    folder_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Move a routine to a folder"""
    try:
        routine = db.query(Routine).filter(
            Routine.id == routine_id,
            Routine.user_id == user.id
        ).first()
        
        if not routine:
            raise HTTPException(status_code=404, detail="Routine not found")
        
        # Get folder_id from request body
        folder_id = folder_data.get("folder_id")
        
        # If folder_id is not None, verify folder exists and belongs to user
        if folder_id is not None:
            folder = db.query(RoutineFolder).filter(
                RoutineFolder.id == folder_id,
                RoutineFolder.user_id == user.id
            ).first()
            
            if not folder:
                raise HTTPException(status_code=404, detail="Folder not found")
        
        # Update routine
        routine.folder_id = folder_id
        db.commit()
        
        return {"message": "Routine moved successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error moving routine to folder: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error moving routine to folder: {str(e)}"
        )

@app.post("/user/workout-frequency")
def update_workout_frequency(
    frequency_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get or create user workout preferences
        workout_prefs = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).first()
        
        if not workout_prefs:
            workout_prefs = WorkoutPreferences(user_id=user.id)
            db.add(workout_prefs)
        
        # Update frequency goal
        if "workout_frequency_goal" in frequency_data:
            frequency = frequency_data["workout_frequency_goal"]
            # Validate input (must be between 1-7)
            if frequency is not None and (not isinstance(frequency, int) or frequency < 1 or frequency > 7):
                raise HTTPException(status_code=400, detail="Workout frequency goal must be between 1 and 7")
            workout_prefs.workout_frequency_goal = frequency
        
        db.commit()
        
        return {
            "workout_frequency_goal": workout_prefs.workout_frequency_goal,
            "message": "Workout frequency goal updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating workout frequency: {str(e)}")


# Exercise Memory Endpoints

@app.get("/user/exercise-memory")
def get_exercise_memory(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all saved exercise memory values for the current user"""
    try:
        memory_entries = db.query(ExerciseMemory).filter(ExerciseMemory.user_id == user.id).all()
        
        # Convert to dictionary format for easier frontend usage, using exercise name as key
        memory_dict = {}
        for entry in memory_entries:
            # Create different memory structure based on whether it's a strength or cardio exercise
            if entry.weight is not None or entry.reps is not None:
                # Strength exercise
                memory_dict[entry.exercise_name] = {
                    "weight": entry.weight,
                    "reps": entry.reps,
                    "notes": entry.notes
                }
            elif entry.distance is not None or entry.duration is not None or entry.intensity is not None:
                # Cardio exercise
                memory_dict[entry.exercise_name] = {
                    "distance": entry.distance,
                    "duration": entry.duration,
                    "intensity": entry.intensity,
                    "notes": entry.notes
                }
        
        return memory_dict
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exercise memory: {str(e)}")


@app.patch("/user/exercise-memory")
def update_exercise_memory(
    memory_data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update exercise memory values for the current user"""
    try:
        updated_entries = []
        
        # Process each exercise in the memory data
        for exercise_name, values in memory_data.items():
            # Find existing memory entry or create new one
            memory_entry = db.query(ExerciseMemory).filter(
                ExerciseMemory.user_id == user.id,
                ExerciseMemory.exercise_name == exercise_name
            ).first()
            
            if not memory_entry:
                memory_entry = ExerciseMemory(
                    user_id=user.id,
                    exercise_name=exercise_name
                )
                db.add(memory_entry)
            
            # Update with new values
            if 'weight' in values:
                memory_entry.weight = values['weight']
            if 'reps' in values:
                memory_entry.reps = values['reps']
            if 'distance' in values:
                memory_entry.distance = values['distance']
            if 'duration' in values:
                memory_entry.duration = values['duration']
            if 'intensity' in values:
                memory_entry.intensity = values['intensity']
            if 'notes' in values:
                memory_entry.notes = values['notes']
            
            updated_entries.append(exercise_name)
        
        db.commit()
        
        return {
            "message": f"Updated memory for {len(updated_entries)} exercises",
            "updated_exercises": updated_entries
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating exercise memory: {str(e)}")


@app.delete("/user/exercise-memory/{exercise_name}")
def delete_exercise_memory(
    exercise_name: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific exercise memory entry"""
    try:
        memory_entry = db.query(ExerciseMemory).filter(
            ExerciseMemory.user_id == user.id,
            ExerciseMemory.exercise_name == exercise_name
        ).first()
        
        if not memory_entry:
            return {"message": f"No memory found for exercise: {exercise_name}"}
        
        db.delete(memory_entry)
        db.commit()
        
        return {"message": f"Memory for exercise '{exercise_name}' deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting exercise memory: {str(e)}")


@app.delete("/user/exercise-memory")
def delete_all_exercise_memory(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all exercise memory entries for the current user"""
    try:
        memory_count = db.query(ExerciseMemory).filter(
            ExerciseMemory.user_id == user.id
        ).delete()
        
        db.commit()
        
        return {"message": f"Deleted {memory_count} exercise memory entries"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting exercise memory: {str(e)}")
