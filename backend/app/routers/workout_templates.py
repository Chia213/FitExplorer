from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import decodeJWT
from app.database.connection import get_db
from sqlalchemy.orm import Session
import app.models.models as models
import uuid

router = APIRouter(
    prefix="/workout-templates",
    tags=["workout-templates"],
    dependencies=[Depends(JWTBearer())],
)

# Schema for exercise in a workout
class ExerciseSchema(BaseModel):
    name: str
    sets: int
    reps: str
    rest: int
    notes: Optional[str] = None

# Schema for a workout in a template
class WorkoutSchema(BaseModel):
    name: str
    day: int
    exercises: List[ExerciseSchema]
    duration: int
    notes: Optional[str] = None

# Schema for creating a workout template
class WorkoutTemplateCreate(BaseModel):
    name: str
    description: str
    level: str
    category: str
    creator: str
    image_url: Optional[str] = None
    is_premium: bool = False
    workouts: List[WorkoutSchema]

# Schema for returning a workout template
class WorkoutTemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    level: str
    category: str
    creator: str
    image_url: Optional[str] = None
    is_premium: bool
    workouts: List[WorkoutSchema]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Helper to get user ID from token
def get_user_id_from_token(token: str = Depends(JWTBearer())):
    payload = decodeJWT(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["user_id"]

# Database model for workout templates
class WorkoutTemplateDB(models.Base):
    __tablename__ = "workout_templates"

    id = models.Column(models.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = models.Column(models.String, nullable=False)
    description = models.Column(models.String, nullable=False)
    level = models.Column(models.String, nullable=False)
    category = models.Column(models.String, nullable=False)
    creator = models.Column(models.String, nullable=False)
    image_url = models.Column(models.String, nullable=True)
    is_premium = models.Column(models.Boolean, default=False)
    workouts = models.Column(models.JSON, nullable=False)
    created_at = models.Column(models.DateTime, default=datetime.utcnow)
    updated_at = models.Column(models.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database model for user unlocked templates
class UserUnlockedTemplatesDB(models.Base):
    __tablename__ = "user_unlocked_templates"

    id = models.Column(models.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = models.Column(models.String, nullable=False)
    template_ids = models.Column(models.JSON, nullable=False)  # Array of template IDs
    last_updated = models.Column(models.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# CRUD Operations

@router.get("/", response_model=List[WorkoutTemplateResponse])
async def get_all_templates(
    db: Session = Depends(get_db),
    is_premium: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Get all non-premium workout templates or filter by parameters.
    Premium templates require separate endpoint.
    """
    query = db.query(WorkoutTemplateDB)
    
    # Apply filters if provided
    if is_premium is not None:
        query = query.filter(WorkoutTemplateDB.is_premium == is_premium)
    if category:
        query = query.filter(WorkoutTemplateDB.category == category)
    if level:
        query = query.filter(WorkoutTemplateDB.level == level)
    
    # If requesting non-premium templates only
    if is_premium is False:
        templates = query.all()
        return templates
    
    # If a filter isn't specifying premium status, only return non-premium by default
    if is_premium is None:
        query = query.filter(WorkoutTemplateDB.is_premium == False)
        templates = query.all()
        return templates

    # Otherwise, check for premium access
    # Get user unlocked templates
    user_unlocked = db.query(UserUnlockedTemplatesDB).filter(
        UserUnlockedTemplatesDB.user_id == user_id
    ).first()
    
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if is_admin:
        # Admins have access to all templates
        templates = query.all()
        return templates
    
    if not user_unlocked:
        # User hasn't unlocked any premium templates
        if is_premium:
            return []  # Return empty list if only premium templates requested
        templates = query.filter(WorkoutTemplateDB.is_premium == False).all()
        return templates
    
    # Get templates that user has unlocked
    unlocked_ids = user_unlocked.template_ids
    
    if is_premium:
        # If specifically requesting premium templates, return only unlocked premium
        templates = query.filter(WorkoutTemplateDB.id.in_(unlocked_ids)).all()
        return templates
    
    # Otherwise return non-premium + unlocked premium
    non_premium = query.filter(WorkoutTemplateDB.is_premium == False).all()
    premium = query.filter(
        WorkoutTemplateDB.is_premium == True,
        WorkoutTemplateDB.id.in_(unlocked_ids)
    ).all()
    
    return non_premium + premium

@router.get("/premium", response_model=List[WorkoutTemplateResponse])
async def get_premium_templates(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Get premium workout templates that the user has unlocked.
    """
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if is_admin:
        # Admins have access to all premium templates
        premium_templates = db.query(WorkoutTemplateDB).filter(
            WorkoutTemplateDB.is_premium == True
        ).all()
        return premium_templates
    
    # For regular users, check unlocked templates
    user_unlocked = db.query(UserUnlockedTemplatesDB).filter(
        UserUnlockedTemplatesDB.user_id == user_id
    ).first()
    
    if not user_unlocked:
        return []  # No unlocked templates
    
    unlocked_ids = user_unlocked.template_ids
    premium_templates = db.query(WorkoutTemplateDB).filter(
        WorkoutTemplateDB.is_premium == True,
        WorkoutTemplateDB.id.in_(unlocked_ids)
    ).all()
    
    return premium_templates

@router.get("/available-premium", response_model=List[WorkoutTemplateResponse])
async def get_available_premium_templates(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Get premium templates that are available but the user hasn't unlocked yet.
    """
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if is_admin:
        # Admins have access to all templates, so there are no "available but not unlocked"
        return []
    
    # For regular users, check unlocked templates
    user_unlocked = db.query(UserUnlockedTemplatesDB).filter(
        UserUnlockedTemplatesDB.user_id == user_id
    ).first()
    
    if not user_unlocked:
        # No unlocked templates, all premium templates are available
        premium_templates = db.query(WorkoutTemplateDB).filter(
            WorkoutTemplateDB.is_premium == True
        ).all()
        return premium_templates
    
    unlocked_ids = user_unlocked.template_ids
    available_templates = db.query(WorkoutTemplateDB).filter(
        WorkoutTemplateDB.is_premium == True,
        ~WorkoutTemplateDB.id.in_(unlocked_ids)  # Not in unlocked IDs
    ).all()
    
    return available_templates

@router.get("/{template_id}", response_model=WorkoutTemplateResponse)
async def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Get a specific workout template by ID.
    """
    template = db.query(WorkoutTemplateDB).filter(WorkoutTemplateDB.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # If template is not premium, return it
    if not template.is_premium:
        return template
    
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if is_admin:
        # Admins have access to all templates
        return template
    
    # For regular users, check if they've unlocked this template
    user_unlocked = db.query(UserUnlockedTemplatesDB).filter(
        UserUnlockedTemplatesDB.user_id == user_id
    ).first()
    
    if not user_unlocked or template_id not in user_unlocked.template_ids:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this premium template. Unlock it through achievements."
        )
    
    return template

@router.post("/unlock/{template_id}", status_code=status.HTTP_200_OK)
async def unlock_template(
    template_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Unlock a premium workout template.
    """
    # Check if template exists and is premium
    template = db.query(WorkoutTemplateDB).filter(WorkoutTemplateDB.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_premium:
        return {"message": "Template is not premium and doesn't need to be unlocked"}
    
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if is_admin:
        return {"message": "As an admin, you already have access to all premium templates"}
    
    # Check if user already has unlocked templates
    user_unlocked = db.query(UserUnlockedTemplatesDB).filter(
        UserUnlockedTemplatesDB.user_id == user_id
    ).first()
    
    if not user_unlocked:
        # Create new record for user
        new_unlocked = UserUnlockedTemplatesDB(
            user_id=user_id,
            template_ids=[template_id]
        )
        db.add(new_unlocked)
        db.commit()
    else:
        # Update existing record
        if template_id not in user_unlocked.template_ids:
            user_unlocked.template_ids.append(template_id)
            db.commit()
    
    return {"message": f"Template {template_id} unlocked successfully"}

@router.post("/", response_model=WorkoutTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template: WorkoutTemplateCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Create a new workout template (admin only).
    """
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    is_admin = user.is_admin if user else False
    
    if not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can create workout templates"
        )
    
    new_template = WorkoutTemplateDB(
        id=str(uuid.uuid4()),
        name=template.name,
        description=template.description,
        level=template.level,
        category=template.category,
        creator=template.creator,
        image_url=template.image_url,
        is_premium=template.is_premium,
        workouts=[workout.dict() for workout in template.workouts]
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return new_template 