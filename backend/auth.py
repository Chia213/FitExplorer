from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from email_validator import validate_email, EmailNotValidError
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
import jwt
from database import get_db, SessionLocal
from models import User, AdminSettings, Set, Exercise, Workout, WorkoutPreferences
from schemas import UserCreate, UserLogin, Token, GoogleTokenVerifyRequest, GoogleAuthResponse, ForgotPasswordRequest, ResetPasswordRequest, TokenVerificationRequest, ConfirmAccountDeletionRequest
from config import settings
from security import generate_verification_token, hash_password, verify_password
from dependencies import get_current_user
from email_service import send_verification_email, notify_admin_new_registration, send_password_reset_email, send_password_changed_email, send_account_deletion_email

from requests_oauthlib import OAuth2Session
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

ALLOWED_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "live.com", "live.se", "hotmail.se"
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})

    # Fetch the user to get admin status
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == data.get("sub")).first()
        if user:
            to_encode["is_admin"] = user.is_admin
    finally:
        db.close()

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


@router.post("/register")
def register(user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)

    # Check admin settings for auto-verification
    admin_settings = db.query(AdminSettings).first()
    if not admin_settings:
        admin_settings = AdminSettings()
        db.add(admin_settings)
        db.commit()
        db.refresh(admin_settings)

    # Generate verification token
    token = generate_verification_token()
    
    # Ensure we use timezone-aware datetime objects
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    print(f"Creating verification token that expires at: {expires} (UTC)")

    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        username=user.username,
        verification_token=token,
        verification_token_expires_at=expires,
        is_verified=admin_settings.auto_verify_users,  # Set based on admin settings
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"User created: {new_user.email}, Auto-verified: {admin_settings.auto_verify_users}")
    print(f"Verification required: {admin_settings.require_email_verification}")

    # Only send verification email if auto-verification is disabled
    if not admin_settings.auto_verify_users:
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        print(f"Sending verification email to {user.email} with token: {token}")
        background_tasks.add_task(
            send_verification_email,
            user.email,
            verification_url
        )

    # Notify admin about new registration
    background_tasks.add_task(
        notify_admin_new_registration,
        new_user.id,
        new_user.email,
        new_user.username
    )

    return {"message": "User registered successfully. Please verify your email."}


