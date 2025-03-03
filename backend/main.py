from fastapi import FastAPI, Depends
from database import engine, Base
from auth import router as auth_router
from dependencies import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)


@app.get("/protected-route")
def protected_route(user: dict = Depends(get_current_user)):
    return {"email": user.email}
