from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from database import Base
from datetime import datetime, timezone


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires_at = Column(DateTime, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    deletion_token = Column(String, nullable=True)
    deletion_token_expires_at = Column(DateTime, nullable=True)

    saved_programs = relationship(
        "SavedWorkoutProgram",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    workouts = relationship(
        "Workout", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship(
        "UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    custom_exercises = relationship(
        "CustomExercise", back_populates="user", cascade="all, delete-orphan")
    routines = relationship(
        "Routine", back_populates="user", cascade="all, delete-orphan")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    goal_weight = Column(Float, nullable=True)
    email_notifications = Column(Boolean, default=False)
    summary_frequency = Column(String, nullable=True)
    card_color = Column(String, default="#dbeafe")

    user = relationship("User", back_populates="preferences")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.now(timezone.utc))
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    bodyweight = Column(Integer, nullable=True)
    weight_unit = Column(String, default="kg")
    notes = Column(String, nullable=True)
    is_template = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="workouts")
    exercises = relationship(
        "Exercise", back_populates="workout", cascade="all, delete-orphan")
    routines = relationship(
        "Routine", back_populates="workout", cascade="all, delete-orphan")


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
