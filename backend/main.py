from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from database import engine, Base, get_db
from auth import router as auth_router
from dependencies import get_current_user
from models import Workout, User, Exercise, Set
from schemas import WorkoutCreate, WorkoutResponse

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


@app.get("/workouts", response_model=list[WorkoutResponse])
def get_workouts(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):

    workouts = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.user_id == user.id)\
        .all()
    return workouts


@app.post("/workouts", response_model=WorkoutResponse)
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

    if hasattr(workout, 'exercises') and workout.exercises:
        for exercise_data in workout.exercises:

            new_exercise = Exercise(
                name=exercise_data.name,
                category=getattr(exercise_data, 'category', None),
                is_cardio=getattr(exercise_data, 'isCardio', False),
                workout_id=new_workout.id
            )
            db.add(new_exercise)
            db.commit()
            db.refresh(new_exercise)

            if hasattr(exercise_data, 'sets') and exercise_data.sets:
                for set_data in exercise_data.sets:

                    new_set = Set(
                        weight=getattr(set_data, 'weight', None),
                        reps=getattr(set_data, 'reps', None),
                        distance=getattr(set_data, 'distance', None),
                        duration=getattr(set_data, 'duration', None),
                        intensity=getattr(set_data, 'intensity', None),
                        notes=getattr(set_data, 'notes', None),
                        exercise_id=new_exercise.id
                    )
                    db.add(new_set)

                db.commit()

    complete_workout = db.query(Workout)\
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))\
        .filter(Workout.id == new_workout.id)\
        .first()

    return complete_workout


@app.get("/profile")
def profile(user: User = Depends(get_current_user)):
    return {"username": user.username, "email": user.email}
