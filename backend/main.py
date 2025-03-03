from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from auth import router as auth_router
from dependencies import get_current_user
from models import Workout
from schemas import WorkoutCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/protected-route")
def protected_route(user: dict = Depends(get_current_user)):
    return {"email": user.email}


@app.get("/workouts")
def get_workouts(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Workout).filter(Workout.user_id == user.id).all()


@app.post("/workouts")
def add_workout(workout: WorkoutCreate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    new_workout = Workout(
        name=workout.name,
        date=workout.date,
        start_time=workout.start_time,
        end_time=workout.end_time,
        bodyweight=workout.bodyweight,
        notes=workout.notes,
        user_id=user.id
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout
