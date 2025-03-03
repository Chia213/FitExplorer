from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class WorkoutCreate(BaseModel):
    name: str
    date: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    bodyweight: Optional[int] = None
    notes: Optional[str] = None