@router.post("/token", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        print(f"Login failed: User with email {user.email} not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not pwd_context.verify(user.password, db_user.hashed_password):
        print(f"Login failed: Incorrect password for user {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check admin settings for email verification requirement
    admin_settings = db.query(AdminSettings).first()
    if not admin_settings:
        print("Admin settings not found, creating default settings")
        admin_settings = AdminSettings()
        db.add(admin_settings)
        db.commit()
        db.refresh(admin_settings)

    print(f"Admin settings - require_email_verification: {admin_settings.require_email_verification}")
    print(f"User {db_user.email} verification status: {db_user.is_verified}")
    
    # Only check verification if required
    if admin_settings.require_email_verification and not db_user.is_verified:
        print(f"Login failed: User {db_user.email} is not verified and verification is required")
        raise HTTPException(
            status_code=401, detail="Account not verified. Please check your email.")

    # Update last login timestamp
    db_user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Use session timeout from admin settings
    access_token = create_access_token(
        {"sub": db_user.username}, 
        timedelta(minutes=admin_settings.session_timeout)
    )
    print(f"Login successful for user {db_user.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/login/google")
async def google_login():
    google_oauth = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=[
                                 "openid", "profile", "email"])
    authorization_url, _ = google_oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth")
    return Response(status_code=303, headers={"Location": authorization_url})


@router.get("/callback")
async def google_callback(code: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        google_oauth = OAuth2Session(
            GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI)
        token_url = "https://accounts.google.com/o/oauth2/token"

        authorization_response = f"{GOOGLE_REDIRECT_URI}?code={code}"

        google_oauth.fetch_token(
            token_url,
            authorization_response=authorization_response,
            client_secret=GOOGLE_CLIENT_SECRET,
        )

        id_info = id_token.verify_oauth2_token(
            google_oauth.token['id_token'],
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        user_info = {
            'email': id_info.get('email'),
            'name': id_info.get('name'),
        }

        existing_user = db.query(User).filter(
            User.email == user_info["email"]).first()
        if not existing_user:
            new_user = User(
                email=user_info["email"],
                username=user_info["name"],
                hashed_password="google_oauth",
                is_verified=True,  # Google accounts are already verified
                created_at=datetime.now(timezone.utc)
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            # Notify admin about new Google user registration
            background_tasks.add_task(
                notify_admin_new_registration,
                new_user.id,
                new_user.email,
                new_user.username,
                via_google=True
            )

            user = new_user
        else:
            # Make sure existing users who connect with Google are verified
            if not existing_user.is_verified:
                existing_user.is_verified = True
                db.commit()
                db.refresh(existing_user)

            user = existing_user

        access_token = create_access_token(
            {"sub": user.username}, timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Authentication error: {str(e)}")


@router.post("/google-verify", response_model=GoogleAuthResponse)
async def verify_google_token(
    request_data: GoogleTokenVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        request = google_requests.Request()

        id_info = id_token.verify_oauth2_token(
            request_data.token,
            request,
            GOOGLE_CLIENT_ID
        )

        email = id_info.get('email')
        name = id_info.get('name', email.split(
            '@')[0] if email else "Google User")

        if not email:
            raise HTTPException(
                status_code=400, detail="Email not found in token")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                username=name,
                hashed_password="google_oauth",
                is_verified=True,  # Google accounts are already verified
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Notify admin about new Google user registration
            background_tasks.add_task(
                notify_admin_new_registration,
                user.id,
                user.email,
                user.username,
                via_google=True
            )
        elif not user.is_verified:
            # If they had a regular account that wasn't verified, verify it now
            user.is_verified = True
            db.commit()

        access_token = create_access_token(
            {"sub": user.username},
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Authentication error: {str(e)}")


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Send password reset email to user with a reset link
    """
    # Find the user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    # If no user found, we still return success for security reasons 
    # (don't want to leak which emails exist in the system)
    if not user:
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    
    # Generate reset token
    reset_token = generate_verification_token()
    reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Update user with reset token
    user.reset_token = reset_token
    user.reset_token_expires_at = reset_token_expires
    db.commit()
    
    # Build reset URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    # Send email in background
    background_tasks.add_task(
        send_password_reset_email,
        user.email,
        reset_url
    )
    
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Reset user password using the provided token and new password
    """
    try:
        # Validate request data
        if not request.token:
            raise HTTPException(status_code=400, detail="Reset token is required")
        
        if not request.new_password or len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Get the token from the request body
        token = request.token
        
        # Find user with this reset token
        user = db.query(User).filter(User.reset_token == token).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Check if token is expired - make sure both datetimes have timezone info
        now = datetime.now(timezone.utc)
        if not user.reset_token_expires_at:
            raise HTTPException(status_code=400, detail="Invalid reset token")
            
        # Make sure the expiration timestamp has timezone info
        token_expiry = user.reset_token_expires_at
        if token_expiry.tzinfo is None:
            # If the timestamp doesn't have timezone info, assume UTC
            token_expiry = token_expiry.replace(tzinfo=timezone.utc)
            
        if token_expiry < now:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Update password
        user.hashed_password = pwd_context.hash(request.new_password)
        
        # Clear the reset token
        user.reset_token = None
        user.reset_token_expires_at = None
        
        db.commit()
        
        # Send confirmation email
        background_tasks.add_task(
            send_password_changed_email,
            user.email
        )
        
        return {"message": "Password has been reset successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a generic message
        print(f"Error in reset_password: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")


@router.post("/verify-email")
async def verify_email(request: TokenVerificationRequest, db: Session = Depends(get_db)):
    """Verify a user's email using the verification token"""
    try:
        # Find user with this verification token
        user = db.query(User).filter(User.verification_token == request.token).first()
        
        if not user:
            print(f"Verification failed: Token {request.token} not found")
            
            # Check if this might be a case where user is already verified
            all_users = db.query(User).filter(User.is_verified == True).all()
            print(f"There are {len(all_users)} verified users in the system")
            
            # Return a more friendly message that suggests the user might already be verified
            raise HTTPException(
                status_code=400, 
                detail="Invalid verification link. If you've already verified your email, please try logging in. If not, please request a new verification email."
            )
        
        # Check if user is already verified
        if user.is_verified:
            print(f"User {user.email} is already verified")
            
            # Clear any remaining verification tokens
            if user.verification_token:
                user.verification_token = None
                user.verification_token_expires_at = None
                db.commit()
                
            return {"message": "Your email is already verified. You can now log in to your account."}
            
        # Check if token is expired - make sure both datetimes have timezone info
        now = datetime.now(timezone.utc)
        print(f"Current time (UTC): {now}")
        
        if not user.verification_token_expires_at:
            print(f"Verification failed: User {user.email} has no expiration timestamp")
            raise HTTPException(status_code=400, detail="Invalid verification link. Please request a new verification email.")
        
        # Make sure the expiration timestamp has timezone info
        token_expiry = user.verification_token_expires_at
        print(f"Original token expiry: {token_expiry}, Has TZ info: {token_expiry.tzinfo is not None}")
        
        if token_expiry.tzinfo is None:
            # If the timestamp doesn't have timezone info, assume UTC
            token_expiry = token_expiry.replace(tzinfo=timezone.utc)
            print(f"Updated token expiry with TZ info: {token_expiry}")
        
        print(f"Token expires at: {token_expiry}")
        print(f"Is token expired? {token_expiry < now}")
        
        if token_expiry < now:
            print(f"Verification failed: Token for {user.email} expired at {token_expiry}")
            raise HTTPException(status_code=400, detail="This verification link has expired. Please request a new verification email.")
        
        # Mark the user as verified
        user.is_verified = True
        print(f"User {user.email} marked as verified")
        
        # Clear the verification token
        user.verification_token = None
        user.verification_token_expires_at = None
        
        db.commit()
        print(f"Verification successful for {user.email}")
        
        return {"message": "Email verified successfully! You can now log in to your account."}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a generic message
        print(f"Error in verify_email: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while verifying your email. Please try again later.")


@router.post("/request-account-deletion")
async def request_account_deletion(
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request account deletion and send confirmation email
    """
    try:
        # Generate deletion token
        deletion_token = generate_verification_token()
        deletion_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Update user with deletion token
        user.deletion_token = deletion_token
        user.deletion_token_expires_at = deletion_token_expires
        db.commit()
        
        # Build deletion confirmation URL
        deletion_url = f"{settings.FRONTEND_URL}/confirm-deletion?token={deletion_token}"
        
        # Send email in background
        background_tasks.add_task(
            send_account_deletion_email,
            user.email,
            deletion_url
        )
        
        return {"message": "Account deletion request has been sent. Please check your email to confirm."}
    except Exception as e:
        # Log the error and return a generic message
        print(f"Error in request_account_deletion: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")


@router.post("/confirm-account-deletion")
async def confirm_account_deletion(request: ConfirmAccountDeletionRequest, db: Session = Depends(get_db)):
    """Confirm account deletion using the provided token"""
    try:
        # Find user with this deletion token
        user = db.query(User).filter(User.deletion_token == request.token).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid deletion token")
        
        # Check if token is expired - make sure both datetimes have timezone info
        now = datetime.now(timezone.utc)
        if not user.deletion_token_expires_at:
            raise HTTPException(status_code=400, detail="Invalid deletion token")
            
        # Make sure the expiration timestamp has timezone info
        token_expiry = user.deletion_token_expires_at
        if token_expiry.tzinfo is None:
            # If the timestamp doesn't have timezone info, assume UTC
            token_expiry = token_expiry.replace(tzinfo=timezone.utc)
            
        if token_expiry < now:
            raise HTTPException(status_code=400, detail="Deletion token has expired")
        
        # Delete all user related data
        try:
            # Delete workouts and related data
            db.query(Set).filter(Set.exercise_id.in_(
                db.query(Exercise.id).filter(Exercise.workout_id.in_(
                    db.query(Workout.id).filter(Workout.user_id == user.id)
                ))
            )).delete(synchronize_session=False)

            db.query(Exercise).filter(Exercise.workout_id.in_(
                db.query(Workout.id).filter(Workout.user_id == user.id)
            )).delete(synchronize_session=False)

            db.query(Workout).filter(Workout.user_id == user.id).delete(synchronize_session=False)
            
            # Delete other user-related data that may exist based on foreign keys
            db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).delete(synchronize_session=False)
            
            # Delete profile picture if it exists
            if user.profile_picture:
                try:
                    file_path = os.path.join(".", user.profile_picture.lstrip("/"))
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Failed to delete profile picture: {str(e)}")
                    
            # Finally delete the user
            db.delete(user)
            db.commit()
            
            return {"message": "Account deleted successfully"}
            
        except Exception as e:
            db.rollback()
            print(f"Error deleting user data: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail="An error occurred while deleting your account data")
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        # Log the error and return a generic message
        print(f"Error in confirm_account_deletion: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
