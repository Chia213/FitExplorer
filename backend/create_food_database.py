from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import csv
import os
from dotenv import load_dotenv
from models import Base, CommonFood  # Import the model we'll create

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DB_URL")  # Use correct env var name
if not DATABASE_URL:
    # Fallback URL for PostgreSQL
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/fitdemo"
    print(f"WARNING: DB_URL not found in environment, using fallback: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Common foods data - a basic list that could be expanded
COMMON_FOODS = [
    {"name": "Apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "serving_size": "1 medium (182g)"},
    {"name": "Banana", "calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "serving_size": "1 medium (118g)"},
    {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "serving_size": "100g"},
    {"name": "Egg", "calories": 78, "protein": 6.3, "carbs": 0.6, "fat": 5.3, "serving_size": "1 large (50g)"},
    {"name": "Salmon", "calories": 206, "protein": 22, "carbs": 0, "fat": 13, "serving_size": "100g"},
    {"name": "Brown Rice", "calories": 216, "protein": 5, "carbs": 45, "fat": 1.8, "serving_size": "1 cup cooked (195g)"},
    {"name": "Broccoli", "calories": 55, "protein": 3.7, "carbs": 11.2, "fat": 0.6, "serving_size": "1 cup (91g)"},
    {"name": "Greek Yogurt", "calories": 100, "protein": 17, "carbs": 6, "fat": 0.7, "serving_size": "170g"},
    {"name": "Oatmeal", "calories": 150, "protein": 5, "carbs": 27, "fat": 2.5, "serving_size": "1 cup cooked (234g)"},
    {"name": "Avocado", "calories": 234, "protein": 2.9, "carbs": 12.5, "fat": 21, "serving_size": "1 medium (150g)"},
    {"name": "Beef, ground, 80/20", "calories": 254, "protein": 17.4, "carbs": 0, "fat": 20, "serving_size": "100g"},
    {"name": "Almond Milk", "calories": 30, "protein": 1.1, "carbs": 1.2, "fat": 2.5, "serving_size": "1 cup (240ml)"},
    {"name": "Bread, whole wheat", "calories": 81, "protein": 4, "carbs": 15, "fat": 1.1, "serving_size": "1 slice (32g)"},
    {"name": "Olive Oil", "calories": 119, "protein": 0, "carbs": 0, "fat": 13.5, "serving_size": "1 tbsp (14g)"},
    {"name": "Potato", "calories": 161, "protein": 4.3, "carbs": 37, "fat": 0.2, "serving_size": "1 medium (173g)"},
    {"name": "Spinach", "calories": 7, "protein": 0.9, "carbs": 1.1, "fat": 0.1, "serving_size": "1 cup (30g)"},
    {"name": "Sweet Potato", "calories": 112, "protein": 2, "carbs": 26, "fat": 0.1, "serving_size": "1 medium (130g)"},
    {"name": "Black Beans", "calories": 114, "protein": 7.6, "carbs": 20.4, "fat": 0.5, "serving_size": "1/2 cup (86g)"},
    {"name": "Peanut Butter", "calories": 188, "protein": 8, "carbs": 6, "fat": 16, "serving_size": "2 tbsp (32g)"},
    {"name": "Almonds", "calories": 164, "protein": 6, "carbs": 6, "fat": 14, "serving_size": "1/4 cup (35g)"},
    {"name": "Milk, 2%", "calories": 122, "protein": 8.1, "carbs": 11.7, "fat": 4.8, "serving_size": "1 cup (244g)"},
    {"name": "Cheese, cheddar", "calories": 114, "protein": 7, "carbs": 0.4, "fat": 9.4, "serving_size": "1 oz (28g)"},
    {"name": "Pasta, cooked", "calories": 221, "protein": 8.1, "carbs": 43.2, "fat": 1.3, "serving_size": "1 cup (140g)"},
    {"name": "Tuna, canned in water", "calories": 109, "protein": 20, "carbs": 0, "fat": 2.5, "serving_size": "1 can (142g)"},
    {"name": "Carrot", "calories": 25, "protein": 0.6, "carbs": 6, "fat": 0.1, "serving_size": "1 medium (61g)"},
    {"name": "Orange", "calories": 62, "protein": 1.2, "carbs": 15.4, "fat": 0.2, "serving_size": "1 medium (131g)"},
    {"name": "Strawberries", "calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3, "serving_size": "1 cup (144g)"},
    {"name": "Blueberries", "calories": 84, "protein": 1.1, "carbs": 21.4, "fat": 0.5, "serving_size": "1 cup (148g)"},
    {"name": "Hummus", "calories": 166, "protein": 7.9, "carbs": 14.3, "fat": 9.6, "serving_size": "1/2 cup (124g)"},
    {"name": "Quinoa, cooked", "calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6, "serving_size": "1 cup (185g)"},
    {"name": "Tofu, firm", "calories": 144, "protein": 15.6, "carbs": 3.5, "fat": 8.7, "serving_size": "1/2 cup (126g)"},
    {"name": "Turkey, ground", "calories": 170, "protein": 22, "carbs": 0, "fat": 8, "serving_size": "100g"},
    {"name": "Lentils, cooked", "calories": 115, "protein": 9, "carbs": 20, "fat": 0.4, "serving_size": "1/2 cup (99g)"},
    {"name": "Asparagus", "calories": 27, "protein": 2.9, "carbs": 5.2, "fat": 0.2, "serving_size": "1 cup (134g)"},
    {"name": "Bell Pepper, red", "calories": 31, "protein": 1, "carbs": 7.3, "fat": 0.3, "serving_size": "1 medium (119g)"},
    {"name": "Cottage Cheese", "calories": 118, "protein": 14, "carbs": 3.5, "fat": 5, "serving_size": "1/2 cup (113g)"},
    {"name": "Watermelon", "calories": 46, "protein": 0.9, "carbs": 11.5, "fat": 0.2, "serving_size": "1 cup (152g)"},
    {"name": "Zucchini", "calories": 17, "protein": 1.2, "carbs": 3.1, "fat": 0.3, "serving_size": "1 medium (196g)"},
    {"name": "Cucumber", "calories": 8, "protein": 0.3, "carbs": 1.9, "fat": 0.1, "serving_size": "1/2 cup (52g)"},
    {"name": "Walnuts", "calories": 185, "protein": 4.3, "carbs": 3.9, "fat": 18.5, "serving_size": "1/4 cup (30g)"}
]

def populate_foods():
    """Populate the database with common foods"""
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(CommonFood).count()
        if existing_count > 0:
            print(f"Common foods table already has {existing_count} entries, skipping population")
            return
        
        # Add foods to the database
        for food in COMMON_FOODS:
            db_food = CommonFood(
                name=food["name"],
                calories=food["calories"],
                protein=food["protein"],
                carbs=food["carbs"],
                fat=food["fat"],
                serving_size=food["serving_size"]
            )
            db.add(db_food)
        
        db.commit()
        print(f"Added {len(COMMON_FOODS)} foods to the database")
    except Exception as e:
        db.rollback()
        print(f"Error populating foods: {e}")
    finally:
        db.close()

def import_from_csv(csv_file):
    """Import foods from a CSV file"""
    db = SessionLocal()
    try:
        with open(csv_file, 'r') as file:
            csv_reader = csv.DictReader(file)
            count = 0
            for row in csv_reader:
                db_food = CommonFood(
                    name=row["name"],
                    calories=float(row["calories"]),
                    protein=float(row["protein"]),
                    carbs=float(row["carbs"]),
                    fat=float(row["fat"]),
                    serving_size=row["serving_size"]
                )
                db.add(db_food)
                count += 1
        
        db.commit()
        print(f"Imported {count} foods from {csv_file}")
    except Exception as e:
        db.rollback()
        print(f"Error importing foods from CSV: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Populate the database with common foods
    populate_foods()
    
    # If you have a CSV file with more foods, uncomment this line
    # import_from_csv("foods.csv") 