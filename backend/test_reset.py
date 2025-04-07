from database import SessionLocal
from models import User
from security import hash_password
import traceback

def test_reset():
    try:
        # Open a session
        db = SessionLocal()
        
        # Find our test user
        email = 'chia_ranchber@hotmail.com'
        token = 'VGB7EXyCK7Kvr8jKy9N63Ud_a1Cxh3myq0-fPDSe2YM'
        
        print(f"Looking for user with email: {email}")
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"No user found with email {email}")
            return
        
        print(f"Found user: {user.email}, reset_token: {user.reset_token}")
        
        # Make sure the token matches
        if user.reset_token != token:
            print(f"Tokens don't match: {user.reset_token} != {token}")
            return
        
        print("Tokens match, updating password...")
        
        # Update the password
        new_password = "newpassword123"
        
        # This is where things might be failing
        try:
            user.hashed_password = hash_password(new_password)
            print("Password hashed successfully")
        except Exception as e:
            print(f"Error hashing password: {str(e)}")
            traceback.print_exc()
            return
        
        # Clear the reset token
        user.reset_token = None
        user.reset_token_expires_at = None
        
        # Commit the changes
        try:
            db.commit()
            print("Changes committed to database")
        except Exception as e:
            print(f"Error committing to database: {str(e)}")
            traceback.print_exc()
            db.rollback()
            return
        
        print("Password reset successful!")
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    test_reset() 