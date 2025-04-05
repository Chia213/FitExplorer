import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

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

try:
    print("\n=== Checking Database Tables ===\n")
    
    # Check all tables
    tables = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).fetchall()
    print(f"Tables in database: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check common_foods table
    try:
        count = db.execute(text("SELECT COUNT(*) FROM common_foods")).scalar()
        print(f"\nCommon Foods: {count} records")
        if count > 0:
            sample = db.execute(text("SELECT name, calories FROM common_foods LIMIT 3")).fetchall()
            print("Sample foods:")
            for food in sample:
                print(f"  - {food[0]}: {food[1]} calories")
    except Exception as e:
        print(f"Error checking common_foods: {str(e)}")
    
    # Check meals table
    try:
        count = db.execute(text("SELECT COUNT(*) FROM meals")).scalar()
        print(f"\nMeals: {count} records")
        if count > 0:
            sample = db.execute(text("SELECT id, name, user_id, date FROM meals LIMIT 3")).fetchall()
            print("Sample meals:")
            for meal in sample:
                print(f"  - Meal ID {meal[0]}: {meal[1]} (User ID: {meal[2]}, Date: {meal[3]})")
    except Exception as e:
        print(f"Error checking meals: {str(e)}")
    
    # Check meal_foods table
    try:
        count = db.execute(text("SELECT COUNT(*) FROM meal_foods")).scalar()
        print(f"\nMeal Foods: {count} records")
        if count > 0:
            sample = db.execute(text("SELECT id, meal_id, food_name, calories FROM meal_foods LIMIT 3")).fetchall()
            print("Sample meal foods:")
            for food in sample:
                print(f"  - Food ID {food[0]}: {food[2]} in Meal ID {food[1]} ({food[3]} calories)")
    except Exception as e:
        print(f"Error checking meal_foods: {str(e)}")
    
    # Check users table
    try:
        count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        print(f"\nUsers: {count} records")
        if count > 0:
            sample = db.execute(text("SELECT id, username, email FROM users LIMIT 3")).fetchall()
            print("Sample users:")
            for user in sample:
                print(f"  - User ID {user[0]}: {user[1]} ({user[2]})")
    except Exception as e:
        print(f"Error checking users: {str(e)}")
    
except Exception as e:
    print(f"Database error: {str(e)}")

finally:
    db.close()
    print("\nDatabase connection closed") 