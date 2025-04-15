"""
Migration script to add animation-related fields to the UserProfile model
"""
from sqlalchemy import create_engine, Column, Boolean, String, text
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable or use default
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./fitexplorer.db")

# Create SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_migration():
    """
    Run the migration to add animation-related columns to the user_profiles table
    """
    # Create a session
    db = SessionLocal()
    
    try:
        # Add columns if they don't exist
        # For SQLite (or other DB engines that don't support ADD IF NOT EXISTS)
        # we'll check if the columns exist first
        
        # Check if enable_animations column exists
        has_enable_animations = False
        has_animation_style = False
        has_animation_speed = False
        has_achievement_alerts = False
        has_all_notifications_enabled = False
        
        # Get column information using text() to properly format SQL
        columns_info = db.execute(text("PRAGMA table_info(user_profiles)")).fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Check for each column
        has_enable_animations = "enable_animations" in column_names
        has_animation_style = "animation_style" in column_names
        has_animation_speed = "animation_speed" in column_names
        has_achievement_alerts = "achievement_alerts" in column_names
        has_all_notifications_enabled = "all_notifications_enabled" in column_names
        
        # Add columns if needed using text() for each SQL statement
        if not has_enable_animations:
            db.execute(text("ALTER TABLE user_profiles ADD COLUMN enable_animations BOOLEAN DEFAULT FALSE"))
            print("Added enable_animations column")
        
        if not has_animation_style:
            db.execute(text("ALTER TABLE user_profiles ADD COLUMN animation_style VARCHAR DEFAULT 'subtle'"))
            print("Added animation_style column")
        
        if not has_animation_speed:
            db.execute(text("ALTER TABLE user_profiles ADD COLUMN animation_speed VARCHAR DEFAULT 'medium'"))
            print("Added animation_speed column")
            
        if not has_achievement_alerts:
            db.execute(text("ALTER TABLE user_profiles ADD COLUMN achievement_alerts BOOLEAN DEFAULT TRUE"))
            print("Added achievement_alerts column")
            
        if not has_all_notifications_enabled:
            db.execute(text("ALTER TABLE user_profiles ADD COLUMN all_notifications_enabled BOOLEAN DEFAULT TRUE"))
            print("Added all_notifications_enabled column")
        
        # Commit the transaction
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        # Rollback in case of error
        db.rollback()
        print(f"Migration failed: {str(e)}")
        raise
    finally:
        # Close the session
        db.close()

if __name__ == "__main__":
    run_migration() 