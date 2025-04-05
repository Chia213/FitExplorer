from sqlalchemy import text
from database import SessionLocal

db = SessionLocal()

# SQL to create the tables
create_tables_sql = """
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    date VARCHAR NOT NULL,
    time VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_foods (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_name VARCHAR NOT NULL,
    serving_size VARCHAR,
    quantity FLOAT NOT NULL DEFAULT 1.0,
    calories FLOAT,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT
);
"""

try:
    # Execute the SQL
    db.execute(text(create_tables_sql))
    db.commit()
    print("Tables created successfully")
    
    # Verify the tables exist
    result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('meals', 'meal_foods')"))
    tables = result.fetchall()
    print(f"Verified tables: {tables}")
except Exception as e:
    db.rollback()
    print(f"Error creating tables: {e}")
finally:
    db.close() 