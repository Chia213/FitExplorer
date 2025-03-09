from dotenv import load_dotenv
import os
from pydantic_settings import BaseSettings

load_dotenv(dotenv_path=".env", override=True)

class Settings(BaseSettings):
    DB_URL: str = os.getenv("DB_URL", "postgresql+psycopg2://postgres:idioten@localhost:5432/fitdemo")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1000000))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

settings = Settings()