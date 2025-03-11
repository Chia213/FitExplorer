import logging
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from database import get_db
from models import User
from security import decode_access_token

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    logger.info("Validating token for protected route")
    credentials_exception = HTTPException(
        status_code=401, 
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = decode_access_token(token)
        logger.debug(f"Token payload: {payload}")
        
        if payload is None or "sub" not in payload:
            logger.warning("Invalid payload structure")
            raise credentials_exception

        user_email = payload["sub"]
        logger.debug(f"Looking up user: {user_email}")
        
        user = db.query(User).filter(User.email == user_email).first()
        if user is None:
            logger.warning(f"User not found: {user_email}")
            raise credentials_exception

        logger.info(f"Authentication successful for user: {user.email}")
        return user 

    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    except Exception as e:
        logger.error(f"Unexpected error during authentication: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")