from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from config import SECRET_KEY
from database import get_db
from models import User
from security import decode_access_token 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401, detail="Could not validate credentials"
    )

    try:
        payload = decode_access_token(token)
        if payload is None or "sub" not in payload:
            raise credentials_exception

        username = payload["sub"]
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception

        return user 

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")