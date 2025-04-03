from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


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
    date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    bodyweight: Optional[float] = None
    weight_unit: Optional[str] = "kg"
    notes: Optional[str] = None


class WorkoutCreate(WorkoutBase):
    bodyweight: Optional[float] = None  # Change to float for more precision
    # Track max lifts for key exercises
    max_lifts: Optional[Dict[str, float]] = None
    cardio_summary: Optional[Dict[str, float]] = None  # Capture cardio details
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
    goal_weight: Optional[float] = Field(
        None,
        gt=0,
        description="Goal weight must be a positive number"
    )
    email_notifications: Optional[bool] = None
    summary_frequency: Optional[str] = None
    card_color: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Card color in hex format (e.g., #dbeafe)"
    )


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


class RoutineSetCreate(BaseModel):
    weight: Optional[float] = None
    reps: Optional[int] = None
    distance: Optional[float] = None
    duration: Optional[float] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None


class RoutineExerciseCreate(BaseModel):
    name: str
    category: Optional[str] = "Uncategorized"
    is_cardio: Optional[bool] = False
    initial_sets: Optional[int] = 1
    sets: Optional[List[RoutineSetCreate]] = []


class RoutineCreate(BaseModel):
    name: str
    weight_unit: Optional[str] = "kg"
    folder_id: Optional[int] = None
    exercises: List[RoutineExerciseCreate] = []


class RoutineResponse(BaseModel):
    id: int
    name: str
    workout_id: Optional[int] = None
    folder_id: Optional[int] = None
    folder_name: Optional[str] = None
    workout: Optional[WorkoutResponse] = None

    class Config:
        from_attributes = True


class GoogleTokenVerifyRequest(BaseModel):
    token: str


class GoogleAuthResponse(Token):
    pass


class SavedWorkoutProgramCreate(BaseModel):
    program_data: dict
    current_week: Optional[int] = 1
    completed_weeks: Optional[List[int]] = []


class SavedWorkoutProgramResponse(BaseModel):
    id: int
    program_data: dict
    created_at: datetime
    current_week: int
    completed_weeks: Optional[List[int]] = []

    class Config:
        from_attributes = True


class RoutineFolderCreate(BaseModel):
    name: str


class RoutineFolderResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class BodyCompositionEntry(BaseModel):
    date: str
    bodyweight: float


class StrengthLiftEntry(BaseModel):
    date: str
    max_weight: float


class StrengthLiftProgress(BaseModel):
    Bench_Press: List[StrengthLiftEntry]
    Squat: List[StrengthLiftEntry]
    Deadlift: List[StrengthLiftEntry]


class CardioProgressEntry(BaseModel):
    date: str
    runningDistance: float
    runningPace: Optional[float]


class WorkoutFrequencyEntry(BaseModel):
    month: str
    workouts: int

# Optional: If you want more type-safe responses for your progress endpoints


class ProgressResponse(BaseModel):
    body_composition: List[BodyCompositionEntry]
    strength_lifts: StrengthLiftProgress
    cardio: List[CardioProgressEntry]
    workout_frequency: List[WorkoutFrequencyEntry]


class ResetPasswordRequest(BaseModel):
    new_password: str


class NotificationCreate(BaseModel):
    message: str
    type: str
    icon: Optional[str] = "bell"
    icon_color: Optional[str] = "text-blue-500"


class NotificationResponse(BaseModel):
    id: int
    message: str
    type: str
    date: datetime
    read: bool
    icon: str
    iconColor: str

    class Config:
        from_attributes = True


class WorkoutPreferencesBase(BaseModel):
    last_bodyweight: Optional[float] = None
    last_weight_unit: Optional[str] = "kg"
    last_exercises: Optional[List[Dict[str, Any]]] = None


class WorkoutPreferencesCreate(WorkoutPreferencesBase):
    pass


class WorkoutPreferencesUpdate(WorkoutPreferencesBase):
    pass


class WorkoutPreferencesResponse(WorkoutPreferencesBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
