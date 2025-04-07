from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import jwt as pyjwt
from database import get_db
from models import User
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        print(f"Received token: {token[:10]}...")  # Print first 10 chars of token for debugging
        payload = pyjwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")

        if username is None:
            print("Token decoded but no username (sub) found in payload")
            raise HTTPException(
                status_code=401, detail="Invalid token"
            )

        print(f"Looking up user with username: {username}")
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            print(f"User {username} not found in database")
            raise HTTPException(
                status_code=401, detail="User not found"
            )

        print(f"User authenticated: {user.username}")
        return user

    except pyjwt.ExpiredSignatureError as e:
        print(f"Token expired: {str(e)}")
        raise HTTPException(
            status_code=401, detail="Token expired"
        )
    except pyjwt.PyJWTError as e:
        print(f"PyJWT Error: {str(e)}")
        raise HTTPException(
            status_code=401, detail="Invalid token"
        )
    except Exception as e:
        print(f"Unexpected error in get_current_user: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Authentication error: {str(e)}"
        )


def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    print(f"User attempting admin access: {current_user.username}")
    print(f"User is_admin status: {current_user.is_admin}")

    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Admin access required."
        )
    return current_user
