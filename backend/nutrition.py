from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from dependencies import get_current_user
from models import User, NutritionMeal, NutritionFood, NutritionGoal
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

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

# Routes
@router.get("/meals")
async def get_meals(date: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Log debug info
        print(f"Fetching meals for user_id: {current_user.id}, date: {date}")
        
        # Query meals for user and date
        meals = db.query(NutritionMeal).filter(
            NutritionMeal.user_id == current_user.id,
            NutritionMeal.date == date  # Use the date string directly
        ).all()
        
        print(f"Found {len(meals)} meals")
        
        # Format response
        result = []
        for meal in meals:
            try:
                meal_foods = db.query(NutritionFood).filter(NutritionFood.meal_id == meal.id).all()
                foods = []
                
                for food in meal_foods:
                    food_item = {
                        "id": food.id,
                        "name": food.name,
                        "serving_size": food.serving_size or "1 serving",
                        "quantity": food.quantity or 1.0,
                        "calories": food.calories or 0,
                        "protein": food.protein or 0,
                        "carbs": food.carbs or 0,
                        "fat": food.fat or 0
                    }
                    foods.append(food_item)
                
                result.append({
                    "id": meal.id,
                    "name": meal.name,
                    "time": meal.time if meal.time else None,
                    "foods": foods
                })
            except Exception as food_err:
                print(f"Error processing meal {meal.id}: {str(food_err)}")
                # Continue to process other meals
        
        print(f"Returning {len(result)} formatted meals")
        return result
    except Exception as e:
        # Log the exception with traceback
        import traceback
        print(f"Error in get_meals: {str(e)}")
        print(traceback.format_exc())
        # Re-raise the exception
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/meals", status_code=201)
def create_meal(
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meal with foods"""
    db_meal = NutritionMeal(
        name=meal.name,
        date=meal.date,
        time=meal.time,
        user_id=current_user.id
    )
    db.add(db_meal)
    db.flush()  # Get the meal ID without committing
    
    for food in meal.foods:
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
    
    db.commit()
    return {"message": "Meal created successfully", "id": db_meal.id}

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
    query: str = Query(..., description="Food search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for foods in external API and database"""
    # First check if we have this food in our database from user's previous entries
    user_foods = db.query(NutritionFood).join(NutritionMeal).filter(
        NutritionMeal.user_id == current_user.id,
        NutritionFood.name.ilike(f"%{query}%")
    ).distinct(NutritionFood.name).limit(5).all()
    
    results = []
    
    # Add user's previous foods
    for food in user_foods:
        results.append({
            "name": food.name,
            "calories": food.calories,
            "protein": food.protein,
            "carbs": food.carbs,
            "fat": food.fat,
            "serving_size": food.serving_size
        })
    
    # If we have less than 10 results, search external API
    if len(results) < 10:
        try:
            # Use Nutritionix API or similar
            api_key = os.getenv("NUTRITIONIX_API_KEY")
            app_id = os.getenv("NUTRITIONIX_APP_ID")
            
            if api_key and app_id:
                headers = {
                    "x-app-id": app_id,
                    "x-app-key": api_key,
                    "x-remote-user-id": "0"
                }
                
                response = requests.get(
                    f"https://trackapi.nutritionix.com/v2/search/instant?query={query}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    api_results = response.json()
                    
                    # Process common foods
                    for item in api_results.get("common", [])[:5]:
                        # Get detailed nutrition info
                        detail_response = requests.post(
                            "https://trackapi.nutritionix.com/v2/natural/nutrients",
                            headers=headers,
                            json={"query": item["food_name"]}
                        )
                        
                        if detail_response.status_code == 200:
                            food_details = detail_response.json()
                            if food_details.get("foods"):
                                food = food_details["foods"][0]
                                results.append({
                                    "name": food["food_name"],
                                    "calories": food["nf_calories"],
                                    "protein": food["nf_protein"],
                                    "carbs": food["nf_total_carbohydrate"],
                                    "fat": food["nf_total_fat"],
                                    "serving_size": f"{food['serving_qty']} {food['serving_unit']}"
                                })
            else:
                # Fallback to some basic foods if API keys not available
                basic_foods = [
                    {"name": "Apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "serving_size": "1 medium"},
                    {"name": "Banana", "calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "serving_size": "1 medium"},
                    {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "serving_size": "100g"},
                    {"name": "Egg", "calories": 78, "protein": 6.3, "carbs": 0.6, "fat": 5.3, "serving_size": "1 large"},
                    {"name": "Salmon", "calories": 206, "protein": 22, "carbs": 0, "fat": 13, "serving_size": "100g"},
                    {"name": "Brown Rice", "calories": 216, "protein": 5, "carbs": 45, "fat": 1.8, "serving_size": "1 cup cooked"},
                    {"name": "Broccoli", "calories": 55, "protein": 3.7, "carbs": 11.2, "fat": 0.6, "serving_size": "1 cup"},
                    {"name": "Greek Yogurt", "calories": 100, "protein": 17, "carbs": 6, "fat": 0.7, "serving_size": "170g"},
                    {"name": "Oatmeal", "calories": 150, "protein": 5, "carbs": 27, "fat": 2.5, "serving_size": "1 cup cooked"},
                    {"name": "Avocado", "calories": 234, "protein": 2.9, "carbs": 12.5, "fat": 21, "serving_size": "1 medium"}
                ]
                
                # Filter basic foods by query
                filtered_foods = [food for food in basic_foods if query.lower() in food["name"].lower()]
                results.extend(filtered_foods[:5])
                
        except Exception as e:
            print(f"Error searching external API: {e}")
    
    return results[:10]  # Return at most 10 results 