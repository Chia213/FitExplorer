from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from datetime import datetime, timezone

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
    verification_token_expires_at = Column(DateTime, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    deletion_token = Column(String, nullable=True)
    deletion_token_expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

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


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    goal_weight = Column(Float, nullable=True)
    email_notifications = Column(Boolean, default=True)
    summary_frequency = Column(String, nullable=True)
    summary_day = Column(String, nullable=True)
    card_color = Column(String, default="#dbeafe")

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

    user = relationship("User", back_populates="routine_folders")
    routines = relationship("Routine", back_populates="folder")

    User.routine_folders = relationship(
        "RoutineFolder", back_populates="user", cascade="all, delete-orphan")


class SavedWorkoutProgram(Base):
    __tablename__ = "saved_workout_programs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    program_data = Column(JSON)  # Use JSON column type instead of String
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    current_week = Column(Integer, default=1)
    completed_weeks = Column(JSON)  # Use JSON column type for lists

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
