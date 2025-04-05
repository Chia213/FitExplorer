from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, workouts, achievements
from app.routers import workout_templates  # Import the new router

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(achievements.router)
app.include_router(workout_templates.router)  # Add the new router

@app.get("/")
async def root():
    return {"message": "Welcome to the Fitness App API"} 