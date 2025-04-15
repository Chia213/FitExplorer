from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON as PGJSON
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from datetime import datetime, timezone
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    is_admin = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    deletion_token = Column(String, nullable=True)
    deletion_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    allow_multiple_sessions = Column(Boolean, default=False)
    
    # Add new profile fields
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    fitness_goals = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    saved_programs = relationship(
        "SavedWorkoutProgram",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    workouts = relationship(
        "Workout", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    custom_exercises = relationship(
        "CustomExercise", back_populates="user", cascade="all, delete-orphan")
    routines = relationship(
        "Routine", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    workout_preferences = relationship(
        "WorkoutPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    admin_settings_updates = relationship(
        "AdminSettings", back_populates="updated_by_user", cascade="all, delete-orphan"
    )
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    nutrition_meals = relationship("NutritionMeal", back_populates="user", cascade="all, delete-orphan")
    nutrition_goal = relationship("NutritionGoal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    rewards = relationship("UserReward", back_populates="user", cascade="all, delete-orphan", lazy="noload", overlaps="rewards")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    goal_weight = Column(Float, nullable=True)
    email_notifications = Column(Boolean, default=True)
    summary_frequency = Column(String, nullable=True)
    summary_day = Column(String, nullable=True)
    card_color = Column(String, default="#dbeafe")
    use_custom_card_color = Column(Boolean, default=False)
    workout_templates_unlocked = Column(Boolean, default=False)
    stats_features_unlocked = Column(Boolean, default=False)
    achievement_alerts = Column(Boolean, default=True)
    all_notifications_enabled = Column(Boolean, default=True)
    # Theme-related fields
    theme_mode = Column(String, default="light")  # light or dark
    premium_theme = Column(String, default="default")  # theme key/name
    unlocked_themes = Column(JSON, default=lambda: ["default"])  # list of unlocked theme keys
    selected_badges = Column(JSON, default=lambda: [])  # IDs of selected achievement badges for profile display
    
    # Add these missing fields
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_workout_date = Column(DateTime, nullable=True)
    frequency_goal = Column(Integer, nullable=True)  # For workout frequency goal

    user = relationship("User", back_populates="profile")

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    bodyweight = Column(Float, nullable=True)
    weight_unit = Column(String, default="kg")
    notes = Column(String, nullable=True)
    is_template = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="workouts")
    exercises = relationship("Exercise", back_populates="workout", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="workout", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_cardio = Column(Boolean, default=False)
    workout_id = Column(Integer, ForeignKey(
        "workouts.id", ondelete="CASCADE"), nullable=False)

    workout = relationship("Workout", back_populates="exercises")
    sets = relationship("Set", back_populates="exercise",
                        cascade="all, delete-orphan")


class Set(Base):
    __tablename__ = "sets"

    id = Column(Integer, primary_key=True, index=True)
    weight = Column(Float, nullable=True)
    reps = Column(Integer, nullable=True)
    distance = Column(Float, nullable=True)
    duration = Column(Float, nullable=True)
    intensity = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    exercise_id = Column(Integer, ForeignKey(
        "exercises.id", ondelete="CASCADE"), nullable=False)
    order = Column(Integer, nullable=False, default=0)
    
    # Set type flags
    is_warmup = Column(Boolean, default=False)
    is_drop_set = Column(Boolean, default=False)
    is_superset = Column(Boolean, default=False)
    is_amrap = Column(Boolean, default=False)
    is_restpause = Column(Boolean, default=False)
    is_pyramid = Column(Boolean, default=False)
    is_giant = Column(Boolean, default=False)
    
    # Additional set properties
    drop_number = Column(Integer, nullable=True)
    original_weight = Column(Float, nullable=True)
    superset_with = Column(String, nullable=True)
    rest_pauses = Column(Integer, nullable=True)
    pyramid_type = Column(String, nullable=True)
    pyramid_step = Column(Integer, nullable=True)
    giant_with = Column(JSON, nullable=True)
    
    exercise = relationship("Exercise", back_populates="sets")


class CustomExercise(Base):
    __tablename__ = "custom_exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="custom_exercises")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    weight_unit = Column(String, default="kg")
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    workout_id = Column(Integer, ForeignKey(
        "workouts.id", ondelete="CASCADE"), nullable=True)
    folder_id = Column(Integer, ForeignKey(
        "routine_folders.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    folder = relationship("RoutineFolder", back_populates="routines")
    user = relationship("User", back_populates="routines")
    workout = relationship("Workout", back_populates="routines")


class RoutineFolder(Base):
    __tablename__ = "routine_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    color = Column(String, nullable=True)

    user = relationship("User", back_populates="routine_folders")
    routines = relationship("Routine", back_populates="folder")

    User.routine_folders = relationship(
        "RoutineFolder", back_populates="user", cascade="all, delete-orphan")


class SavedWorkoutProgram(Base):
    __tablename__ = "saved_workout_programs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, default="Workout Program")
    description = Column(String, default="")
    category = Column(String, default="General")
    program_data = Column(JSON)  # Use JSON column type instead of String
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    current_week = Column(Integer, default=1)
    completed_weeks = Column(JSON)  # Use JSON column type for lists
    exercise_weights = Column(JSON, nullable=True)  # Store as JSON
    exercise_notes = Column(JSON, nullable=True)    # Store as JSON
    weight_unit = Column(String, default="kg")

    user = relationship("User", back_populates="saved_programs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., "workout_completed", "profile_updated"
    icon = Column(String, default="bell")  # Icon name for the frontend
    icon_color = Column(String, default="text-blue-500")  # Tailwind CSS color class
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class WorkoutPreferences(Base):
    __tablename__ = "workout_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    last_bodyweight = Column(Float, nullable=True)
    last_weight_unit = Column(String, default="kg")
    last_exercises = Column(JSON, nullable=True)  # Store last used exercises and their sets
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    workout_frequency_goal = Column(Integer, nullable=True)  # Number of workouts per week (1-7)

    user = relationship("User", back_populates="workout_preferences")


class AdminSettings(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    auto_verify_users = Column(Boolean, default=False)
    require_email_verification = Column(Boolean, default=True)
    require_2fa_admins = Column(Boolean, default=True)
    session_timeout = Column(Integer, default=60)  # minutes
    backup_frequency = Column(String, default="daily")  # daily, weekly, monthly
    data_retention_months = Column(Integer, default=24)  # 0 for forever
    notify_new_users = Column(Boolean, default=True)
    notify_system_alerts = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.now(timezone.utc))
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_by_user = relationship("User", back_populates="admin_settings_updates")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)  # Icon name from react-icons
    category = Column(String, nullable=False)  # e.g., 'workout', 'streak', 'personal'
    requirement = Column(Integer, nullable=False)  # e.g., number of workouts needed
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

    users = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    achieved_at = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Integer, default=0)  # Track progress towards achievement
    reward_claimed = Column(Boolean, default=False)  # Track if reward has been claimed
    is_read = Column(Boolean, default=False)  # Track if achievement notification has been read
    achievement_type = Column(String, default="achievement")  # Type of achievement
    title = Column(String, nullable=True)  # Achievement title (can be separate from name)
    description = Column(String, nullable=True)  # Achievement description (can override)
    earned_at = Column(DateTime(timezone=True), nullable=True)  # Time when earned (can be different from achieved_at)
    icon = Column(String, nullable=True)  # Custom icon override
    level = Column(Integer, default=1)  # Achievement level

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="users")


class NutritionMeal(Base):
    __tablename__ = "meals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD format
    time = Column(String, nullable=False)  # HH:MM format
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="nutrition_meals")
    foods = relationship("NutritionFood", back_populates="meal", cascade="all, delete-orphan")


class NutritionFood(Base):
    __tablename__ = "meal_foods"
    
    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, name="food_name", nullable=False)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    serving_size = Column(String, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    
    # Relationships
    meal = relationship("NutritionMeal", back_populates="foods")


class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    calories = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    carbs = Column(Integer, nullable=False)
    fat = Column(Integer, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="nutrition_goal")


class CommonFood(Base):
    __tablename__ = "common_foods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    serving_size = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    
    # Optional fields for additional nutritional information
    fiber = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    food_group = Column(String, nullable=True)  # e.g., "Fruits", "Vegetables", "Proteins", etc.
    brand = Column(String, nullable=True)  # For branded products


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    level = Column(String, nullable=False)
    category = Column(String, nullable=False)
    creator = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    is_premium = Column(Boolean, default=False)
    workouts = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))


class UserUnlockedTemplates(Base):
    __tablename__ = "user_unlocked_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    template_ids = Column(JSON, nullable=False, default=lambda: [])  # Array of template IDs
    last_updated = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    user = relationship("User", backref="unlocked_templates")


class UserReward(Base):
    __tablename__ = "user_rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_id = Column(String, nullable=False)
    claimed_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

    user = relationship("User", back_populates="rewards")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    device_info = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions")
