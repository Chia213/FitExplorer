from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv(
    "DB_URL", "postgresql+psycopg2://postgres:idioten@localhost:5432/fitdemo")
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1000000))
