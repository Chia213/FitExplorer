from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    profile_picture = Column(String, nullable=True)

    workouts = relationship("Workout", back_populates="user")
    preferences = relationship(
        "UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    custom_exercises = relationship("CustomExercise", back_populates="user")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    weight_unit = Column(String, default="kg")
    goal_weight = Column(Float, nullable=True)
    email_notifications = Column(Boolean, default=False)

    user = relationship("User", back_populates="preferences")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    bodyweight = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="workouts")

    exercises = relationship(
        "Exercise", back_populates="workout", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_cardio = Column(Boolean, default=False)
    workout_id = Column(Integer, ForeignKey("workouts.id"))

    workout = relationship("Workout", back_populates="exercises")
    sets = relationship("Set", back_populates="exercise",
                        cascade="all, delete-orphan")


class Set(Base):
    __tablename__ = "sets"

    id = Column(Integer, primary_key=True, index=True)
    weight = Column(Float, nullable=True)
    reps = Column(Integer, nullable=True)
    distance = Column(Float, nullable=True)
    duration = Column(Integer, nullable=True)
    intensity = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"))

    exercise = relationship("Exercise", back_populates="sets")


class CustomExercise(Base):
    __tablename__ = "custom_exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="custom_exercises")
