from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models import User
from dependencies import get_current_user
from typing import Dict, Any, List, Optional
import os
import requests
import json
from dotenv import load_dotenv
from pydantic import BaseModel
import re

load_dotenv()

router = APIRouter(
    prefix="/api/ai-workout",
    tags=["ai-workout"],
)

# Pydantic models for request and response
class WorkoutGenerationRequest(BaseModel):
    fitnessGoal: str  # strength, hypertrophy, endurance, weight_loss, general_fitness
    experienceLevel: str  # beginner, intermediate, advanced
    workoutDuration: str  # in minutes
    daysPerWeek: str  # number of days per week
    equipment: str  # none, basic, home_gym, full_gym
    injuries: Optional[str] = None
    preferences: Optional[str] = None

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest: str

class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: List[Exercise]
    notes: Optional[str] = None

class WorkoutPlan(BaseModel):
    name: str
    description: str
    days: List[WorkoutDay]

# Get Hugging Face API token from environment variables
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
# Default to a good general purpose model if no specific one is set
AI_MODEL = os.getenv("AI_MODEL", "meta-llama/Llama-2-7b-chat-hf")

def generate_workout_with_huggingface(prompt: str) -> str:
    """
    Generate workout using Hugging Face's API with the specified model.
    """
    if not HUGGINGFACE_API_TOKEN:
        print("ERROR: Hugging Face API token not configured")
        raise HTTPException(status_code=500, detail="Hugging Face API token not configured")
    
    api_url = f"https://api-inference.huggingface.co/models/{AI_MODEL}"
    
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 1024,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True
        }
    }
    
    try:
        print(f"Calling Hugging Face API for model: {AI_MODEL}")
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        # Check for specific error conditions
        if response.status_code == 401:
            print("ERROR: Unauthorized request to Hugging Face API. Check your API token.")
            raise HTTPException(status_code=500, detail="Authentication error with Hugging Face API")
        
        if response.status_code == 503:
            print("ERROR: Hugging Face model is currently loading or unavailable")
            # This is often a temporary condition when the model is warming up
            raise HTTPException(status_code=500, detail="Model is loading or unavailable. Please try again in a few moments.")
            
        # Force the response to raise an HTTPError for bad status codes
        response.raise_for_status()
        
        # Parse response based on the format returned by the model
        result = response.json()
        print(f"Received response from Hugging Face API: {result}")
        
        if isinstance(result, list) and len(result) > 0:
            if "generated_text" in result[0]:
                return result[0]["generated_text"]
            elif "error" in result[0]:
                print(f"ERROR: API error from Hugging Face: {result[0]['error']}")
                raise HTTPException(status_code=500, detail=f"Error from Hugging Face API: {result[0]['error']}")
            else:
                return str(result[0])
        elif isinstance(result, dict):
            if "generated_text" in result:
                return result["generated_text"]
            elif "error" in result:
                print(f"ERROR: API error from Hugging Face: {result['error']}")
                raise HTTPException(status_code=500, detail=f"Error from Hugging Face API: {result['error']}")
            else:
                return str(result)
        else:
            return str(result)
            
    except requests.exceptions.Timeout:
        print("ERROR: Timeout when calling Hugging Face API")
        raise HTTPException(status_code=500, detail="Request to Hugging Face API timed out. The model may be under heavy load.")
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection error when calling Hugging Face API")
        raise HTTPException(status_code=500, detail="Connection error when calling Hugging Face API. Please check your internet connection.")
        
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Exception when calling Hugging Face API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling Hugging Face API: {str(e)}")
        
    except Exception as e:
        print(f"ERROR: Unexpected exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

def format_workout_prompt(request: WorkoutGenerationRequest) -> str:
    """
    Format the user's request into a prompt for the AI model.
    """
    prompt = f"""Generate a detailed workout plan with the following requirements:

Fitness Goal: {request.fitnessGoal}
Experience Level: {request.experienceLevel}
Workout Duration: {request.workoutDuration} minutes
Days Per Week: {request.daysPerWeek}
Equipment Available: {request.equipment}
"""

    if request.injuries:
        prompt += f"Injuries/Limitations: {request.injuries}\n"
    
    if request.preferences:
        prompt += f"Additional Preferences: {request.preferences}\n"
    
    prompt += """
The workout plan should include:
1. A name for the program
2. A brief description
3. A day-by-day breakdown for a full week (including rest days)
4. For each workout day:
   - Day number/name
   - Workout focus (muscle groups)
   - List of exercises with sets, reps, and rest periods
   - Any special notes

Format the response as valid JSON following this structure exactly:
{
  "name": "Program Name",
  "description": "Program description",
  "days": [
    {
      "day": "Day 1",
      "focus": "Chest and Triceps",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60-90 sec"
        }
      ],
      "notes": "Any special instructions"
    }
  ]
}

Important: Ensure the response is a single, valid JSON object.
"""
    return prompt

def parse_ai_response(response: str) -> WorkoutPlan:
    """
    Parse the AI response into a structured workout plan.
    """
    try:
        print(f"Parsing AI response of length: {len(response)}")
        
        # Extract the JSON content from the response
        # This handles cases where the model might add text before or after the JSON
        start_idx = response.find('{')
        end_idx = response.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            print("ERROR: No JSON object found in response")
            raise ValueError("No JSON object found in response")
        
        json_str = response[start_idx:end_idx]
        
        # Try to clean up the JSON if it's malformed
        # Replace any instances of single quotes with double quotes for JSON compatibility
        json_str = json_str.replace("'", '"')
        
        try:
            workout_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"ERROR: JSON decode error: {str(e)}")
            print(f"Attempting to fix common JSON issues...")
            
            # Try to fix common JSON issues
            # 1. Remove any trailing commas in arrays or objects
            json_str = re.sub(r',\s*}', '}', json_str)
            json_str = re.sub(r',\s*]', ']', json_str)
            
            # 2. Ensure property names are quoted
            json_str = re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', json_str)
            
            # Try parsing again
            try:
                workout_data = json.loads(json_str)
            except json.JSONDecodeError:
                # If still failing, create a basic fallback workout
                print("ERROR: Could not parse JSON even after fixes. Using fallback structure.")
                return create_fallback_workout_plan()
        
        print(f"Successfully parsed workout data")
        
        # Check if the workout_data has the required structure
        if not isinstance(workout_data, dict) or 'days' not in workout_data:
            print("ERROR: Workout data missing required structure")
            workout_data = add_missing_structure(workout_data)
        
        # Validate and convert to the proper structure
        return WorkoutPlan(
            name=workout_data.get("name", "AI Generated Workout Plan"),
            description=workout_data.get("description", "Custom workout plan based on your preferences"),
            days=[
                WorkoutDay(
                    day=day.get("day", f"Day {i+1}"),
                    focus=day.get("focus", "Full Body"),
                    exercises=[
                        Exercise(
                            name=exercise.get("name", "Exercise"),
                            sets=parse_sets(exercise.get("sets", 3)),
                            reps=exercise.get("reps", "10-12"),
                            rest=exercise.get("rest", "60 sec")
                        )
                        for exercise in day.get("exercises", [])
                    ],
                    notes=day.get("notes")
                )
                for i, day in enumerate(workout_data.get("days", []))
            ]
        )
    except (json.JSONDecodeError, ValueError) as e:
        # If parsing fails, create a fallback workout plan
        print(f"ERROR: Failed to parse AI response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        print(f"ERROR: Unexpected exception in parse_ai_response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error parsing response: {str(e)}")

def parse_sets(sets_value):
    """
    Parse the sets value to ensure it's an integer
    """
    if isinstance(sets_value, int):
        return sets_value
    
    try:
        return int(sets_value)
    except (ValueError, TypeError):
        # Default to 3 sets if cannot convert
        return 3

def add_missing_structure(data):
    """
    Add missing structure to workout data if the AI response is incomplete
    """
    if not isinstance(data, dict):
        data = {}
    
    if 'name' not in data:
        data['name'] = "AI Generated Workout Plan"
    
    if 'description' not in data:
        data['description'] = "Custom workout plan based on your preferences"
    
    if 'days' not in data:
        data['days'] = [
            {
                "day": "Day 1",
                "focus": "Full Body",
                "exercises": [
                    {
                        "name": "Push-ups",
                        "sets": 3,
                        "reps": "10-12",
                        "rest": "60 sec"
                    },
                    {
                        "name": "Squats",
                        "sets": 3,
                        "reps": "10-12",
                        "rest": "60 sec"
                    }
                ],
                "notes": "Start with these basic exercises and adjust based on your fitness level."
            }
        ]
    
    return data

def create_fallback_workout_plan():
    """
    Create a basic fallback workout plan when parsing fails
    """
    return WorkoutPlan(
        name="Basic Workout Plan (Fallback)",
        description="A basic workout plan created when the AI-generated plan couldn't be processed.",
        days=[
            WorkoutDay(
                day=f"Day {i+1}",
                focus=focus,
                exercises=[
                    Exercise(
                        name="Push-ups",
                        sets=3,
                        reps="10-12",
                        rest="60 sec"
                    ),
                    Exercise(
                        name="Squats",
                        sets=3,
                        reps="10-12",
                        rest="60 sec"
                    ),
                    Exercise(
                        name="Plank",
                        sets=3,
                        reps="30 sec",
                        rest="60 sec"
                    )
                ] if focus != "Rest" else [],
                notes="Basic workout focusing on bodyweight exercises. Adjust reps based on your fitness level."
                if focus != "Rest" else "Rest day. Focus on recovery, stretching, and mobility."
            )
            for i, focus in enumerate(["Full Body", "Rest", "Full Body", "Rest", "Full Body", "Rest", "Rest"])
        ]
    )

@router.post("/generate", response_model=WorkoutPlan)
async def generate_workout(
    request: WorkoutGenerationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a personalized workout plan using AI.
    """
    try:
        # Format the prompt for the AI model
        prompt = format_workout_prompt(request)
        
        # Try with the primary model first
        try:
            print(f"Attempting to generate workout with primary model: {AI_MODEL}")
            ai_response = generate_workout_with_huggingface(prompt)
            workout_plan = parse_ai_response(ai_response)
            return workout_plan
        except HTTPException as e:
            # If primary model fails, try with a fallback model
            print(f"Primary model failed with error: {str(e)}")
            print("Trying fallback model: google/flan-t5-base")
            
            # Try with a smaller, more reliable model
            try:
                fallback_model = "google/flan-t5-base"
                
                # Shorten the prompt for the smaller model
                shorter_prompt = f"""Create a workout plan for:
Fitness Goal: {request.fitnessGoal}
Experience: {request.experienceLevel}
Days per week: {request.daysPerWeek}
Format as JSON with name, description, and days (array of day objects with focus, exercises array)
"""
                
                # Use overridden model
                original_model = AI_MODEL
                os.environ["AI_MODEL"] = fallback_model
                
                ai_response = generate_workout_with_huggingface(shorter_prompt)
                
                # Restore original model
                os.environ["AI_MODEL"] = original_model
                
                workout_plan = parse_ai_response(ai_response)
                return workout_plan
            except Exception as fallback_error:
                print(f"Fallback model also failed: {str(fallback_error)}")
                # If both models fail, go to the rule-based fallback
                raise e
        
    except Exception as e:
        print(f"Error generating workout: {str(e)}")
        # Use the fallback endpoint logic directly
        return await generate_workout_fallback(request, user)

# Fallback endpoint that uses a rule-based approach if the AI integration fails
@router.post("/generate-fallback", response_model=WorkoutPlan)
async def generate_workout_fallback(
    request: WorkoutGenerationRequest,
    user: User = Depends(get_current_user)
):
    """
    Generate a workout plan using a rule-based approach when AI is unavailable.
    """
    days_per_week = int(request.daysPerWeek)
    goal = request.fitnessGoal
    experience = request.experienceLevel
    equipment = request.equipment
    
    # Define workout splits based on days per week
    workout_splits = {
        3: ["Full Body", "Rest", "Full Body", "Rest", "Full Body", "Rest", "Rest"],
        4: ["Upper Body", "Lower Body", "Rest", "Upper Body", "Lower Body", "Rest", "Rest"],
        5: ["Push", "Pull", "Legs", "Upper Body", "Lower Body", "Rest", "Rest"],
        6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"]
    }
    
    # Use 3-day split as fallback
    split = workout_splits.get(days_per_week, workout_splits[3])
    
    # Create the workout days
    workout_days = []
    
    for i, focus in enumerate(split):
        if focus == "Rest":
            workout_days.append(WorkoutDay(
                day=f"Day {i+1}",
                focus="Rest",
                exercises=[],
                notes="Recovery day. Focus on stretching, mobility, or light cardio if desired."
            ))
            continue
        
        # Generate exercises based on the focus
        exercises = []
        
        if focus in ["Full Body", "Upper Body", "Push"]:
            # Chest exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Bench Press",
                    sets=5 if goal == "strength" else 3,
                    reps="5" if goal == "strength" else "8-12",
                    rest="3 min" if goal == "strength" else "60-90 sec"
                ))
            else:
                exercises.append(Exercise(
                    name="Push-ups",
                    sets=3,
                    reps="8-15",
                    rest="60-90 sec"
                ))
                
            # Shoulder exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Overhead Press",
                    sets=4 if goal == "strength" else 3,
                    reps="6-8" if goal == "strength" else "8-12",
                    rest="2-3 min" if goal == "strength" else "60-90 sec"
                ))
            else:
                exercises.append(Exercise(
                    name="Pike Push-ups",
                    sets=3,
                    reps="8-12",
                    rest="60-90 sec"
                ))
            
            # Triceps
            exercises.append(Exercise(
                name="Tricep Dips" if equipment == "none" else "Tricep Pushdowns",
                sets=3,
                reps="8-12",
                rest="60-90 sec"
            ))
        
        if focus in ["Full Body", "Upper Body", "Pull"]:
            # Back exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Pull-ups" if experience != "beginner" else "Lat Pulldowns",
                    sets=4 if goal == "strength" else 3,
                    reps="6-8" if goal == "strength" else "8-12",
                    rest="2-3 min" if goal == "strength" else "60-90 sec"
                ))
            else:
                exercises.append(Exercise(
                    name="Inverted Rows",
                    sets=3,
                    reps="8-12",
                    rest="60-90 sec"
                ))
            
            # More back exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Barbell Rows",
                    sets=4 if goal == "strength" else 3,
                    reps="6-8" if goal == "strength" else "8-12",
                    rest="2-3 min" if goal == "strength" else "60-90 sec"
                ))
            
            # Biceps
            exercises.append(Exercise(
                name="Bicep Curls" if equipment != "none" else "Chin-ups",
                sets=3,
                reps="8-12",
                rest="60-90 sec"
            ))
        
        if focus in ["Full Body", "Lower Body", "Legs"]:
            # Quad exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Squats",
                    sets=5 if goal == "strength" else 3,
                    reps="5" if goal == "strength" else "8-12",
                    rest="3 min" if goal == "strength" else "60-90 sec"
                ))
            else:
                exercises.append(Exercise(
                    name="Bodyweight Squats",
                    sets=3,
                    reps="15-20",
                    rest="60-90 sec"
                ))
            
            # Hamstring exercises
            if equipment in ["full_gym", "home_gym"]:
                exercises.append(Exercise(
                    name="Romanian Deadlifts",
                    sets=4 if goal == "strength" else 3,
                    reps="6-8" if goal == "strength" else "8-12",
                    rest="2-3 min" if goal == "strength" else "60-90 sec"
                ))
            else:
                exercises.append(Exercise(
                    name="Glute Bridges",
                    sets=3,
                    reps="12-15",
                    rest="60 sec"
                ))
                
            # Calves
            exercises.append(Exercise(
                name="Calf Raises",
                sets=3,
                reps="12-15",
                rest="60 sec"
            ))
        
        # Add cardio for endurance or weight loss goals
        if goal in ["endurance", "weight_loss"]:
            exercises.append(Exercise(
                name="HIIT Cardio" if goal == "weight_loss" else "Steady State Cardio",
                sets=1,
                reps="20 minutes",
                rest="N/A"
            ))
        
        workout_days.append(WorkoutDay(
            day=f"Day {i+1}",
            focus=focus,
            exercises=exercises,
            notes=f"Focus on progressive overload. Adjust weights based on your {experience} experience level."
        ))
    
    # Create the workout plan
    workout_plan = WorkoutPlan(
        name=f"AI-Generated {goal.capitalize()} Program",
        description=f"Custom {goal} workout program generated for {experience} level with {equipment} equipment. {days_per_week} workouts per week.",
        days=workout_days
    )
    
    return workout_plan 