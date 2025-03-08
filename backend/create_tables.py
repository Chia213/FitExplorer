# create_tables.py
from database import Base, engine
from models import User, UserPreferences, Workout, Exercise, Set, CustomExercise, Routine

def create_tables():
    # Force drop existing tables if they exist
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

if __name__ == "__main__":
    create_tables()