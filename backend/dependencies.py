from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
import jwt
from config import SECRET_KEY
from database import get_db
from models import User
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=401, detail="Invalid token"
            )

        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(
                status_code=401, detail="User not found"
            )

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, detail="Token expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401, detail="Invalid token"
        )
