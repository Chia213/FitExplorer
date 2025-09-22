from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from email_validator import validate_email, EmailNotValidError
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Body, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func, inspect, text
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
import jwt as pyjwt
from jwt.exceptions import PyJWTError as JWTError
from database import get_db, SessionLocal
from models import User, AdminSettings, Set, Exercise, Workout, WorkoutPreferences, NutritionMeal, NutritionFood, NutritionGoal, CommonFood, UserSession, UserProfile
from schemas import UserCreate, UserLogin, Token, GoogleTokenVerifyRequest, GoogleAuthResponse, AppleTokenVerifyRequest, AppleAuthResponse, ForgotPasswordRequest, ResetPasswordRequest, TokenVerificationRequest, ConfirmAccountDeletionRequest, ResendVerificationRequest, ChangePasswordRequest, SessionSettingsUpdate, UserSessionResponse
from config import settings
from security import generate_verification_token, hash_password, verify_password
from dependencies import get_current_user as original_get_current_user, oauth2_scheme
from email_service import send_verification_email, notify_admin_new_registration, send_password_reset_email, send_password_changed_email, send_account_deletion_email, notify_admin_account_verified, notify_admin_password_changed, notify_admin_account_deletion

from requests_oauthlib import OAuth2Session
from dotenv import load_dotenv
import uuid

import redis
from redis.exceptions import ConnectionError

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

# Try to connect to Redis for token blacklisting
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()  # Test the connection
    REDIS_AVAILABLE = True
except (ConnectionError, redis.exceptions.ConnectionError):
    print("Warning: Redis not available for token blacklisting")
    REDIS_AVAILABLE = False
    # Fallback to in-memory blacklist if Redis is not available
    token_blacklist = set()

def blacklist_token(token: str, expires_delta: int):
    """Add a token to the blacklist"""
    if REDIS_AVAILABLE:
        try:
            redis_client.setex(f"blacklist:{token}", expires_delta, "1")
        except:
            # Fallback to in-memory if Redis fails
            token_blacklist.add(token)
            print("Warning: Redis failed, using in-memory blacklist")
    else:
        token_blacklist.add(token)

