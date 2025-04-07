"""
Script to fix timezone data in the database.
This will update existing verification tokens and other datetime fields to be timezone-aware.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
import os

print("**** fix_timezone_data.py is being imported ****")

def fix_timezone_data():
    """Update existing token expiration times to be timezone-aware"""
    db = SessionLocal()
    try:
        # Get all users with verification tokens
        users_with_tokens = db.query(User).filter(
            (User.verification_token.isnot(None)) | 
            (User.reset_token.isnot(None)) | 
            (User.deletion_token.isnot(None))
        ).all()
        
        print(f"Found {len(users_with_tokens)} users with tokens to update")
        
        for user in users_with_tokens:
            print(f"Processing user: {user.email}")
            
            # Fix verification token expiry
            if user.verification_token and user.verification_token_expires_at:
                if user.verification_token_expires_at.tzinfo is None:
                    print(f"  - Fixing verification token expiry for {user.email}")
                    user.verification_token_expires_at = user.verification_token_expires_at.replace(tzinfo=timezone.utc)
            
            # Fix reset token expiry
            if user.reset_token and user.reset_token_expires_at:
                if user.reset_token_expires_at.tzinfo is None:
                    print(f"  - Fixing reset token expiry for {user.email}")
                    user.reset_token_expires_at = user.reset_token_expires_at.replace(tzinfo=timezone.utc)
            
            # Fix deletion token expiry
            if user.deletion_token and user.deletion_token_expires_at:
                if user.deletion_token_expires_at.tzinfo is None:
                    print(f"  - Fixing deletion token expiry for {user.email}")
                    user.deletion_token_expires_at = user.deletion_token_expires_at.replace(tzinfo=timezone.utc)
        
        # Commit all changes
        db.commit()
        print("All token expiry dates updated successfully")
        
    except Exception as e:
        print(f"Error updating token expiry dates: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_timezone_data()
    print("Done.") 