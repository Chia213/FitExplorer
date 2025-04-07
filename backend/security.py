from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt as pyjwt
import secrets
from fastapi import HTTPException
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_verification_token():
    """Generate a random token for email verification"""
    return secrets.token_urlsafe(32)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + \
        (expires_delta if expires_delta else timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    print(f"Creating token with payload: {to_encode}")
    
    try:
        # Always make sure we're using pyjwt directly to avoid any confusion
        encoded_jwt = pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
        print(f"JWT encoding successful: {encoded_jwt[:10]}...")
        return encoded_jwt
    except Exception as e:
        print(f"JWT encoding error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Token creation failed: {str(e)}"
        )


def decode_access_token(token: str):
    try:
        payload = pyjwt.decode(token, settings.SECRET_KEY,
                             algorithms=[ALGORITHM])
        return payload
    except Exception as e:
        print(f"Token decode error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
