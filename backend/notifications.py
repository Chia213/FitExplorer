from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from database import get_db
from dependencies import get_current_user
from models import User, Notification, UserProfile
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    message: str
    type: str
    icon: str = "bell"
    icon_color: str = "text-blue-500"


class NotificationUpdate(BaseModel):
    read: bool = True


class AchievementAlertsUpdate(BaseModel):
    enabled: bool


class AllNotificationsUpdate(BaseModel):
    enabled: bool


@router.get("")
def get_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for the current user"""
    notifications = db.query(Notification)\
        .filter(Notification.user_id == user.id)\
        .order_by(desc(Notification.created_at))\
        .all()
    
    return [{
        "id": notification.id,
        "message": notification.message,
        "type": notification.type,
        "date": notification.created_at.isoformat(),
        "read": notification.read,
        "icon": notification.icon,
        "iconColor": notification.icon_color,
    } for notification in notifications]


@router.post("")
async def create_notification(
    notification_data: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    try:
        # Create notification
        new_notification = Notification(
            user_id=user.id,
            type=notification_data.get("type", "info"),
            message=notification_data.get("message", ""),
            icon=notification_data.get("icon", "info"),
            icon_color=notification_data.get("icon_color", "text-blue-500"),
            read=notification_data.get("read", False),
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        
        return {
            "id": new_notification.id,
            "message": "Notification created successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating notification: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating notification: {str(e)}"
        )


@router.patch("/{notification_id}")
def update_notification(
    notification_id: int,
    update_data: NotificationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification)\
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id
        )\
        .first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = update_data.read
    db.commit()
    
    return {"message": "Notification updated successfully"}


@router.post("/mark-all-read")
def mark_all_as_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(Notification)\
        .filter(
            Notification.user_id == user.id,
            Notification.read == False
        )\
        .update({"read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/clear-all")
def clear_all_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all notifications"""
    try:
        db.query(Notification)\
            .filter(Notification.user_id == user.id)\
            .delete(synchronize_session='fetch')
        
        db.commit()
        return {"message": "All notifications cleared"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification)\
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id
        )\
        .first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.get("/settings/achievement-alerts")
def get_achievement_alerts_setting(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current achievement alerts setting for the user"""
    # Get or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not profile:
        # Create default profile with achievement alerts enabled
        profile = UserProfile(user_id=user.id, achievement_alerts=True)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return {"enabled": profile.achievement_alerts}


@router.patch("/settings/achievement-alerts")
def update_achievement_alerts_setting(
    update_data: AchievementAlertsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update achievement alerts setting for the user"""
    # Get or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not profile:
        # Create profile with specified achievement alerts setting
        profile = UserProfile(user_id=user.id, achievement_alerts=update_data.enabled)
        db.add(profile)
    else:
        # Update existing profile
        profile.achievement_alerts = update_data.enabled
    
    db.commit()
    db.refresh(profile)
    
    return {"enabled": profile.achievement_alerts}


@router.get("/settings/all-notifications")
def get_all_notifications_setting(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current setting for all notifications for the user"""
    # Get or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not profile:
        # Create default profile with all notifications enabled
        profile = UserProfile(user_id=user.id, all_notifications_enabled=True)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return {"enabled": profile.all_notifications_enabled}


@router.patch("/settings/all-notifications")
def update_all_notifications_setting(
    update_data: AllNotificationsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update all notifications setting for the user"""
    # Get or create profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    if not profile:
        # Create profile with specified all notifications setting
        profile = UserProfile(user_id=user.id, all_notifications_enabled=update_data.enabled)
        db.add(profile)
    else:
        # Update existing profile
        profile.all_notifications_enabled = update_data.enabled
    
    db.commit()
    db.refresh(profile)
    
    return {"enabled": profile.all_notifications_enabled}