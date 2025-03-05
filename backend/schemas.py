from pydantic import BaseModel, EmailStr
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
    intensity: Optional[int] = None
    notes: Optional[str] = None


class SetCreate(SetBase):
    pass


class SetResponse(SetBase):
    id: Optional[int] = None

    class Config:
        orm_mode = True


class ExerciseBase(BaseModel):
    name: str
    category: Optional[str] = None
    isCardio: Optional[bool] = False


class ExerciseCreate(ExerciseBase):
    sets: List[SetCreate] = []


class ExerciseResponse(ExerciseBase):
    id: Optional[int] = None
    sets: List[SetResponse] = []

    class Config:
        orm_mode = True


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
        orm_mode = True
