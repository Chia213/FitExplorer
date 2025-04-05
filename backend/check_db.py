from models import Base, CommonFood
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DB_URL = os.getenv("DB_URL")
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)

def check_db():
    """Check database tables and contents"""
    # Check if tables exist
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables in database:", tables)
    print("CommonFood exists:", "common_foods" in tables)
    
    # Check CommonFood table contents
    session = Session()
    try:
        count = session.query(CommonFood).count()
        print(f"Number of foods in CommonFood table: {count}")
        
        if count > 0:
            foods = session.query(CommonFood).limit(5).all()
            print("\nSample foods:")
            for food in foods:
                print(f"- {food.name}: {food.calories} cal, {food.protein}g protein, {food.carbs}g carbs, {food.fat}g fat")
        else:
            print("No foods found in CommonFood table")
            
    finally:
        session.close()

if __name__ == "__main__":
    check_db() 