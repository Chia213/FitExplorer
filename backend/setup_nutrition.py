import os
import shutil
import subprocess
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base, CommonFood
from create_food_database import populate_foods

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DB_URL")
if not DATABASE_URL:
    # Fallback URL for PostgreSQL
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/fitdemo"
    print(f"WARNING: DB_URL not found in environment, using fallback: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_command(command):
    """Run a shell command and print output"""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode == 0

def setup_nutrition_database():
    """Set up the nutrition database components"""
    print("Setting up nutrition database components...")
    
    # 1. Check for problematic migration files
    migration_dir = os.path.join(os.path.dirname(__file__), "alembic", "versions")
    problematic_file = os.path.join(migration_dir, "6245cfd74b8d_add_common_foods_table.py")
    
    if os.path.exists(problematic_file):
        print(f"Removing problematic migration file: {problematic_file}")
        os.remove(problematic_file)
    
    # 2. Run alembic upgrade
    if not run_command("alembic upgrade head"):
        print("Error running alembic upgrade. Please check your migration files.")
        return False
    
    # 3. Populate the common_foods table
    try:
        # Check if table exists
        with engine.connect() as conn:
            result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'common_foods')"))
            table_exists = result.scalar()
        
        if table_exists:
            print("CommonFoods table exists, populating with data...")
            populate_foods()
        else:
            print("CommonFoods table doesn't exist. Migration may not have run correctly.")
            return False
            
        print("Nutrition database setup completed successfully!")
        return True
    except Exception as e:
        print(f"Error populating common foods: {e}")
        return False

if __name__ == "__main__":
    success = setup_nutrition_database()
    sys.exit(0 if success else 1) 