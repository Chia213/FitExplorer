from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from email_validator import validate_email, EmailNotValidError
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
from jose import jwt
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token
from config import settings

from requests_oauthlib import OAuth2Session
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

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
    logger.info(f"Creating token with payload: {to_encode}")
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registration attempt for: {user_data.email}")
    try:
        valid_email = validate_email(user_data.email).email
        domain = valid_email.split("@")[-1]
        if domain not in ALLOWED_EMAIL_DOMAINS:
            logger.warning(f"Registration failed: Email domain {domain} not allowed")
            raise HTTPException(status_code=400, detail="Email domain not allowed")

    except EmailNotValidError:
        logger.warning(f"Registration failed: Invalid email format: {user_data.email}")
        raise HTTPException(status_code=400, detail="Invalid email format.")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email already registered: {user_data.email}")
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
    logger.info(f"Registration successful for: {user_data.email}")

    return {"message": "User registered successfully!"}


@router.post("/token", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt received for user: {user.email}")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        logger.warning(f"Login failed: User {user.email} not found in database")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(user.password, db_user.hashed_password):
        logger.warning(f"Login failed: Incorrect password for user {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"Login successful for user: {user.email}")
    access_token = create_access_token(
        {"sub": db_user.email}, timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/login/google")
async def google_login():
    logger.info("Starting Google OAuth flow")
    google_oauth = OAuth2Session(
        GOOGLE_CLIENT_ID, 
        redirect_uri=GOOGLE_REDIRECT_URI, 
        scope=["openid", "profile", "email"]
    )
    authorization_url, state = google_oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth",
        access_type="offline" 
    )
    
    logger.debug(f"Authorization URL: {authorization_url}")
    logger.debug(f"State: {state}")
    logger.debug(f"Redirect URI: {GOOGLE_REDIRECT_URI}")

    response = Response(status_code=303, headers={"Location": authorization_url})
    response.set_cookie(key="oauth_state", value=state, httponly=True, secure=False)
    logger.info("Redirecting to Google login page")
    return response

@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    logger.info("CALLBACK ROUTE REACHED")
    
    params = dict(request.query_params)
    code = params.get("code")
    state = params.get("state")
    
    if not code or not state:
        logger.error("Missing code or state parameter")
        return Response(
            status_code=303, 
            headers={"Location": f"http://localhost:5173/login?error=Missing+required+parameters"}
        )
    
    logger.debug(f"Full Request URL: {request.url}")
    logger.debug(f"Received code: {code}")
    logger.debug(f"Received state: {state}")
    
    stored_state = request.cookies.get("oauth_state")
    logger.debug(f"Stored state from cookie: {stored_state}")
    
    if not stored_state or stored_state != state:
        logger.warning("State mismatch!")
        return Response(
            status_code=303, 
            headers={"Location": f"http://localhost:5173/login?error=Invalid+state+parameter"}
        )
    
    try:
        google_oauth = OAuth2Session(
            GOOGLE_CLIENT_ID, 
            redirect_uri=GOOGLE_REDIRECT_URI
        )
        
        token = google_oauth.fetch_token(
            "https://oauth2.googleapis.com/token",
            client_secret=GOOGLE_CLIENT_SECRET,
            authorization_response=str(request.url),
            code=code
        )
        logger.debug(f"Fetched token: {token}")

        request_obj = google_requests.Request()
        
        id_info = id_token.verify_oauth2_token(
            token['id_token'], 
            request_obj,
            GOOGLE_CLIENT_ID
        )
        logger.debug(f"ID Token info: {id_info}")

        user_info = {
            'email': id_info.get('email'),
            'name': id_info.get('name', id_info.get('email').split('@')[0]),
        }
        logger.info(f"User Info: {user_info}")

        existing_user = db.query(User).filter(
            User.email == user_info["email"]).first()
        
        if not existing_user:
            logger.info(f"Creating new user for Google account: {user_info['email']}")
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
            logger.info(f"Found existing user for Google account: {user_info['email']}")
            user = existing_user

        access_token = create_access_token(
            {"sub": user.email}, 
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        logger.info(f"Google authentication successful for: {user.email}")

        redirect_url = f"http://localhost:5173/login?token={access_token}&email={user.email}"
        return Response(status_code=303, headers={"Location": redirect_url})

    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}")
        error_msg = str(e).replace(" ", "+")
        return Response(
            status_code=303, 
            headers={"Location": f"http://localhost:5173/login?error={error_msg}"}
        )