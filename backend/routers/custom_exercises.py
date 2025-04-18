from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from dependencies import get_current_user
from models import CustomExercise, User

router = APIRouter()

class CustomExerciseBase(BaseModel):
    name: str
    category: str

class CustomExerciseCreate(CustomExerciseBase):
    pass

class CustomExerciseResponse(CustomExerciseBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.post("/custom-exercises", response_model=CustomExerciseResponse)
def create_custom_exercise(
    exercise: CustomExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new custom exercise for the current user"""
    # Check if the user already has an exercise with this name
    existing_exercise = db.query(CustomExercise).filter(
        CustomExercise.user_id == current_user.id,
        CustomExercise.name == exercise.name
    ).first()
    
    if existing_exercise:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An exercise with this name already exists in your collection"
        )
    
    db_exercise = CustomExercise(
        name=exercise.name,
        category=exercise.category,
        user_id=current_user.id
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

@router.get("/custom-exercises", response_model=List[CustomExerciseResponse])
def get_custom_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all custom exercises for the current user"""
    return db.query(CustomExercise).filter(CustomExercise.user_id == current_user.id).all()

@router.get("/custom-exercises/{exercise_id}", response_model=CustomExerciseResponse)
def get_custom_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific custom exercise by ID"""
    exercise = db.query(CustomExercise).filter(
        CustomExercise.id == exercise_id,
        CustomExercise.user_id == current_user.id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom exercise not found"
        )
    
    return exercise

@router.put("/custom-exercises/{exercise_id}", response_model=CustomExerciseResponse)
def update_custom_exercise(
    exercise_id: int,
    exercise_data: CustomExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific custom exercise"""
    exercise = db.query(CustomExercise).filter(
        CustomExercise.id == exercise_id,
        CustomExercise.user_id == current_user.id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom exercise not found"
        )
    
    # Check for name conflicts if name is being changed
    if exercise.name != exercise_data.name:
        name_conflict = db.query(CustomExercise).filter(
            CustomExercise.user_id == current_user.id,
            CustomExercise.name == exercise_data.name,
            CustomExercise.id != exercise_id
        ).first()
        
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An exercise with this name already exists in your collection"
            )
    
    exercise.name = exercise_data.name
    exercise.category = exercise_data.category
    
    db.commit()
    db.refresh(exercise)
    return exercise

@router.delete("/custom-exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific custom exercise"""
    exercise = db.query(CustomExercise).filter(
        CustomExercise.id == exercise_id,
        CustomExercise.user_id == current_user.id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom exercise not found"
        )
    
    db.delete(exercise)
    db.commit()
    return None 