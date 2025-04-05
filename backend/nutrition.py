from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from dependencies import get_current_user
from models import User, NutritionMeal, NutritionFood, NutritionGoal, CommonFood
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from sqlalchemy import or_

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