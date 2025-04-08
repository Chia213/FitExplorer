from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from database import get_db
from dependencies import get_current_user
from models import User, NutritionMeal, NutritionFood, NutritionGoal, CommonFood, Workout, Exercise
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from sqlalchemy import or_, desc, func, String
import random

load_dotenv()

router = APIRouter(prefix="/nutrition", tags=["nutrition"])

# Pydantic models
class FoodBase(BaseModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: str
    quantity: Optional[float] = 1.0

class MealCreate(BaseModel):
    name: str
    date: str
    time: str
    foods: List[FoodBase]

class MealResponse(BaseModel):
    id: int
    name: str
    date: str
    time: str
    foods: List[FoodBase]

class NutritionGoalUpdate(BaseModel):
    calories: int
    protein: int
    carbs: int
    fat: int

class NutritionHistoryResponse(BaseModel):
    date: str
    calories: int
    protein: int
    carbs: int
    fat: int

class MealPlanPreferences(BaseModel):
    calories: int
    protein: int
    carbs: int
    fat: int
    meals: int = 3
    restrictions: Optional[str] = ""
    preferences: Optional[str] = ""
    adjust_for_workouts: bool = False  # Flag to enable workout-based adjustments

class MealPlanResponse(BaseModel):
    date: str
    totalNutrition: dict
    meals: List[dict]

# Routes
@router.get("/meals")
def get_meals(
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's meals for a specific date"""
    try:
        print(f"\n==== GET MEALS DEBUG ====")
        print(f"Getting meals for date: {date}, user_id: {current_user.id} ({current_user.username})")
        
        # Get meals for the specified date and user
        meals = db.query(NutritionMeal).filter(
            NutritionMeal.user_id == current_user.id,
            NutritionMeal.date == date
        ).all()
        
        print(f"Found {len(meals)} meals in database")
        
        result = []
        for meal in meals:
            print(f"Processing meal ID {meal.id}: {meal.name}")
            
            # Get foods for this meal
            foods = db.query(NutritionFood).filter(
                NutritionFood.meal_id == meal.id
            ).all()
            
            print(f"  - Found {len(foods)} foods for this meal")
            
            food_list = []
            for food in foods:
                food_list.append({
                    "name": food.name,
                    "calories": food.calories,
                    "protein": food.protein,
                    "carbs": food.carbs,
                    "fat": food.fat,
                    "serving_size": food.serving_size,
                    "quantity": food.quantity
                })
            
            # Add the meal with all its foods to the result list - OUTSIDE the food loop
            result.append({
                "id": meal.id,
                "name": meal.name,
                "date": meal.date,
                "time": meal.time,
                "foods": food_list
            })
        
        print(f"Returning {len(result)} meals with foods")
        return result
        
    except Exception as e:
        print(f"Error fetching meals: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching meals: {str(e)}")

@router.post("/meals", status_code=201)
def create_meal(
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meal with foods"""
    try:
        print(f"\n==== MEAL CREATION DEBUG ====")
        print(f"Creating meal: {meal.name} for user_id: {current_user.id}, date: {meal.date}")
        print(f"Meal data: {meal.dict()}")
        
        # Create the meal record
        db_meal = NutritionMeal(
            name=meal.name,
            date=meal.date,
            time=meal.time,
            user_id=current_user.id
        )
        db.add(db_meal)
        db.flush()  # Get the meal ID without committing
        
        print(f"Created meal record with ID: {db_meal.id}")
        
        # Add each food item
        for i, food in enumerate(meal.foods):
            print(f"Adding food {i+1}: {food.name}, calories: {food.calories}")
            db_food = NutritionFood(
                meal_id=db_meal.id,
                name=food.name,
                calories=food.calories,
                protein=food.protein,
                carbs=food.carbs,
                fat=food.fat,
                serving_size=food.serving_size,
                quantity=food.quantity
            )
            db.add(db_food)
        
        # Commit all changes
        db.commit()
        print(f"Successfully saved meal ID {db_meal.id} with {len(meal.foods)} foods")
        
        # Verify the meal was saved
        saved_meal = db.query(NutritionMeal).filter(NutritionMeal.id == db_meal.id).first()
        if saved_meal:
            saved_foods = db.query(NutritionFood).filter(NutritionFood.meal_id == db_meal.id).count()
            print(f"Verified meal saved: {saved_meal.name} with {saved_foods} foods")
        else:
            print("WARNING: Could not verify meal was saved!")
        
        return {"id": db_meal.id, "message": "Meal created successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error creating meal: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error creating meal: {str(e)}")

@router.delete("/meals/by-date/{date}")
def delete_meals_by_date(
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all meals for a specific date"""
    try:
        print(f"\n==== DELETE MEALS BY DATE ====")
        print(f"Deleting all meals for date: {date}, user_id: {current_user.id}")
        
        # Find all meals for this date
        meals = db.query(NutritionMeal).filter(
            NutritionMeal.user_id == current_user.id,
            NutritionMeal.date == date
        ).all()
        
        if not meals:
            print(f"No meals found for date {date}")
            return {"message": "No meals found for this date", "deleted_count": 0}
        
        meal_count = len(meals)
        print(f"Found {meal_count} meals to delete")
        
        # Delete all meals (cascade will handle deleting associated foods)
        for meal in meals:
            db.delete(meal)
        
        db.commit()
        print(f"Successfully deleted {meal_count} meals for date {date}")
        
        return {"message": f"Successfully deleted {meal_count} meals", "deleted_count": meal_count}
    except Exception as e:
        db.rollback()
        print(f"Error deleting meals by date: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error deleting meals by date: {str(e)}")

@router.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meal"""
    meal = db.query(NutritionMeal).filter(
        NutritionMeal.id == meal_id,
        NutritionMeal.user_id == current_user.id
    ).first()
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted successfully"}

@router.get("/goals")
def get_nutrition_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's nutrition goals"""
    goals = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if not goals:
        # Return default goals if none exist
        return {
            "calories": 2000,
            "protein": 150,
            "carbs": 200,
            "fat": 65
        }
    
    return {
        "calories": goals.calories,
        "protein": goals.protein,
        "carbs": goals.carbs,
        "fat": goals.fat
    }

@router.post("/goals")
def update_nutrition_goals(
    goals: NutritionGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's nutrition goals"""
    existing_goals = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if existing_goals:
        existing_goals.calories = goals.calories
        existing_goals.protein = goals.protein
        existing_goals.carbs = goals.carbs
        existing_goals.fat = goals.fat
    else:
        new_goals = NutritionGoal(
            user_id=current_user.id,
            calories=goals.calories,
            protein=goals.protein,
            carbs=goals.carbs,
            fat=goals.fat
        )
        db.add(new_goals)
    
    db.commit()
    return {"message": "Nutrition goals updated successfully"}

@router.get("/history", response_model=List[NutritionHistoryResponse])
def get_nutrition_history(
    range: str = Query("week", description="Time range: week, month, year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get nutrition history for a time range"""
    try:
        print(f"Getting nutrition history for user_id {current_user.id}, range: {range}")
        today = datetime.now().date()
        today_str = today.strftime("%Y-%m-%d")
        
        if range == "week":
            start_date = today - timedelta(days=7)
        elif range == "month":
            start_date = today - timedelta(days=30)
        elif range == "year":
            start_date = today - timedelta(days=365)
        else:
            start_date = today - timedelta(days=7)  # Default to week
        
        start_date_str = start_date.strftime("%Y-%m-%d")
        
        print(f"Date range: {start_date_str} to {today_str}")
        
        # Get all meals in the date range - using string comparison since date is stored as string
        meals = db.query(NutritionMeal).filter(
            NutritionMeal.user_id == current_user.id,
            NutritionMeal.date >= start_date_str,
            NutritionMeal.date <= today_str
        ).all()
        
        print(f"Found {len(meals)} meals in date range")
        
        # If no meals, return empty list
        if not meals:
            return []
        
        # Group meals by date and calculate totals
        date_totals = {}
        for meal in meals:
            try:
                date = meal.date
                if date not in date_totals:
                    date_totals[date] = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
                
                # Get all foods for this meal
                foods = db.query(NutritionFood).filter(NutritionFood.meal_id == meal.id).all()
                
                # Add up nutrition values
                for food in foods:
                    quantity = food.quantity if food.quantity is not None else 1.0
                    date_totals[date]["calories"] += (food.calories or 0) * quantity
                    date_totals[date]["protein"] += (food.protein or 0) * quantity
                    date_totals[date]["carbs"] += (food.carbs or 0) * quantity
                    date_totals[date]["fat"] += (food.fat or 0) * quantity
            except Exception as meal_err:
                print(f"Error processing meal {meal.id}: {str(meal_err)}")
                # Continue with other meals
        
        # Convert to list of response objects
        result = []
        for date, totals in date_totals.items():
            result.append({
                "date": date,
                "calories": int(round(totals["calories"])),
                "protein": int(round(totals["protein"])),
                "carbs": int(round(totals["carbs"])),
                "fat": int(round(totals["fat"]))
            })
        
        print(f"Returning {len(result)} nutrition history records")
        return result
    except Exception as e:
        import traceback
        print(f"Error in get_nutrition_history: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error retrieving nutrition history: {str(e)}")

@router.get("/search")
def search_foods(
    query: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for foods in common foods database"""
    try:
        print(f"\n==== FOOD SEARCH DEBUG ====")
        
        # Check if query is empty or None - return all foods in that case
        if not query or query.strip() == "":
            print("Empty search query - returning all available foods")
            
            # Get all common foods, limit to a reasonable number
            common_foods = db.query(CommonFood).limit(30).all()
            print(f"Returning all {len(common_foods)} foods from database")
            
            results = []
            for food in common_foods:
                results.append({
                    "name": food.name,
                    "calories": food.calories,
                    "protein": food.protein,
                    "carbs": food.carbs,
                    "fat": food.fat,
                    "serving_size": food.serving_size,
                    "source": "database"
                })
            
            return results
            
        # If query is provided, search as normal
        print(f"Searching for: '{query}' by user: {current_user.id} ({current_user.username})")
        
        # Check if we have common foods in the database
        common_foods_count = db.query(CommonFood).count()
        print(f"Common foods in database: {common_foods_count}")
        
        # Search in common foods
        common_foods = db.query(CommonFood).filter(
            CommonFood.name.ilike(f"%{query}%")
        ).limit(10).all()
        
        print(f"Found {len(common_foods)} matching common foods")
    
        results = []
    
        # Add common foods to results
        for food in common_foods:
            results.append({
                "name": food.name,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "serving_size": food.serving_size,
                "source": "database"
            })
            
        # If no results found, add some default foods for testing
        if len(results) == 0 and common_foods_count == 0:
            print("No results found, adding test foods")
            test_foods = [
                {
                    "name": "Apple",
                    "calories": 95,
                    "protein": 0.5,
                    "carbs": 25,
                    "fat": 0.3,
                    "serving_size": "1 medium",
                    "source": "test_data"
                },
                {
                    "name": "Banana",
                    "calories": 105,
                    "protein": 1.3,
                    "carbs": 27,
                    "fat": 0.4,
                    "serving_size": "1 medium",
                    "source": "test_data"
                },
                {
                    "name": "Chicken Breast",
                    "calories": 165,
                    "protein": 31,
                    "carbs": 0,
                    "fat": 3.6,
                    "serving_size": "100g",
                    "source": "test_data"
                }
            ]
            results = test_foods
            
        print(f"Returning {len(results)} results")
        return results
        
    except Exception as e:
        print(f"Error in food search: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error searching foods: {str(e)}")

@router.post("/foods", status_code=201)
def create_food(
    food: FoodBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new custom food in the database"""
    try:
        print(f"\n==== CUSTOM FOOD CREATION ====")
        print(f"Creating custom food: {food.name} for user_id: {current_user.id}")
        print(f"Food data: {food.dict()}")
        
        # Create the food record
        db_food = CommonFood(
            name=food.name,
            calories=food.calories,
            protein=food.protein,
            carbs=food.carbs,
            fat=food.fat,
            serving_size=food.serving_size,
            food_group="User Custom",
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_food)
        db.commit()
        db.refresh(db_food)
        
        print(f"Created custom food with ID: {db_food.id}")
        
        return {
            "id": db_food.id,
            "name": db_food.name,
            "calories": db_food.calories,
            "protein": db_food.protein,
            "carbs": db_food.carbs,
            "fat": db_food.fat,
            "serving_size": db_food.serving_size,
            "message": "Food created successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating custom food: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating custom food: {str(e)}")

@router.post("/generate-meal-plan", response_model=MealPlanResponse)
def generate_meal_plan(
    preferences: MealPlanPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a meal plan based on user preferences and workout history"""
    try:
        print(f"\n==== MEAL PLAN GENERATION ====")
        print(f"Generating meal plan for user_id: {current_user.id} with preferences: {preferences.dict()}")
        
        original_calories = preferences.calories
        original_protein = preferences.protein
        
        # Adjust nutrition based on workout data if requested
        if preferences.adjust_for_workouts:
            # Get recent workouts (last 3 days)
            three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).strftime('%Y-%m-%d')
            today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            
            print(f"Checking workouts from {three_days_ago} to {today}")
            
            # Query recent workouts
            recent_workouts = db.query(Workout).filter(
                Workout.user_id == current_user.id,
                Workout.is_template == False,
                func.cast(Workout.date, String) >= three_days_ago
            ).order_by(desc(Workout.date)).all()
            
            print(f"Found {len(recent_workouts)} recent workouts")
            
            if recent_workouts:
                # Adjust nutrition based on workout intensity
                # Calculate workout intensity score (simple version - can be made more sophisticated)
                workout_intensity = 0
                strength_workout_count = 0
                cardio_workout_count = 0
                cardio_duration = 0
                
                for workout in recent_workouts:
                    workout_intensity += 1  # Base intensity for any workout
                    
                    # Check if workout has exercises
                    if not workout.exercises:
                        continue
                        
                    # Check exercise types in the workout
                    has_strength = False
                    has_cardio = False
                    cardio_minutes = 0
                    
                    for exercise in workout.exercises:
                        if exercise.is_cardio:
                            has_cardio = True
                            # Sum up cardio durations from sets
                            for exercise_set in exercise.sets:
                                if exercise_set.duration:
                                    cardio_minutes += exercise_set.duration
                        else:
                            has_strength = True
                    
                    if has_strength:
                        strength_workout_count += 1
                        workout_intensity += 1  # Extra intensity for strength training
                    
                    if has_cardio:
                        cardio_workout_count += 1
                        cardio_duration += cardio_minutes
                        workout_intensity += min(cardio_minutes / 30, 2)  # Cap the cardio bonus at 2
                
                # Adjust calorie and protein needs based on workout intensity
                calorie_adjustment = min(workout_intensity * 100, 500)  # Cap at 500 extra calories
                protein_adjustment = min(workout_intensity * 5, 30)  # Cap at 30g extra protein
                
                # Higher protein for strength training
                if strength_workout_count > 0:
                    protein_adjustment += 10 * strength_workout_count
                
                # Higher calories for cardio
                if cardio_duration > 0:
                    calorie_adjustment += min(cardio_duration * 5, 300)  # 5 calories per minute of cardio, capped
                
                preferences.calories = original_calories + int(calorie_adjustment)
                preferences.protein = original_protein + int(protein_adjustment)
                
                print(f"Workout-adjusted nutrition: +{int(calorie_adjustment)} calories, +{int(protein_adjustment)}g protein")
                print(f"Adjusted targets: {preferences.calories} calories, {preferences.protein}g protein")
                
                # Slightly adjust macros distribution for workout recovery
                if strength_workout_count > cardio_workout_count:
                    # Prioritize protein and carbs for strength recovery
                    carb_percent = 0.45  # Higher carbs for glycogen replenishment
                    fat_percent = 0.25
                else:
                    # More balanced for cardio or mixed training
                    carb_percent = 0.40
                    fat_percent = 0.30
                
                # Recalculate carbs and fat based on the adjusted calories and protein
                protein_calories = preferences.protein * 4
                remaining_calories = preferences.calories - protein_calories
                
                preferences.carbs = int((remaining_calories * carb_percent) / 4)
                preferences.fat = int((remaining_calories * fat_percent) / 9)
                
                print(f"Adjusted macros: {preferences.carbs}g carbs, {preferences.fat}g fat")
        
        # Get all available foods from the database
        available_foods = db.query(CommonFood).all()
        print(f"Found {len(available_foods)} foods in database")
        
        # If no foods in database, return error
        if len(available_foods) == 0:
            raise HTTPException(status_code=404, detail="No foods found in database to generate meal plan")
        
        # Process dietary restrictions
        restrictions_list = [r.strip().lower() for r in preferences.restrictions.split(',') if r.strip()] if preferences.restrictions else []
        print(f"Dietary restrictions: {restrictions_list}")
        
        # Define non-vegetarian food groups and keywords for better filtering
        non_vegetarian_groups = ["meat", "poultry", "fish", "seafood"]
        non_vegetarian_keywords = ["chicken", "beef", "pork", "turkey", "fish", "salmon", "tuna", 
                                  "shrimp", "meat", "sausage", "bacon", "ham", "steak", "cod", 
                                  "tilapia", "lamb", "duck", "veal", "anchovy", "sardine"]
        
        dairy_keywords = ["milk", "cheese", "yogurt", "butter", "cream", "dairy"]
        gluten_keywords = ["wheat", "bread", "pasta", "cereal", "flour", "bun", "cracker", "gluten", 
                          "barley", "rye", "oats", "malt"]
        
        # Filter foods based on restrictions
        filtered_foods = []
        for food in available_foods:
            skip = False
            food_name_lower = food.name.lower()
            food_group_lower = food.food_group.lower() if food.food_group else ""
            
            for restriction in restrictions_list:
                # Vegetarian filtering
                if restriction in ["vegetarian", "vegan"]:
                    # Check food group
                    if any(ng in food_group_lower for ng in non_vegetarian_groups):
                        skip = True
                        break
                    # Check food name
                    if any(kw in food_name_lower for kw in non_vegetarian_keywords):
                        skip = True
                        break
                
                # Additional vegan filtering (no dairy, eggs, honey)
                if restriction == "vegan":
                    if "egg" in food_name_lower or "honey" in food_name_lower:
                        skip = True
                        break
                    if any(dk in food_name_lower for dk in dairy_keywords):
                        skip = True
                        break
                
                # Dairy-free filtering
                if restriction == "dairy-free":
                    if any(dk in food_name_lower for dk in dairy_keywords):
                        skip = True
                        break
                
                # Gluten-free filtering
                if restriction == "gluten-free":
                    if any(gk in food_name_lower for gk in gluten_keywords):
                        skip = True
                        break
            
            if not skip:
                filtered_foods.append(food)
        
        print(f"After filtering for restrictions, {len(filtered_foods)} foods remain available")
        
        # Check if we have enough foods to generate a meal plan
        if len(filtered_foods) < 5:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough food options available with your dietary restrictions. Only {len(filtered_foods)} foods found."
            )
        
        # Set default meal names and times based on number of meals
        meal_templates = {
            3: [
                {"name": "Breakfast", "time": "08:00", "calorie_percent": 0.25},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.40},
                {"name": "Dinner", "time": "19:00", "calorie_percent": 0.35},
            ],
            4: [
                {"name": "Breakfast", "time": "08:00", "calorie_percent": 0.25},
                {"name": "Morning Snack", "time": "11:00", "calorie_percent": 0.10},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.35},
                {"name": "Dinner", "time": "19:00", "calorie_percent": 0.30},
            ],
            5: [
                {"name": "Breakfast", "time": "07:30", "calorie_percent": 0.20},
                {"name": "Morning Snack", "time": "10:30", "calorie_percent": 0.10},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.30},
                {"name": "Afternoon Snack", "time": "16:00", "calorie_percent": 0.10},
                {"name": "Dinner", "time": "19:00", "calorie_percent": 0.30},
            ],
            6: [
                {"name": "Breakfast", "time": "07:00", "calorie_percent": 0.20},
                {"name": "Morning Snack", "time": "10:00", "calorie_percent": 0.10},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.25},
                {"name": "Afternoon Snack", "time": "16:00", "calorie_percent": 0.10},
                {"name": "Dinner", "time": "19:00", "calorie_percent": 0.25},
                {"name": "Evening Snack", "time": "21:30", "calorie_percent": 0.10},
            ]
        }
        
        # Use 3 meals as default if invalid meal count
        meal_count = preferences.meals if preferences.meals in meal_templates else 3
        
        # Create the meal plan structure with EXACTLY the user's target macros
        meal_plan = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "totalNutrition": {
                "calories": preferences.calories,
                "protein": preferences.protein,
                "carbs": preferences.carbs,
                "fat": preferences.fat
            },
            "meals": []
        }
        
        # Track the actual nutrition totals
        actual_total = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0
        }
        
        # Function to score how well a food matches our remaining nutritional needs
        def score_food_match(food, target_calories, target_protein, target_carbs, target_fat):
            # Base quantity on calories
            quantity = min(3.0, max(0.5, target_calories / max(food.calories, 1)))
            
            # Calculate the actual nutrition with this quantity
            actual_cals = food.calories * quantity
            actual_protein = food.protein * quantity
            actual_carbs = food.carbs * quantity
            actual_fat = food.fat * quantity
            
            # Calculate how well this food matches our targets (lower is better)
            cal_score = abs(actual_cals - target_calories) / max(target_calories, 1)
            protein_score = abs(actual_protein - target_protein) / max(target_protein, 1)  
            carbs_score = abs(actual_carbs - target_carbs) / max(target_carbs, 1)
            fat_score = abs(actual_fat - target_fat) / max(target_fat, 1)
            
            # Weight the scores - prioritize calories and protein
            # Heavily penalize going over the calorie target
            if actual_cals > target_calories * 1.1:  # 10% over target
                cal_score *= 3  # Triple the penalty
            
            total_score = (cal_score * 0.4) + (protein_score * 0.3) + (carbs_score * 0.15) + (fat_score * 0.15)
            return total_score, quantity
        
        # Number of iterations to try improving the meal plan
        max_iterations = 3  # Increased from 2 for better optimization
        
        # Generate a meal plan iteratively, improving it each time
        for iteration in range(max_iterations):
            print(f"Meal plan generation iteration {iteration+1}/{max_iterations}")
            
            # Reset the meals and actual totals for each iteration
            if iteration > 0:
                meal_plan["meals"] = []
                actual_total = {
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0
                }
            
            # Calculate targets for each meal
            for meal_template in meal_templates[meal_count]:
                meal_name = meal_template["name"]
                meal_time = meal_template["time"]
                calorie_percent = meal_template["calorie_percent"]
                
                # Calculate this meal's target based on the overall preferences
                # For the first meal(s), just use the percentage
                # For the last meal, adjust to exactly hit the remaining target
                is_last_meal = meal_name == meal_templates[meal_count][-1]["name"]
                
                if is_last_meal:
                    # For the last meal, use the remaining nutrition needed to hit the target
                    meal_calories = max(0, preferences.calories - actual_total["calories"])
                    meal_protein = max(0, preferences.protein - actual_total["protein"])
                    meal_carbs = max(0, preferences.carbs - actual_total["carbs"])
                    meal_fat = max(0, preferences.fat - actual_total["fat"])
                else:
                    # For earlier meals, use the specified percentage
                    meal_calories = preferences.calories * calorie_percent
                    meal_protein = preferences.protein * calorie_percent
                    meal_carbs = preferences.carbs * calorie_percent
                    meal_fat = preferences.fat * calorie_percent
                
                print(f"Generating {meal_name} with targets: {meal_calories:.1f} cal, {meal_protein:.1f}g protein, "
                      f"{meal_carbs:.1f}g carbs, {meal_fat:.1f}g fat")
            
                meal = {
                    "name": meal_name,
                    "time": meal_time,
                    "foods": []
                }
                
                # Determine how many food items to include in this meal
                food_count = 2  # Default
                if "snack" in meal_name.lower():
                    food_count = random.randint(1, 2)
                elif "breakfast" in meal_name.lower():
                    food_count = random.randint(2, 3)
                elif "lunch" in meal_name.lower() or "dinner" in meal_name.lower():
                    food_count = random.randint(2, 4)
                
                # Check if this is the last meal and we're already over calorie budget
                if is_last_meal and actual_total["calories"] >= preferences.calories * 0.95:
                    # We're already at or above target calories, so reduce the number of foods
                    food_count = max(1, food_count - 2)
                    print(f"Reducing food count for {meal_name} to {food_count} to avoid exceeding calorie target")
                
                # Track nutrition for this meal
                meal_total = {
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0
                }
                
                # Randomly select a diverse set of foods for this meal
                remaining_foods = filtered_foods.copy()  # Copy to avoid modifying original
                
                # Check if we're approaching calorie limit
                exceeding_calories = actual_total["calories"] >= preferences.calories * 0.9
                
                for i in range(food_count):
                    # Stop adding foods if we're already over calorie target
                    if actual_total["calories"] >= preferences.calories:
                        print(f"Stopping food addition for {meal_name} - already reached calorie target")
                        break
                        
                    # Calculate what's still needed for this meal
                    remaining_calories = meal_calories - meal_total["calories"]
                    remaining_protein = meal_protein - meal_total["protein"]
                    remaining_carbs = meal_carbs - meal_total["carbs"]
                    remaining_fat = meal_fat - meal_total["fat"]
                    
                    # Adjust calorie target down further if we're close to daily target
                    if exceeding_calories:
                        remaining_calories = min(remaining_calories, preferences.calories - actual_total["calories"])
                        
                    # Adjust targets based on number of foods left to add
                    foods_left = food_count - i
                    target_calories = remaining_calories / foods_left
                    target_protein = remaining_protein / foods_left
                    target_carbs = remaining_carbs / foods_left
                    target_fat = remaining_fat / foods_left
                    
                    # Find the best matching food
                    best_score = float('inf')
                    best_food = None
                    best_quantity = 1.0
                    
                    # Try to find a good food match
                    for food in remaining_foods:
                        # Skip high-calorie foods when we're close to our target
                        if exceeding_calories and food.calories > target_calories * 1.5:
                            continue
                            
                        score, quantity = score_food_match(food, target_calories, target_protein, target_carbs, target_fat)
                        if score < best_score:
                            best_score = score
                            best_food = food
                            best_quantity = quantity
                    
                    # If we couldn't find a good match, use any available food
                    if best_food is None and filtered_foods:
                        # Pick lower calorie options if we're close to target
                        if exceeding_calories:
                            # Sort by calories and pick from the lowest third
                            sorted_foods = sorted(filtered_foods, key=lambda f: f.calories)
                            best_food = sorted_foods[min(len(sorted_foods) // 3, random.randint(0, len(sorted_foods) - 1))]
                        else:
                            best_food = random.choice(filtered_foods)
                        
                        best_quantity = min(3.0, max(0.5, target_calories / max(best_food.calories, 1)))
                    
                    # Add the selected food to the meal
                    if best_food:
                        # Remove from available foods to avoid duplicates in the same meal
                        if best_food in remaining_foods:
                            remaining_foods.remove(best_food)
                        
                        # For the last food in the meal, try to exactly hit the remaining targets
                        if i == food_count - 1:
                            # Fine-tune the quantity to better hit the target
                            # but keep it within reasonable bounds
                            best_quantity = min(3.0, max(0.5, remaining_calories / max(best_food.calories, 1)))
                        
                        # Additional check to avoid going way over daily calories
                        estimated_calories = best_food.calories * best_quantity
                        if actual_total["calories"] + estimated_calories > preferences.calories * 1.1:
                            # Reduce quantity to stay within calorie target
                            max_allowed_calories = max(0, preferences.calories - actual_total["calories"])
                            best_quantity = min(best_quantity, max_allowed_calories / max(best_food.calories, 1))
                            best_quantity = max(0.5, best_quantity)  # Don't go below 0.5 serving
                                
                        # Round the quantity to a reasonable number
                        best_quantity = round(best_quantity * 2) / 2  # Round to nearest 0.5
                        
                        # Calculate the food's actual nutrition
                        food_calories = round(best_food.calories * best_quantity, 1)
                        food_protein = round(best_food.protein * best_quantity, 1)
                        food_carbs = round(best_food.carbs * best_quantity, 1)
                        food_fat = round(best_food.fat * best_quantity, 1)
                        
                        # Add to meal totals
                        meal_total["calories"] += food_calories
                        meal_total["protein"] += food_protein
                        meal_total["carbs"] += food_carbs
                        meal_total["fat"] += food_fat
                        
                        # Add to overall totals
                        actual_total["calories"] += food_calories
                        actual_total["protein"] += food_protein
                        actual_total["carbs"] += food_carbs
                        actual_total["fat"] += food_fat
                        
                        # Add food to the meal
                        meal["foods"].append({
                            "name": best_food.name,
                            "calories": food_calories,
                            "protein": food_protein,
                            "carbs": food_carbs,
                            "fat": food_fat,
                            "serving_size": best_food.serving_size,
                            "quantity": best_quantity
                        })
                
                meal_plan["meals"].append(meal)
                print(f"Added {meal_name} with {len(meal['foods'])} foods: {meal_total['calories']:.1f} cal, "
                      f"{meal_total['protein']:.1f}g protein, {meal_total['carbs']:.1f}g carbs, {meal_total['fat']:.1f}g fat")
                      
                # Check if we've already hit our calorie target
                if actual_total["calories"] >= preferences.calories:
                    print(f"Reached calorie target after adding {meal_name}. Stopping meal generation.")
                    break
        
        # Round values in the actual total
        for key in actual_total:
            actual_total[key] = round(actual_total[key])
        
        # Set the actual nutrition totals in the meal plan
        meal_plan["totalNutrition"] = actual_total
        
        # Log the results
        print(f"Final meal plan: {len(meal_plan['meals'])} meals with totals: {actual_total}")
        print(f"Target was: {preferences.calories} cal, {preferences.protein}g protein, {preferences.carbs}g carbs, {preferences.fat}g fat")
        print(f"Difference: {actual_total['calories'] - preferences.calories} cal, "
              f"{actual_total['protein'] - preferences.protein}g protein, "
              f"{actual_total['carbs'] - preferences.carbs}g carbs, "
              f"{actual_total['fat'] - preferences.fat}g fat")
        
        return meal_plan
                
    except Exception as e:
        print(f"Error generating meal plan: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating meal plan: {str(e)}") 