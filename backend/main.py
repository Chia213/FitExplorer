from fastapi import FastAPI, Depends
from database import engine, Base
from auth import router as auth_router
from dependencies import get_current_user
from sqlalchemy.orm import Session
from database import get_db
from models import Workout

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)


@app.get("/protected-route")
def protected_route(user: dict = Depends(get_current_user)):
    return {"email": user.email}


@app.get("/workouts")
def get_workouts(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Workout).all()


@app.post("/workouts")
def add_workout(workout: Workout, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout
