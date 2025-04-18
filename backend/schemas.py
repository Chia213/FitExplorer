from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timedelta, date
import json


class UserBase(BaseModel):
    email: str
    username: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
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
    order: Optional[int] = 0
    # Set type flags
    is_warmup: Optional[bool] = False
    is_drop_set: Optional[bool] = False
    is_superset: Optional[bool] = False
    is_amrap: Optional[bool] = False
    is_restpause: Optional[bool] = False
    is_pyramid: Optional[bool] = False
    is_giant: Optional[bool] = False
    # Additional set properties
    drop_number: Optional[int] = None
    original_weight: Optional[float] = None
    superset_with: Optional[str] = None
    rest_pauses: Optional[int] = None
    pyramid_type: Optional[str] = None
    pyramid_step: Optional[int] = None
    giant_with: Optional[List[str]] = None


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


class UserProfileBase(BaseModel):
    goal_weight: Optional[float] = None
    email_notifications: bool = True
    summary_frequency: Optional[str] = None
    summary_day: Optional[str] = None
    card_color: str = "#dbeafe"
    use_custom_card_color: bool = False
    show_profile_emoji: bool = True
    profile_emoji: str = "🏋️‍♂️"
    emoji_animation: str = "lift"


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfile(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    profile: Optional[UserProfile] = None

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
    order: Optional[int] = 0
    # Set type flags
    is_warmup: Optional[bool] = False
    is_drop_set: Optional[bool] = False
    is_superset: Optional[bool] = False
    is_amrap: Optional[bool] = False
    is_restpause: Optional[bool] = False
    is_pyramid: Optional[bool] = False
    is_giant: Optional[bool] = False
    # Additional set properties
    drop_number: Optional[int] = None
    original_weight: Optional[float] = None
    superset_with: Optional[str] = None
    rest_pauses: Optional[int] = None
    pyramid_type: Optional[str] = None
    pyramid_step: Optional[int] = None
    giant_with: Optional[List[str]] = None


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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GoogleTokenVerifyRequest(BaseModel):
    token: str
    source: Optional[str] = None  # To identify where the request is coming from (e.g., 'mobile')


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
    color: Optional[str] = None


class RoutineFolderResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    color: Optional[str] = None

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
    token: str
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
    workout_frequency_goal: Optional[int] = None  # Number of workouts per week (1-7)


class WorkoutPreferencesCreate(WorkoutPreferencesBase):
    pass


class WorkoutPreferencesUpdate(WorkoutPreferencesBase):
    workout_frequency_goal: Optional[int] = None  # Explicitly include the field for clarity


class WorkoutPreferencesResponse(WorkoutPreferencesBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExerciseMemoryBase(BaseModel):
    exercise_name: str
    # Optional fields for both strength and cardio exercises
    weight: Optional[float] = None
    reps: Optional[str] = None
    distance: Optional[float] = None
    duration: Optional[float] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None


class ExerciseMemoryCreate(ExerciseMemoryBase):
    pass


class ExerciseMemoryUpdate(ExerciseMemoryBase):
    exercise_name: Optional[str] = None  # Make it optional for updates


class ExerciseMemoryResponse(ExerciseMemoryBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenVerificationRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ConfirmAccountDeletionRequest(BaseModel):
    token: str


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
        "email_notifications": bool,
        "show_profile_emoji": bool,
        "profile_emoji": str,
        "emoji_animation": str
    }

    class Config:
        from_attributes = True


class UserProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    fitness_goals: Optional[str] = None
    bio: Optional[str] = None
    goals: Optional[str] = None
    interests: Optional[str] = None
    target_weight: Optional[float] = None
    date_of_birth: Optional[date] = None
    activity_level: Optional[str] = None
    fitness_level: Optional[str] = None


class AchievementBase(BaseModel):
    name: str
    description: str
    icon: str
    category: str
    requirement: int


class AchievementCreate(AchievementBase):
    pass


class Achievement(AchievementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserAchievementBase(BaseModel):
    achievement_id: int
    progress: int = 0


class UserAchievementCreate(UserAchievementBase):
    pass


class UserAchievement(UserAchievementBase):
    id: int
    user_id: int
    achieved_at: Optional[datetime] = None
    achievement: Achievement

    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    category: str
    requirement: int
    progress: int
    achieved_at: Optional[datetime] = None
    is_achieved: bool

    class Config:
        from_attributes = True

# Workout Templates Schemas
class WorkoutTemplateExercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest: int
    notes: Optional[str] = None

class WorkoutTemplateWorkout(BaseModel):
    name: str
    day: int
    exercises: List[WorkoutTemplateExercise]
    duration: int
    notes: Optional[str] = None

class WorkoutTemplateCreate(BaseModel):
    name: str
    description: str
    level: str
    category: str
    creator: str
    image_url: Optional[str] = None
    is_premium: bool = False
    workouts: List[WorkoutTemplateWorkout]

class WorkoutTemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    level: str
    category: str
    creator: str
    image_url: Optional[str] = None
    is_premium: bool
    workouts: List[WorkoutTemplateWorkout]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BadgeSelectionRequest(BaseModel):
    badges: List[int]

    class Config:
        from_attributes = True


class UserSessionResponse(BaseModel):
    id: int
    created_at: datetime
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_info: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class SessionSettingsUpdate(BaseModel):
    allow_multiple_sessions: bool