def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted"""
    if REDIS_AVAILABLE:
        try:
            return redis_client.exists(f"blacklist:{token}") == 1
        except:
            # Fallback to in-memory if Redis fails
            return token in token_blacklist
    else:
        return token in token_blacklist

def create_access_token(data: dict, expires_delta: timedelta):
    print("Creating access token with data:", data)
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

    # Direct encoding to avoid any possible name conflicts
    try:
        encoded_jwt = pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        print("JWT encoding successful")
        return encoded_jwt
    except Exception as e:
        print(f"JWT encoding error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


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

    # Create default nutrition meal for the new user
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Create a breakfast meal
        default_meal = NutritionMeal(
            name="Breakfast",
            date=today,
            time="08:00",
            user_id=new_user.id
        )
        db.add(default_meal)
        db.flush()  # Get the meal ID without committing
        
        # Get some common breakfast foods from the database
        common_foods = db.query(CommonFood).limit(3).all()
        
        # If we have foods in the database, add them to the meal
        if common_foods:
            for food in common_foods:
                meal_food = NutritionFood(
                    meal_id=default_meal.id,
                    name=food.name,
                    calories=food.calories,
                    protein=food.protein,
                    carbs=food.carbs,
                    fat=food.fat,
                    serving_size=food.serving_size,
                    quantity=1.0
                )
                db.add(meal_food)
        else:
            # If no foods in database, add some default ones
            default_foods = [
                {
                    "name": "Oatmeal", 
                    "calories": 150, 
                    "protein": 5, 
                    "carbs": 27, 
                    "fat": 2.5, 
                    "serving_size": "1 cup"
                },
                {
                    "name": "Banana", 
                    "calories": 105, 
                    "protein": 1.3, 
                    "carbs": 27, 
                    "fat": 0.4, 
                    "serving_size": "1 medium"
                }
            ]
            
            for food_data in default_foods:
                meal_food = NutritionFood(
                    meal_id=default_meal.id,
                    name=food_data["name"],
                    calories=food_data["calories"],
                    protein=food_data["protein"],
                    carbs=food_data["carbs"],
                    fat=food_data["fat"],
                    serving_size=food_data["serving_size"],
                    quantity=1.0
                )
                db.add(meal_food)
        
        # Create default nutrition goals
        default_goals = NutritionGoal(
            user_id=new_user.id,
            calories=2000,
            protein=150,
            carbs=200,
            fat=65
        )
        db.add(default_goals)
        
        db.commit()
        print(f"Created default meal and nutrition goals for new user: {new_user.email}")
    except Exception as e:
        print(f"Error creating default meal for new user: {str(e)}")
        # Don't fail registration if meal creation fails
        pass

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
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        print(f"Login failed: User with email {user.email} not found")
        raise HTTPException(status_code=401, detail="User does not exist. Please check your email or register a new account.")
        
    if not pwd_context.verify(user.password, db_user.hashed_password):
        print(f"Login failed: Incorrect password for user {user.email}")
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

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
            status_code=401, detail="Account not verified. Please check your email for verification link.")

    # Check for existing active sessions
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == db_user.id,
        UserSession.is_active == True,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).all()

    # If there are active sessions and multiple sessions aren't allowed
    if active_sessions and not db_user.allow_multiple_sessions:
        # Invalidate all existing sessions
        for session in active_sessions:
            session.is_active = False
        db.commit()
        print(f"Invalidated existing sessions for user {db_user.email} on new login")
    
    # Update last login timestamp
    db_user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Use session timeout from admin settings
    access_token = create_access_token(
        {"sub": db_user.username}, 
        timedelta(minutes=admin_settings.session_timeout)
    )

    # Create a new session record
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=admin_settings.session_timeout)
    user_agent = request.headers.get("user-agent", "")
    ip_address = request.client.host if request.client else None
    
    # Extract basic device info from user agent
    device_info = "Unknown"
    if user_agent:
        if "Mobile" in user_agent:
            device_info = "Mobile"
        elif "Tablet" in user_agent:
            device_info = "Tablet"
        else:
            device_info = "Desktop/Laptop"
    
    new_session = UserSession(
        user_id=db_user.id,
        token=access_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
        device_info=device_info,
        is_active=True
    )
    db.add(new_session)
    db.commit()
    
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
async def google_callback(code: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

            # Create default nutrition meal for the new user
            try:
                today = datetime.now().strftime("%Y-%m-%d")
                
                # Create a breakfast meal
                default_meal = NutritionMeal(
                    name="Breakfast",
                    date=today,
                    time="08:00",
                    user_id=new_user.id
                )
                db.add(default_meal)
                db.flush()  # Get the meal ID without committing
                
                # Get some common breakfast foods from the database
                common_foods = db.query(CommonFood).limit(3).all()
                
                # If we have foods in the database, add them to the meal
                if common_foods:
                    for food in common_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food.name,
                            calories=food.calories,
                            protein=food.protein,
                            carbs=food.carbs,
                            fat=food.fat,
                            serving_size=food.serving_size,
                            quantity=1.0
                        )
                        db.add(meal_food)
                else:
                    # If no foods in database, add some default ones
                    default_foods = [
                        {
                            "name": "Oatmeal", 
                            "calories": 150, 
                            "protein": 5, 
                            "carbs": 27, 
                            "fat": 2.5, 
                            "serving_size": "1 cup"
                        },
                        {
                            "name": "Banana", 
                            "calories": 105, 
                            "protein": 1.3, 
                            "carbs": 27, 
                            "fat": 0.4, 
                            "serving_size": "1 medium"
                        }
                    ]
                    
                    for food_data in default_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food_data["name"],
                            calories=food_data["calories"],
                            protein=food_data["protein"],
                            carbs=food_data["carbs"],
                            fat=food_data["fat"],
                            serving_size=food_data["serving_size"],
                            quantity=1.0
                        )
                        db.add(meal_food)
                
                # Create default nutrition goals
                default_goals = NutritionGoal(
                    user_id=new_user.id,
                    calories=2000,
                    protein=150,
                    carbs=200,
                    fat=65
                )
                db.add(default_goals)
                
                db.commit()
                print(f"Created default meal and nutrition goals for new Google user: {new_user.email}")
            except Exception as e:
                print(f"Error creating default meal for new Google user: {str(e)}")
                # Don't fail registration if meal creation fails
                pass

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

        # Check for existing active sessions
        active_sessions = db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.now(timezone.utc)
        ).all()

        # If there are active sessions and multiple sessions aren't allowed
        if active_sessions and not user.allow_multiple_sessions:
            # Invalidate all existing sessions
            for session in active_sessions:
                session.is_active = False
            db.commit()
            print(f"Invalidated existing sessions for user {user.email} on new Google login")

        admin_settings = db.query(AdminSettings).first()
        session_timeout = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        if admin_settings:
            session_timeout = admin_settings.session_timeout

        access_token = create_access_token(
            {"sub": user.username}, timedelta(minutes=session_timeout)
        )

        # Create a new session record
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=session_timeout)
        user_agent = request.headers.get("user-agent", "")
        ip_address = request.client.host if request.client else None
        
        # Extract basic device info from user agent
        device_info = "Unknown"
        if user_agent:
            if "Mobile" in user_agent:
                device_info = "Mobile"
            elif "Tablet" in user_agent:
                device_info = "Tablet"
            else:
                device_info = "Desktop/Laptop"
        
        new_session = UserSession(
            user_id=user.id,
            token=access_token,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
            device_info=device_info,
            is_active=True
        )
        db.add(new_session)
        db.commit()

        # Update last login time
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        redirect_url = f"{settings.FRONTEND_URL}/login/success?token={access_token}"
        return Response(status_code=303, headers={"Location": redirect_url})
    except Exception as e:
        print(f"Google login failed: {str(e)}")
        import traceback
        traceback.print_exc()
        redirect_url = f"{settings.FRONTEND_URL}/login/error?message=Google login failed"
        return Response(status_code=303, headers={"Location": redirect_url})


@router.post("/google-verify", response_model=GoogleAuthResponse)
async def verify_google_token(
    request_data: GoogleTokenVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        print(f"=== GOOGLE VERIFICATION ATTEMPT ===")
        # Log the token length to avoid printing the whole token
        print(f"Received token of length: {len(request_data.token)}")
        
        # Check if this is a mobile request
        is_mobile = getattr(request_data, 'source', '') == 'mobile'
        if is_mobile:
            print("Request is from mobile device")
        
        print(f"Using Google Client ID: {GOOGLE_CLIENT_ID}")
        
        # Print other crucial info
        import sys
        print(f"Python version: {sys.version}")
        print(f"PyJWT version: {pyjwt.__version__}")
        print(f"Is Google Client ID set: {bool(GOOGLE_CLIENT_ID)}")
        
        if not GOOGLE_CLIENT_ID:
            print("ERROR: Missing Google Client ID")
            raise ValueError("Server configuration error: Missing Google Client ID")
        
        # Use a longer timeout for mobile devices
        request = google_requests.Request()
        
        try:
            id_info = id_token.verify_oauth2_token(
                request_data.token,
                request,
                GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=60 if is_mobile else 10  # Allow more clock skew for mobile
            )
        except ValueError as token_error:
            print(f"Token verification failed: {str(token_error)}")
            # Provide more friendly error messages for common issues
            error_message = str(token_error).lower()
            if "expired" in error_message:
                raise HTTPException(
                    status_code=401, 
                    detail="Your login session has expired. Please try logging in again."
                )
            elif "audience" in error_message:
                raise HTTPException(
                    status_code=401, 
                    detail="Authentication failed. Please ensure you're using the correct app."
                )
            else:
                raise HTTPException(
                    status_code=401, 
                    detail=f"Google login verification failed. Please try again."
                )

        print(f"Token verification successful!")
        print(f"Extracted email: {id_info.get('email')}")
        print(f"Extracted name: {id_info.get('name', 'Not provided')}")
        
        email = id_info.get('email')
        name = id_info.get('name', email.split(
            '@')[0] if email else "Google User")

        if not email:
            print(f"Error: No email found in token")
            raise HTTPException(
                status_code=400, detail="Email not found in token")

        print(f"Looking for existing user with email: {email}")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating new user with email: {email}")
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

            # Create default nutrition meal for the new user
            try:
                today = datetime.now().strftime("%Y-%m-%d")
                
                # Create a breakfast meal
                default_meal = NutritionMeal(
                    name="Breakfast",
                    date=today,
                    time="08:00",
                    user_id=user.id
                )
                db.add(default_meal)
                db.flush()  # Get the meal ID without committing
                
                # Get some common breakfast foods from the database
                common_foods = db.query(CommonFood).limit(3).all()
                
                # If we have foods in the database, add them to the meal
                if common_foods:
                    for food in common_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food.name,
                            calories=food.calories,
                            protein=food.protein,
                            carbs=food.carbs,
                            fat=food.fat,
                            serving_size=food.serving_size,
                            quantity=1.0
                        )
                        db.add(meal_food)
                else:
                    # If no foods in database, add some default ones
                    default_foods = [
                        {
                            "name": "Oatmeal", 
                            "calories": 150, 
                            "protein": 5, 
                            "carbs": 27, 
                            "fat": 2.5, 
                            "serving_size": "1 cup"
                        },
                        {
                            "name": "Banana", 
                            "calories": 105, 
                            "protein": 1.3, 
                            "carbs": 27, 
                            "fat": 0.4, 
                            "serving_size": "1 medium"
                        }
                    ]
                    
                    for food_data in default_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food_data["name"],
                            calories=food_data["calories"],
                            protein=food_data["protein"],
                            carbs=food_data["carbs"],
                            fat=food_data["fat"],
                            serving_size=food_data["serving_size"],
                            quantity=1.0
                        )
                        db.add(meal_food)
                
                # Create default nutrition goals
                default_goals = NutritionGoal(
                    user_id=user.id,
                    calories=2000,
                    protein=150,
                    carbs=200,
                    fat=65
                )
                db.add(default_goals)
                
                db.commit()
                print(f"Created default meal and nutrition goals for new Google user: {user.email}")
            except Exception as e:
                print(f"Error creating default meal for new Google user: {str(e)}")
                # Don't fail registration if meal creation fails
                pass

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
            print(f"Verifying existing user: {email}")
            user.is_verified = True
            db.commit()
        else:
            print(f"Existing verified user logging in: {email}")

        print(f"Creating access token for user {email}")
        try:
            access_token = create_access_token(
                {"sub": user.username},
                timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            print(f"Token created successfully!")
            
            # Construct response
            response = {"access_token": access_token, "token_type": "bearer"}
            print(f"Returning response: {response}")
            return response
            
        except Exception as token_error:
            print(f"Error creating access token: {str(token_error)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500, 
                detail=f"Error creating access token: {str(token_error)}"
            )

    except ValueError as e:
        print(f"Invalid token error: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail="Google login failed. Please try again or use email/password to sign in."
        )
    except HTTPException:
        # Re-raise HTTP exceptions as they already have proper status/detail
        raise
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Provide a more helpful message for mobile users
        if is_mobile:
            raise HTTPException(
                status_code=500, 
                detail="Google login failed on mobile. Please try again or use email login instead."
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail="Authentication error occurred. Please try again later."
            )


@router.post("/apple-verify", response_model=AppleAuthResponse)
async def verify_apple_token(
    request_data: AppleTokenVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Verify Apple Sign-In token and create/authenticate user
    """
    try:
        print(f"=== APPLE SIGN-IN VERIFICATION ATTEMPT ===")
        
        # Check if this is a mobile request
        is_mobile = getattr(request_data, 'source', '') == 'mobile'
        if is_mobile:
            print("Request is from mobile device")
        
        # Extract user information from Apple authorization
        authorization = request_data.authorization
        identity_token = authorization.get('id_token')
        
        if not identity_token:
            raise HTTPException(
                status_code=400, 
                detail="Apple Sign-In failed: No identity token received"
            )
        
        # For now, we'll create a basic user with Apple Sign-In
        # In production, you should verify the Apple JWT token properly
        # This is a simplified implementation for Apple's requirements
        
        # Extract email from Apple's response (if available)
        # Apple may not provide email if user chose to hide it
        email = authorization.get('user', {}).get('email')
        name = authorization.get('user', {}).get('name', {})
        
        # Create a display name
        if name and name.get('firstName') and name.get('lastName'):
            display_name = f"{name['firstName']} {name['lastName']}"
        elif name and name.get('firstName'):
            display_name = name['firstName']
        else:
            display_name = "Apple User"
        
        # If no email provided by Apple, create a placeholder
        if not email:
            # Generate a unique email for Apple users who hide their email
            apple_user_id = authorization.get('user', {}).get('id', 'unknown')
            email = f"apple_user_{apple_user_id}@privaterelay.appleid.com"
        
        print(f"Apple Sign-In - Email: {email}, Name: {display_name}")
        
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"Creating new Apple user with email: {email}")
            user = User(
                email=email,
                username=display_name,
                hashed_password="apple_oauth",
                is_verified=True,  # Apple accounts are already verified
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create default nutrition meal for the new user
            try:
                today = datetime.now().strftime("%Y-%m-%d")
                
                # Create a breakfast meal
                default_meal = NutritionMeal(
                    name="Breakfast",
                    date=today,
                    time="08:00",
                    user_id=user.id
                )
                db.add(default_meal)
                db.flush()  # Get the meal ID without committing
                
                # Get some common breakfast foods from the database
                common_foods = db.query(CommonFood).limit(3).all()
                
                # If we have foods in the database, add them to the meal
                if common_foods:
                    for food in common_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food.name,
                            calories=food.calories,
                            protein=food.protein,
                            carbs=food.carbs,
                            fat=food.fat,
                            serving_size=food.serving_size,
                            quantity=1.0
                        )
                        db.add(meal_food)
                else:
                    # If no foods in database, add some default ones
                    default_foods = [
                        {
                            "name": "Oatmeal", 
                            "calories": 150, 
                            "protein": 5, 
                            "carbs": 27, 
                            "fat": 3, 
                            "serving_size": "1 cup"
                        },
                        {
                            "name": "Banana", 
                            "calories": 105, 
                            "protein": 1, 
                            "carbs": 27, 
                            "fat": 0, 
                            "serving_size": "1 medium"
                        },
                        {
                            "name": "Milk", 
                            "calories": 150, 
                            "protein": 8, 
                            "carbs": 12, 
                            "fat": 8, 
                            "serving_size": "1 cup"
                        }
                    ]
                    
                    for food_data in default_foods:
                        meal_food = NutritionFood(
                            meal_id=default_meal.id,
                            name=food_data["name"],
                            calories=food_data["calories"],
                            protein=food_data["protein"],
                            carbs=food_data["carbs"],
                            fat=food_data["fat"],
                            serving_size=food_data["serving_size"],
                            quantity=1.0
                        )
                        db.add(meal_food)
                
                db.commit()
                print(f"Created default meal for new Apple user: {email}")
                
            except Exception as e:
                print(f"Error creating default meal for new Apple user: {str(e)}")
                # Don't fail registration if meal creation fails
                pass

            # Notify admin about new Apple user registration
            background_tasks.add_task(
                notify_admin_new_registration,
                user.id,
                user.email,
                user.username,
                via_google=False  # This is Apple, not Google
            )
        else:
            print(f"Existing Apple user logging in: {email}")

        # Create access token
        try:
            access_token = create_access_token(
                data={"sub": user.username, "email": user.email},
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            print(f"Apple Sign-In successful for user: {email}")
            
            return {"access_token": access_token, "token_type": "bearer"}
            
        except Exception as token_error:
            print(f"Error creating access token: {str(token_error)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500, 
                detail=f"Error creating access token: {str(token_error)}"
            )

    except HTTPException:
        # Re-raise HTTP exceptions as they already have proper status/detail
        raise
    except Exception as e:
        print(f"Apple Sign-In error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Provide a more helpful message for mobile users
        if is_mobile:
            raise HTTPException(
                status_code=500, 
                detail="Apple Sign-In failed on mobile. Please try again or use email login instead."
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail="Apple Sign-In error occurred. Please try again later."
            )


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
        
        # Notify admin about password change
        background_tasks.add_task(
            notify_admin_password_changed,
            user.id,
            user.email,
            user.username
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
async def verify_email(request: TokenVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
                
            return {"message": "Your email is already verified. You can now log in to your account.", "already_verified": True}
            
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
        
        # Notify admin about the email verification
        if settings.USE_GMAIL:
            background_tasks.add_task(
                notify_admin_account_verified,
                user.id,
                user.email,
                user.username
            )
        else:
            background_tasks.add_task(
                notify_admin_account_verified,
                user.id,
                user.email,
                user.username
            )
        
        return {"message": "Your email is now verified ✅. You can now log in to your account.", "already_verified": False}
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
    user: User = Depends(original_get_current_user),
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
async def confirm_account_deletion(
    request: ConfirmAccountDeletionRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    skip_relationships: bool = False
):
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
        
        print(f"Starting deletion process for user: {user.username} (ID: {user.id})")
        print(f"Skip relationships: {skip_relationships}")
        
        # Get inspector to check tables
        inspector = inspect(db.bind)
        existing_tables = inspector.get_table_names()
        print(f"Tables in database: {existing_tables}")
        
        # If skipping relationships, go straight to direct SQL deletion
        if skip_relationships:
            try:
                # Get username, email and id for logging
                username = user.username
                email = user.email
                user_id = user.id
                
                # Attempt direct SQL deletion
                print("Using direct SQL deletion (skipping relationships)...")
                # First get all related tables and cascade delete
                tables_with_user_fk = ['workouts', 'workout_preferences', 'user_achievements', 
                                      'notifications', 'custom_exercises', 'meals', 'nutrition_goals',
                                      'routines', 'routine_folders', 'saved_workout_programs']
                
                # Delete from these tables first to prevent foreign key violations
                for table in tables_with_user_fk:
                    if table in existing_tables:
                        try:
                            result = db.execute(text(f"DELETE FROM {table} WHERE user_id = :user_id"), 
                                              {"user_id": user_id})
                            print(f"Deleted from {table} table")
                        except Exception as table_error:
                            print(f"Error deleting from {table}: {str(table_error)}")
                
                # Delete user profile if it exists
                if 'user_profiles' in existing_tables:
                    try:
                        result = db.execute(text("DELETE FROM user_profiles WHERE user_id = :user_id"), 
                                          {"user_id": user_id})
                        print("Deleted user profile")
                    except Exception as profile_error:
                        print(f"Error deleting profile: {str(profile_error)}")
                
                # Finally delete the user
                result = db.execute(text("DELETE FROM users WHERE id = :user_id"), 
                                   {"user_id": user_id})
                db.commit()
                
                print(f"User {username} (ID: {user_id}, Email: {email}) deleted successfully via direct SQL")
                
                # Notify admin about account deletion
                background_tasks.add_task(
                    notify_admin_account_deletion,
                    user_id,
                    email,
                    username
                )
                
                return {"message": "Account deleted successfully"}
            except Exception as sql_error:
                db.rollback()
                print(f"Direct SQL deletion failed: {str(sql_error)}")
                raise HTTPException(status_code=500, detail=f"Database error during direct deletion: {str(sql_error)}")
        
        # Delete all user related data
        try:
            # Collect and log information about what we're deleting
            workouts_count = db.query(Workout).filter(Workout.user_id == user.id).count()
            print(f"Found {workouts_count} workouts to delete")
            
            # First, delete sets and exercises within workouts
            print("Deleting workout sets...")
            # Instead of joining and deleting directly, we'll get the IDs first then delete
            workout_ids = [id for (id,) in db.query(Workout.id).filter(Workout.user_id == user.id).all()]
            print(f"Found {len(workout_ids)} workout IDs")
            
            if workout_ids:
                exercise_ids = [id for (id,) in db.query(Exercise.id).filter(Exercise.workout_id.in_(workout_ids)).all()]
                print(f"Found {len(exercise_ids)} exercise IDs")
                
                if exercise_ids:
                    set_count = db.query(Set).filter(Set.exercise_id.in_(exercise_ids)).delete(synchronize_session=False)
                    print(f"Deleted {set_count} sets")
                
                exercise_count = db.query(Exercise).filter(Exercise.workout_id.in_(workout_ids)).delete(synchronize_session=False)
                print(f"Deleted {exercise_count} exercises")
            
            workout_count = db.query(Workout).filter(Workout.user_id == user.id).delete(synchronize_session=False)
            print(f"Deleted {workout_count} workouts")
            
            # Commit this batch to free up locks
            db.commit()
            
            # For tables with direct foreign keys to user, we need to delete them manually
            # Import all models but only use them if the table exists
            try:
                # Import models
                from models import (
                    UserProfile, UserAchievement, Notification, Routine, 
                    SavedWorkoutProgram, NutritionMeal, NutritionGoal,
                    NutritionFood, UserReward, UserUnlockedTemplates, CustomExercise,
                    RoutineFolder, AdminSettings
                )
                
                # Handle WorkoutPreferences if table exists
                if 'workout_preferences' in existing_tables:
                    print("Deleting workout preferences...")
                    count = db.query(WorkoutPreferences).filter(WorkoutPreferences.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} workout preferences")
                
                # Handle UserAchievement if table exists
                if 'user_achievements' in existing_tables:
                    print("Deleting user achievements...")
                    count = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} user achievements")
                
                # Handle Notification if table exists
                if 'notifications' in existing_tables:
                    print("Deleting notifications...")
                    count = db.query(Notification).filter(Notification.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} notifications")
                
                # Handle CustomExercise if table exists
                if 'custom_exercises' in existing_tables:
                    print("Deleting custom exercises...")
                    count = db.query(CustomExercise).filter(CustomExercise.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} custom exercises")
                
                # Handle NutritionMeal if table exists
                if 'meals' in existing_tables:
                    print("Deleting nutrition meals...")
                    count = db.query(NutritionMeal).filter(NutritionMeal.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} nutrition meals")
                
                # Handle NutritionGoal if table exists
                if 'nutrition_goals' in existing_tables:
                    print("Deleting nutrition goals...")
                    count = db.query(NutritionGoal).filter(NutritionGoal.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} nutrition goals")
                
                # Handle UserReward if table exists
                if 'user_rewards' in existing_tables:
                    print("Deleting user rewards...")
                    count = db.query(UserReward).filter(UserReward.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} user rewards")
                else:
                    print("Skipping user_rewards table - not found in database")
                
                # Handle SavedWorkoutProgram if table exists
                if 'saved_workout_programs' in existing_tables:
                    print("Deleting saved workout programs...")
                    count = db.query(SavedWorkoutProgram).filter(SavedWorkoutProgram.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} saved workout programs")
                
                # Commit this batch to free up locks
                db.commit()
                
                # Handle AdminSettings references - set updated_by to NULL where it references this user
                if 'admin_settings' in existing_tables:
                    print("Updating admin settings references...")
                    count = db.query(AdminSettings).filter(AdminSettings.updated_by == user.id).update(
                        {"updated_by": None}, synchronize_session=False
                    )
                    print(f"Updated {count} admin settings records")
                
                # Commit this batch
                db.commit()
                
                # Handle RoutineFolder if table exists
                if 'routine_folders' in existing_tables:
                    print("Deleting routine folders...")
                    count = db.query(RoutineFolder).filter(RoutineFolder.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} routine folders")
                    db.commit()
                
                # Handle UserUnlockedTemplates if table exists
                if 'user_unlocked_templates' in existing_tables:
                    print("Deleting unlocked templates...")
                    count = db.query(UserUnlockedTemplates).filter(UserUnlockedTemplates.user_id == user.id).delete(synchronize_session=False)
                    print(f"Deleted {count} unlocked templates")
                    db.commit()
                
                # Check if user has a profile and delete it
                if 'user_profiles' in existing_tables and hasattr(user, "profile") and user.profile:
                    print("Deleting user profile...")
                    db.delete(user.profile)
                    db.commit()
                    print("User profile deleted")
                
            except Exception as e:
                print(f"Warning during deletion of related data: {str(e)}")
                db.rollback()
                import traceback
                traceback.print_exc()
                # Continue with the deletion process
            
            # Delete profile picture if it exists
            if user.profile_picture:
                try:
                    file_path = os.path.join(".", user.profile_picture.lstrip("/"))
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        print(f"Deleted profile picture at {file_path}")
                except Exception as e:
                    print(f"Failed to delete profile picture: {str(e)}")
            
            try:
                # Get username before deleting for logging
                username = user.username
                email = user.email
                user_id = user.id
                
                # Try to handle any remaining relationships that might cause issues
                try:
                    # Delete the session key fields to further ensure no relationship loading
                    for attr_name in list(user.__dict__.keys()):
                        if attr_name.endswith('_id') or (attr_name != 'id' and attr_name not in ['username', 'email']):
                            setattr(user, attr_name, None)
                    db.flush()
                except Exception as attr_error:
                    print(f"Warning: Error clearing user attributes: {str(attr_error)}")
                
                # First try simply deleting the user
                try:
                    print("Attempting direct user deletion...")
                    db.delete(user)
                    db.commit()
                    print(f"User {username} (ID: {user_id}) deleted successfully via direct deletion")
                    
                    # Notify admin about account deletion
                    background_tasks.add_task(
                        notify_admin_account_deletion,
                        user_id,
                        email,
                        username
                    )
                    
                    return {"message": "Account deleted successfully"}
                except Exception as direct_delete_error:
                    print(f"Direct user deletion failed: {str(direct_delete_error)}")
                    db.rollback()
                    
                    # Fallback to SQL deletion
                    try:
                        print("Attempting SQL deletion as fallback...")
                        # Detach the user from the session to prevent relationship loading
                        db.expunge(user)
                        
                        # Use a direct SQL query to delete the user without loading relationships
                        result = db.execute(text("DELETE FROM users WHERE id = :user_id"), 
                                          {"user_id": user_id})
                        db.commit()
                        
                        print(f"User {username} (ID: {user_id}, Email: {email}) deleted successfully via SQL")
                        
                        # Notify admin about account deletion
                        background_tasks.add_task(
                            notify_admin_account_deletion,
                            user_id,
                            email,
                            username
                        )
                        
                        return {"message": "Account deleted successfully"}
                    except Exception as sql_error:
                        db.rollback()
                        print(f"SQL deletion also failed: {str(sql_error)}")
                        raise sql_error
                
            except Exception as final_e:
                db.rollback()
                print(f"Error in final user deletion: {str(final_e)}")
                import traceback
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"Database error during final user deletion: {str(final_e)}")
                
        except Exception as e:
            db.rollback()
            print(f"Error deleting user data: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Database error while deleting account data: {str(e)}")
            
    except HTTPException as http_ex:
        # Re-raise HTTP exceptions with the same status code and detail
        raise http_ex
    except Exception as e:
        db.rollback()
        # Log the error and return a generic message
        print(f"Unexpected error in confirm_account_deletion: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing your request")


@router.get("/verify-session", status_code=200)
async def verify_session(current_user: User = Depends(original_get_current_user)):
    """
    Verify if the current user's session is valid.
    This endpoint will return 200 if the token is valid, or 401 if it's invalid.
    """
    # Additional verification logic beyond the token check
    # If we got this far, the token is valid, but let's do extra checks
    
    # Check if the user is active
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # If everything is good, return user information
    return {
        "valid": True, 
        "username": current_user.username, 
        "is_admin": current_user.is_admin,
        "email": current_user.email,
        "user_id": current_user.id
    }


@router.post("/logout", status_code=200)
async def logout(token: str = Depends(oauth2_scheme), current_user: User = Depends(original_get_current_user), db: Session = Depends(get_db)):
    """
    Logout the current user by invalidating their token
    """
    try:
        # Invalidate current session in the database
        session = db.query(UserSession).filter(
            UserSession.token == token,
            UserSession.user_id == current_user.id,
            UserSession.is_active == True
        ).first()
        
        if session:
            session.is_active = False
            db.commit()
            print(f"Session for user {current_user.username} invalidated")
        
        # Add token to blacklist with expiry time from JWT payload
        try:
            payload = pyjwt.decode(
                token, settings.SECRET_KEY, algorithms=["HS256"])
            expire = payload.get("exp")
            
            if expire:
                current_time = int(datetime.now(timezone.utc).timestamp())
                expires_delta = expire - current_time
                if expires_delta > 0:
                    blacklist_token(token, expires_delta)
        except JWTError:
            # If token can't be decoded, blacklist it for a default period
            blacklist_token(token, 86400)  # 24 hours
            
        return {"message": "Successfully logged out"}
    except Exception as e:
        print(f"Error during logout: {str(e)}")
        return {"message": "Logout successful"}

# Update the imported get_current_user function to check for blacklisted tokens
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Check if token is blacklisted first
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if this is a valid session in the database
    try:
        # First, decode the token to get the username
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        payload = pyjwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Get the user ID
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise credentials_exception
        
        # Check if there is an active session with this token
        session = db.query(UserSession).filter(
            UserSession.token == token,
            UserSession.user_id == user.id,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.now(timezone.utc)
        ).first()
        
        if not session and not user.is_admin:  # Admins can bypass session checks for emergency access
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session is no longer active or has been logged out from another device",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        # If token decode fails, let the original function handle it
        pass
    
    # If not blacklisted and session is valid, use the original function
    return original_get_current_user(token, db)

@router.post("/resend-verification")
async def resend_verification(
    request: ResendVerificationRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend verification email to a user who hasn't verified their account yet"""
    try:
        # Find the user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        # If no user found, return a generic message for security
        if not user:
            return {"message": "If a user with this email exists and requires verification, a new verification email has been sent."}
        
        # If user is already verified, let them know
        if user.is_verified:
            return {"message": "This account is already verified. You can login now."}
        
        # Generate a new verification token
        token = generate_verification_token()
        expires = datetime.now(timezone.utc) + timedelta(hours=24)
        
        # Update the user's verification token
        user.verification_token = token
        user.verification_token_expires_at = expires
        db.commit()
        
        # Send the verification email
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        print(f"Resending verification email to {user.email}")
        
        # Use the appropriate email service
        if settings.USE_GMAIL:
            background_tasks.add_task(
                send_verification_email,
                user.email,
                verification_url
            )
        else:
            # Fallback to regular email service
            background_tasks.add_task(
                send_verification_email,
                user.email,
                verification_url
            )
        
        return {"message": "Verification email has been resent. Please check your inbox."}
        
    except Exception as e:
        print(f"Error in resend_verification: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail="An error occurred while sending the verification email. Please try again later."
        )

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(original_get_current_user),
    db: Session = Depends(get_db)
):
    """Change user's password with verification of old password"""
    try:
        # Validate new password length
        if not request.new_password or len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")
        
        # Verify old password
        if not pwd_context.verify(request.old_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect old password")
        
        # Update password
        user.hashed_password = pwd_context.hash(request.new_password)
        db.commit()
        
        # Send confirmation email
        background_tasks.add_task(
            send_password_changed_email,
            user.email
        )
        
        # Notify admin about password change
        background_tasks.add_task(
            notify_admin_password_changed,
            user.id,
            user.email,
            user.username
        )
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a generic message
        print(f"Error in change_password: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while changing your password")

@router.get("/sessions", response_model=list[UserSessionResponse])
async def get_user_sessions(current_user: User = Depends(original_get_current_user), db: Session = Depends(get_db)):
    """Get all active sessions for the current user"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).all()
    
    return sessions

@router.post("/sessions/revoke/{session_id}", status_code=200)
async def revoke_session(
    session_id: int, 
    current_user: User = Depends(original_get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a specific session by ID"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or already inactive"
        )
    
    session.is_active = False
    db.commit()
    
    # Add token to blacklist
    try:
        payload = pyjwt.decode(
            session.token, settings.SECRET_KEY, algorithms=["HS256"])
        expire = payload.get("exp")
        
        if expire:
            current_time = int(datetime.now(timezone.utc).timestamp())
            expires_delta = expire - current_time
            if expires_delta > 0:
                blacklist_token(session.token, expires_delta)
    except JWTError:
        # If token can't be decoded, blacklist it for a default period
        blacklist_token(session.token, 86400)  # 24 hours
    
    return {"message": "Session successfully revoked"}

@router.post("/sessions/revoke-all", status_code=200)
async def revoke_all_sessions(
    current_user: User = Depends(original_get_current_user),
    current_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Revoke all active sessions except the current one"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True,
        UserSession.token != current_token  # Keep current session active
    ).all()
    
    for session in sessions:
        session.is_active = False
        # Add token to blacklist
        try:
            payload = pyjwt.decode(
                session.token, settings.SECRET_KEY, algorithms=["HS256"])
            expire = payload.get("exp")
            
            if expire:
                current_time = int(datetime.now(timezone.utc).timestamp())
                expires_delta = expire - current_time
                if expires_delta > 0:
                    blacklist_token(session.token, expires_delta)
        except JWTError:
            # If token can't be decoded, blacklist it for a default period
            blacklist_token(session.token, 86400)  # 24 hours
    
    db.commit()
    return {"message": f"Successfully revoked {len(sessions)} sessions"}

@router.put("/sessions/settings", status_code=200)
async def update_session_settings(
    settings: SessionSettingsUpdate,
    current_user: User = Depends(original_get_current_user),
    db: Session = Depends(get_db)
):
    """Update session settings for the current user"""
    user = db.query(User).filter(User.id == current_user.id).first()
    user.allow_multiple_sessions = settings.allow_multiple_sessions
    db.commit()
    
    return {"message": "Session settings updated successfully"}

@router.post("/refresh-token", response_model=Token)
async def refresh_auth_token(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Refresh an authentication token
    """
    try:
        # First, verify the existing token
        payload = pyjwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=["HS256"]
        )
        
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Check if token is blacklisted
        if is_token_blacklisted(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get the user
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Ensure user is verified
        if not user.is_verified and settings.require_email_verification:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not verified. Please verify your email.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create a new token with refreshed expiry
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, 
            expires_delta=access_token_expires
        )
        
        # Update last_login in the user's profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if profile:
            profile.last_login = datetime.now(timezone.utc)
            db.commit()
        
        # Optionally blacklist the old token
        # blacklist_token(token, payload.get("exp", 3600))
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/validate-token", status_code=200)
async def validate_token(
    token: str = Depends(oauth2_scheme),
    user: User = Depends(original_get_current_user)
):
    """
    Validate that a token is still active and not blacklisted
    """
    # The token is validated by the dependency, so if we get here, it's valid
    return {"valid": True}
