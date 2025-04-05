import os
import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import CommonFood

# Load environment variables
load_dotenv()

# Get database URL from environment
db_url = os.getenv("DB_URL")
if not db_url:
    print("DB_URL not found in environment variables")
    sys.exit(1)

# Create SQLAlchemy engine and session
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Sample common foods data
common_foods = [
    {
        "name": "Apple",
        "calories": 95,
        "protein": 0.5,
        "carbs": 25,
        "fat": 0.3,
        "serving_size": "1 medium (182g)",
        "food_group": "Fruits"
    },
    {
        "name": "Banana",
        "calories": 105,
        "protein": 1.3,
        "carbs": 27,
        "fat": 0.4,
        "serving_size": "1 medium (118g)",
        "food_group": "Fruits"
    },
    {
        "name": "Chicken Breast",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "serving_size": "100g",
        "food_group": "Proteins"
    },
    {
        "name": "Egg",
        "calories": 78,
        "protein": 6.3,
        "carbs": 0.6,
        "fat": 5.3,
        "serving_size": "1 large (50g)",
        "food_group": "Proteins"
    },
    {
        "name": "Salmon",
        "calories": 206,
        "protein": 22,
        "carbs": 0,
        "fat": 13,
        "serving_size": "100g",
        "food_group": "Proteins"
    },
    {
        "name": "Brown Rice",
        "calories": 112,
        "protein": 2.3,
        "carbs": 23.5,
        "fat": 0.8,
        "serving_size": "100g cooked",
        "food_group": "Grains"
    },
    {
        "name": "Broccoli",
        "calories": 55,
        "protein": 3.7,
        "carbs": 11.2,
        "fat": 0.6,
        "serving_size": "100g",
        "food_group": "Vegetables"
    },
    {
        "name": "Milk (2%)",
        "calories": 122,
        "protein": 8.1,
        "carbs": 11.7,
        "fat": 4.8,
        "serving_size": "1 cup (240ml)",
        "food_group": "Dairy"
    },
    {
        "name": "Avocado",
        "calories": 240,
        "protein": 3,
        "carbs": 12.8,
        "fat": 22,
        "serving_size": "1 medium (150g)",
        "food_group": "Fruits"
    },
    {
        "name": "Oatmeal",
        "calories": 150,
        "protein": 5,
        "carbs": 27,
        "fat": 2.5,
        "serving_size": "1 cup cooked (234g)",
        "food_group": "Grains"
    }
]

def add_common_foods():
    try:
        # Check if we already have foods in the database
        existing_count = db.query(CommonFood).count()
        print(f"Found {existing_count} existing foods in the database")
        
        if existing_count > 0:
            print("Common foods already exist in the database. Skipping...")
            return
        
        # Add foods
        for food_data in common_foods:
            food = CommonFood(
                name=food_data["name"],
                calories=food_data["calories"],
                protein=food_data["protein"],
                carbs=food_data["carbs"],
                fat=food_data["fat"],
                serving_size=food_data["serving_size"],
                food_group=food_data.get("food_group"),
                created_at=datetime.now()
            )
            db.add(food)
        
        # Commit the changes
        db.commit()
        print(f"Added {len(common_foods)} common foods to the database")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding common foods: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    add_common_foods() 