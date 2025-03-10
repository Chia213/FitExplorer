from google.oauth2 import id_token
from google.auth.transport.requests import Request
from email_validator import validate_email, EmailNotValidError
import os
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
import jwt
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token
from config import settings

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
    print(f"🔑 Creating token with payload: {to_encode}")
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    print(f"📝 Registration attempt for: {user_data.email}")
    try:
        valid_email = validate_email(user_data.email).email
        domain = valid_email.split("@")[-1]
        if domain not in ALLOWED_EMAIL_DOMAINS:
            print(f"❌ Registration failed: Email domain {domain} not allowed")
            raise HTTPException(status_code=400, detail="Email domain not allowed")

    except EmailNotValidError:
        print(f"❌ Registration failed: Invalid email format: {user_data.email}")
        raise HTTPException(status_code=400, detail="Invalid email format.")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"❌ Registration failed: Email already registered: {user_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        username=user_data.username
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"✅ Registration successful for: {user_data.email}")

    return {"message": "User registered successfully!"}


@router.post("/token", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    print(f"🔑 Login attempt received for user: {user.email}")
    
    # Now log before each validation step
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        print(f"❌ Login failed: User {user.email} not found in database")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(user.password, db_user.hashed_password):
        print(f"❌ Login failed: Incorrect password for user {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"✅ Login successful for user: {user.email}")
    access_token = create_access_token(
        {"sub": db_user.email}, timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/login/google")
async def google_login():
    print("🔍 Starting Google OAuth flow")
    google_oauth = OAuth2Session(
        GOOGLE_CLIENT_ID, 
        redirect_uri=GOOGLE_REDIRECT_URI, 
        scope=["openid", "profile", "email"]
    )
    authorization_url, state = google_oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth",
        access_type="offline" 
    )
    
    print(f"🔍 Authorization URL: {authorization_url}")
    print(f"🔍 State: {state}")
    print(f"🔍 Redirect URI: {GOOGLE_REDIRECT_URI}")

    response = Response(status_code=303, headers={"Location": authorization_url})
    response.set_cookie(key="oauth_state", value=state, httponly=True, secure=False)  # Changed secure to False for development
    print("🔍 Redirecting to Google login page")
    return response

@router.get("/callback")
async def google_callback(code: str, state: str, request: Request, db: Session = Depends(get_db)):
    print("🔍 CALLBACK ROUTE REACHED")
    print(f"🔍 Full Request URL: {request.url}")
    print(f"🔍 Received code: {code}")
    print(f"🔍 Received state: {state}")
    
    # Get the stored state from the cookie
    stored_state = request.cookies.get("oauth_state")
    print(f"🔍 Stored state from cookie: {stored_state}")
    
    if not stored_state or stored_state != state:
        print("❌ State mismatch!")
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    try:
        # Create a new OAuth session
        google_oauth = OAuth2Session(
            GOOGLE_CLIENT_ID, 
            redirect_uri=GOOGLE_REDIRECT_URI
        )
        
        # Exchange the authorization code for tokens
        token = google_oauth.fetch_token(
            "https://oauth2.googleapis.com/token",
            client_secret=GOOGLE_CLIENT_SECRET,
            authorization_response=str(request.url),  # Added this line to use complete URL
            code=code
        )
        print(f"🔍 Fetched token: {token}")

        # Verify the ID token
        id_info = id_token.verify_oauth2_token(
            token['id_token'], 
            Request(), 
            GOOGLE_CLIENT_ID
        )
        print(f"🔍 ID Token info: {id_info}")

        # Extract user information
        user_info = {
            'email': id_info.get('email'),
            'name': id_info.get('name', id_info.get('email').split('@')[0]),
        }
        print(f"🔍 User Info: {user_info}")

        # Look up or create the user
        existing_user = db.query(User).filter(
            User.email == user_info["email"]).first()
        
        if not existing_user:
            print(f"🔍 Creating new user for Google account: {user_info['email']}")
            new_user = User(
                email=user_info["email"],
                username=user_info["name"],
                hashed_password="google_oauth",
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
        else:
            print(f"🔍 Found existing user for Google account: {user_info['email']}")
            user = existing_user

        # Create an access token for our app
        access_token = create_access_token(
            {"sub": user.email}, 
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        print(f"✅ Google authentication successful for: {user.email}")

        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user_email": user.email
        }

    except Exception as e:
        print(f"❌ Error in Google callback: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")