rked
#!/usr/bin/env python3
"""
Script to create the first admin user for FitExplorer
Run this script to bootstrap your first admin account
"""

import sys
import os
from datetime import datetime, timezone
from passlib.context import CryptContext

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import User, AdminSettings
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create the first admin user"""
    
    # Get user input
    print("=== FitExplorer Admin User Creation ===")
    print("This script will create your first admin user account.")
    print()
    
    email = input("Enter admin email: ").strip()
    if not email:
        print("Error: Email is required")
        return False
    
    username = input("Enter admin username: ").strip()
    if not username:
        print("Error: Username is required")
        return False
    
    password = input("Enter admin password: ").strip()
    if not password:
        print("Error: Password is required")
        return False
    
    # Confirm password
    confirm_password = input("Confirm admin password: ").strip()
    if password != confirm_password:
        print("Error: Passwords do not match")
        return False
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists")
            return False
        
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            print(f"Error: Username {username} is already taken")
            return False
        
        # Check if there are already admin users
        existing_admin = db.query(User).filter(User.is_admin == True).first()
        if existing_admin:
            print(f"Warning: Admin user already exists: {existing_admin.email}")
            response = input("Do you want to create another admin user? (y/N): ").strip().lower()
            if response != 'y':
                print("Admin user creation cancelled")
                return False
        
        # Hash password
        hashed_password = pwd_context.hash(password)
        
        # Create admin user
        admin_user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            is_admin=True,
            is_verified=True,  # Admin users are auto-verified
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print()
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   Username: {admin_user.username}")
        print(f"   Admin: {admin_user.is_admin}")
        print(f"   Verified: {admin_user.is_verified}")
        print(f"   Created: {admin_user.created_at}")
        print()
        print("You can now log in to your app with these credentials.")
        
        return True
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_admin_settings():
    """Create default admin settings if they don't exist"""
    db = SessionLocal()
    
    try:
        admin_settings = db.query(AdminSettings).first()
        if not admin_settings:
            print("Creating default admin settings...")
            admin_settings = AdminSettings()
            db.add(admin_settings)
            db.commit()
            print("✅ Default admin settings created")
        else:
            print("Admin settings already exist")
    except Exception as e:
        print(f"Error creating admin settings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("FitExplorer Admin Setup")
    print("======================")
    print()
    
    # Create admin settings first
    create_admin_settings()
    print()
    
    # Create admin user
    success = create_admin_user()
    
    if success:
        print("🎉 Setup complete! Your admin account is ready.")
    else:
        print("❌ Setup failed. Please try again.")
        sys.exit(1)
