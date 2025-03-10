from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True
)

async def send_summary_email(email: str, frequency: str, workout_count: int):
    message = MessageSchema(
        subject=f"Your {frequency.capitalize()} Workout Summary",
        recipients=[email],
        body=f"Good job this {frequency}! You have completed {workout_count} workouts, keep it up! 😊",
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_security_alert(email: str):
    message = MessageSchema(
        subject="Security Alert: Password Changed",
        recipients=[email],
        body="Your password was changed. If this wasn't you, reset it immediately!",
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

