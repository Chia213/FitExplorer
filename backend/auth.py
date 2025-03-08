from google.oauth2 import id_token
from google.auth.transport.requests import Request
import os
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import JSONResponse
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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email,
                    hashed_password=hashed_password, username=user.username)
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}


@router.post("/token", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        {"sub": db_user.email}, timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/login/google")
async def google_login():
    google_oauth = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=[
                                 "openid", "profile", "email"])
    authorization_url, state = google_oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth")
    response = Response(status_code=303, headers={"Location": authorization_url})
    response.set_cookie(key="oauth_state", value=state)
    return response


@router.get("/auth/callback")
async def google_callback(code: str, state: str, request: Request, db: Session = Depends(get_db)):
    stored_state = request.cookies.get("oauth_state")
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    google_oauth = OAuth2Session(
        GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI)
    google_oauth.fetch_token(
        "https://accounts.google.com/o/oauth2/token",
        authorization_response=f"http://localhost:8000/auth/callback?code={code}&state={state}",
        client_secret=GOOGLE_CLIENT_SECRET,
    )
    
    response = JSONResponse(content={})
    response.delete_cookie(key="oauth_state")
    
    token = google_oauth.token['access_token']
    try:
        id_info = id_token.verify_oauth2_token(
            token, Request(), GOOGLE_CLIENT_ID)

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
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
        else:
            user = existing_user

        access_token = create_access_token(
            {"sub": user.email}, timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        token_response = {"access_token": access_token, "token_type": "bearer"}
        return token_response

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
