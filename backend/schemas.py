from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class SetBase(BaseModel):
    weight: Optional[float] = None
    reps: Optional[int] = None
    distance: Optional[float] = None
    duration: Optional[int] = None
    intensity: Optional[str] = None 
    notes: Optional[str] = None


class SetCreate(SetBase):
    pass


class SetResponse(SetBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class ExerciseBase(BaseModel):
    name: str
    category: Optional[str] = None
    is_cardio: Optional[bool] = False


class ExerciseCreate(ExerciseBase):
    sets: List[SetCreate] = []


class ExerciseResponse(ExerciseBase):
    id: Optional[int] = None
    sets: List[SetResponse] = []

    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    name: str
    date: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    bodyweight: Optional[int] = None
    notes: Optional[str] = None


class WorkoutCreate(WorkoutBase):
    exercises: Optional[List[ExerciseCreate]] = []


class WorkoutResponse(WorkoutBase):
    id: int
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        description="Username must be between 3 and 50 characters"
    )


class UserPreferencesUpdate(BaseModel):
    weight_unit: Optional[str] = Field(
        None,
        pattern="^(kg|lbs)$",
        description="Weight unit must be either 'kg' or 'lbs'"
    )
    goal_weight: Optional[float] = Field(
        None,
        gt=0,
        description="Goal weight must be a positive number"
    )
    email_notifications: Optional[bool] = None


class WorkoutStatsResponse(BaseModel):
    total_workouts: int = Field(ge=0, description="Total number of workouts")
    favorite_exercise: Optional[str] = None
    last_workout: Optional[datetime] = None
    total_cardio_duration: Optional[float] = Field(
        None,
        ge=0,
        description="Total cardio duration in minutes"
    )
    weight_progression: Optional[List[dict]] = Field(
        None,
        description="Historical bodyweight data"
    )


class UserProfileResponse(BaseModel):
    username: str
    email: str
    profile_picture: Optional[str] = None
    preferences: Optional[dict] = {
        "weight_unit": str,
        "goal_weight": Optional[float],
        "email_notifications": bool
    }

    class Config:
        from_attributes = True


class ProfilePictureUpload(BaseModel):
    profile_picture: str


class ValidationErrorResponse(BaseModel):
    detail: List[dict]

    class Config:
        json_schema_extra = {
            "example": {
                "detail": [
                    {
                        "loc": ["body", "username"],
                        "msg": "Username must be between 3 and 50 characters",
                        "type": "value_error.any_str.min_length"
                    }
                ]
            }
        }


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(
        min_length=8,
        description="New password must be at least 8 characters long."
    )


class RoutineExerciseCreate(BaseModel):
    name: str
    category: Optional[str] = "Uncategorized"
    is_cardio: Optional[bool] = False
    initial_sets: Optional[int] = 1


class RoutineCreate(BaseModel):
    name: str
    exercises: List[RoutineExerciseCreate] = []


class RoutineResponse(BaseModel):
    id: int
    name: str
    workout_id: Optional[int] = None
    workout: Optional[WorkoutResponse] = None

    class Config:
        from_attributes = True
        
    @property
    def exercises(self) -> List[ExerciseResponse]:
        """Provide access to exercises through the workout relationship"""
        if self.workout:
            return self.workout.exercises
        return []