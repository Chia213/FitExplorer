from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from database import get_db
from dependencies import get_current_user
from models import User, Notification
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
def create_notification(
    notification: NotificationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    new_notification = Notification(
        user_id=user.id,
        message=notification.message,
        type=notification.type,
        read=False,
        icon=notification.icon,
        icon_color=notification.icon_color,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    
    return {
        "id": new_notification.id,
        "message": new_notification.message,
        "type": new_notification.type,
        "date": new_notification.created_at.isoformat(),
        "read": new_notification.read,
        "icon": new_notification.icon,
        "iconColor": new_notification.icon_color,
    }


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
    db.query(Notification)\
        .filter(Notification.user_id == user.id)\
        .delete()
    
    db.commit()
    
    return {"message": "All notifications cleared"}