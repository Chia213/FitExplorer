from dotenv import load_dotenv
import os
from pydantic_settings import BaseSettings

load_dotenv(dotenv_path=".env", override=True)

class Settings(BaseSettings):
    DB_URL: str = os.getenv("DB_URL", "postgresql+psycopg2://postgres:idioten@localhost:5432/fitdemo")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1000000))

    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "your-email-password")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "your-email@gmail.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = os.getenv("MAIL_TLS", "true").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL", "false").lower() == "true"
    MAIL_USE_CREDENTIALS: bool = True

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "")

    ENABLE_EMAIL_NOTIFICATIONS: bool = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "true").lower() == "true"
    SUMMARY_FREQUENCY: str = os.getenv("SUMMARY_FREQUENCY", "weekly")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()