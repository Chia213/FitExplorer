from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=".env", override=True)

# Check if we're in development mode
ENV = os.getenv("ENV", "production")


class Settings:
    # Choose DB URL based on environment
    DB_URL: str = os.getenv(
        "DB_URL_LOCAL" if ENV == "development" else "DB_URL", 
        "postgresql+psycopg2://postgres:idioten123!@fitexplorer.c5qmy0yqglup.eu-north-1.rds.amazonaws.com:5432/fitexplorer")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1000000))

    # Gmail API Configuration
    GMAIL_FROM_EMAIL = os.getenv("GMAIL_FROM_EMAIL", "fitexplorer.fitnessapp@gmail.com")

    # Legacy email settings (to be removed after migration)
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "fitexplorer.fitnessapp@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "rznlquqvjqulvwxy")
    MAIL_FROM = os.getenv("MAIL_FROM", "fitexplorer.fitnessapp@gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS = os.getenv("MAIL_TLS", "true").lower() == "true"
    MAIL_SSL_TLS = os.getenv("MAIL_SSL", "false").lower() == "true"
    MAIL_USE_CREDENTIALS = True

    # Get the correct Google OAuth credentials based on environment
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")

    ENABLE_EMAIL_NOTIFICATIONS = os.getenv(
        "ENABLE_EMAIL_NOTIFICATIONS", "true").lower() == "true"
    SUMMARY_FREQUENCY = os.getenv("SUMMARY_FREQUENCY", "weekly")

    # Frontend URL for email verification links - use environment-specific URL
    FRONTEND_URL: str = os.getenv("FRONTEND_BASE_URL", 
                                 "https://fitexplorer.se" if ENV == "production" else "http://localhost:5173")
    DEFAULT_ADMIN_EMAIL: str = os.getenv(
        "DEFAULT_ADMIN_EMAIL", "fitexplorer.fitnessapp@gmail.com")

    # Security token settings
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = int(
        os.getenv("VERIFICATION_TOKEN_EXPIRE_HOURS", 24))
    RESET_TOKEN_EXPIRE_HOURS: int = int(
        os.getenv("RESET_TOKEN_EXPIRE_HOURS", 1))
    DELETION_TOKEN_EXPIRE_HOURS: int = int(
        os.getenv("DELETION_TOKEN_EXPIRE_HOURS", 1))


settings = Settings()

DB_URL = settings.DB_URL
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
GMAIL_FROM_EMAIL = settings.GMAIL_FROM_EMAIL
MAIL_USERNAME = settings.MAIL_USERNAME
MAIL_PASSWORD = settings.MAIL_PASSWORD
MAIL_FROM = settings.MAIL_FROM
MAIL_PORT = settings.MAIL_PORT
MAIL_SERVER = settings.MAIL_SERVER
MAIL_STARTTLS = settings.MAIL_STARTTLS
MAIL_SSL_TLS = settings.MAIL_SSL_TLS
MAIL_USE_CREDENTIALS = settings.MAIL_USE_CREDENTIALS
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
ENABLE_EMAIL_NOTIFICATIONS = settings.ENABLE_EMAIL_NOTIFICATIONS
SUMMARY_FREQUENCY = settings.SUMMARY_FREQUENCY
FRONTEND_URL = settings.FRONTEND_URL
DEFAULT_ADMIN_EMAIL = settings.DEFAULT_ADMIN_EMAIL
VERIFICATION_TOKEN_EXPIRE_HOURS = settings.VERIFICATION_TOKEN_EXPIRE_HOURS
RESET_TOKEN_EXPIRE_HOURS = settings.RESET_TOKEN_EXPIRE_HOURS
DELETION_TOKEN_EXPIRE_HOURS = settings.DELETION_TOKEN_EXPIRE_HOURS
