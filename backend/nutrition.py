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
        
        # Group foods by food group
        food_groups = {}
        for food in available_foods:
            group = food.food_group or "Other"
            if group not in food_groups:
                food_groups[group] = []
            food_groups[group].append(food)
        
        print(f"Foods grouped into {len(food_groups)} categories")
        
        # Set default meal names and times based on number of meals
        meal_templates = {
            3: [
                {"name": "Breakfast", "time": "08:00", "calorie_percent": 0.25},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.40},
                {"name": "Dinner", "time": "19:00", "calorie_percent": 0.35},
            ],
            4: [
                {"name": "Breakfast", "time": "08:00", "calorie_percent": 0.25},
                {"name": "Lunch", "time": "13:00", "calorie_percent": 0.35},
                {"name": "Snack", "time": "16:00", "calorie_percent": 0.10},
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
        
        # Create the meal plan structure
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
        
        # Filter foods based on restrictions (improved implementation)
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
        
        # Generate each meal
        for meal_template in meal_templates[meal_count]:
            meal_name = meal_template["name"]
            meal_time = meal_template["time"]
            meal_calories = preferences.calories * meal_template["calorie_percent"]
            
            print(f"Generating {meal_name} with target {meal_calories} calories")
            
            meal = {
                "name": meal_name,
                "time": meal_time,
                "foods": []
            }
            
            # Determine how many food items to include in this meal
            food_count = 2
            if "snack" in meal_name.lower():
                food_count = random.randint(1, 2)
            elif "breakfast" in meal_name.lower():
                food_count = random.randint(2, 3)
            elif "lunch" in meal_name.lower() or "dinner" in meal_name.lower():
                food_count = random.randint(2, 4)
            
            # Calculate target calories per food item
            calories_per_food = meal_calories / food_count
            
            # Select foods for this meal
            selected_foods = []
            remaining_calories = meal_calories
            
            for i in range(food_count):
                # For last food item, try to match remaining calories more closely
                if i == food_count - 1:
                    calories_per_food = remaining_calories
                
                # Find a suitable food that roughly matches our calorie target
                suitable_foods = [f for f in filtered_foods if abs(f.calories - calories_per_food) < calories_per_food * 0.5]
                
                # If no suitable foods, relax constraints
                if not suitable_foods:
                    suitable_foods = filtered_foods
                
                # Select a random food
                if suitable_foods:
                    selected_food = random.choice(suitable_foods)
                    
                    # Calculate quantity based on target calories
                    quantity = round(calories_per_food / max(selected_food.calories, 1), 1)
                    quantity = max(0.5, min(3.0, quantity))  # Limit to realistic quantities
                    
                    # Add to meal
                    selected_foods.append({
                        "name": selected_food.name,
                        "calories": round(selected_food.calories * quantity, 1),
                        "protein": round(selected_food.protein * quantity, 1),
                        "carbs": round(selected_food.carbs * quantity, 1),
                        "fat": round(selected_food.fat * quantity, 1),
                        "serving_size": selected_food.serving_size,
                        "quantity": quantity
                    })
                    
                    # Update remaining calories
                    remaining_calories -= selected_food.calories * quantity
                
            meal["foods"] = selected_foods
            meal_plan["meals"].append(meal)
            
            print(f"Added {meal_name} with {len(selected_foods)} foods")
            
        # Recalculate actual total nutrition after food selection
        actual_totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        for meal in meal_plan["meals"]:
            for food in meal["foods"]:
                actual_totals["calories"] += food["calories"]
                actual_totals["protein"] += food["protein"]
                actual_totals["carbs"] += food["carbs"]
                actual_totals["fat"] += food["fat"]
        
        # Round final values
        for key in actual_totals:
            actual_totals[key] = round(actual_totals[key])
        
        meal_plan["totalNutrition"] = actual_totals
        
        print(f"Meal plan generated with {len(meal_plan['meals'])} meals and totals: {actual_totals}")
        return meal_plan
                
    except Exception as e:
        print(f"Error generating meal plan: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating meal plan: {str(e)}") 