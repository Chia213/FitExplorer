from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from config import settings
from database import SessionLocal
from models import User  # Add this import
from datetime import datetime, timezone

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


async def send_summary_email(email: str, subject: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
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


async def send_verification_email(email: str, verification_url: str):
    """Send email verification link to user"""
    message = MessageSchema(
        subject="Verify Your Email - FitExplorer",
        recipients=[email],
        body=f"""
        <html>
          <body>
            <h1>Welcome to FitExplorer!</h1>
            <p>Thank you for registering. Please verify your email by clicking the button below:</p>
            <p>
              <a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def notify_admin_new_registration(user_id: int, email: str, username: str):
    """Notify admin about new user registration"""
    admin_emails = get_admin_emails()  # Implement this function to get admin emails

    message = MessageSchema(
        subject="New User Registration - FitExplorer",
        recipients=admin_emails,
        body=f"""
        <html>
          <body>
            <h1>New User Registration</h1>
            <p>A new user has registered on FitExplorer:</p>
            <ul>
              <li>User ID: {user_id}</li>
              <li>Username: {username}</li>
              <li>Email: {email}</li>
              <li>Registration Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
            </ul>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


def get_admin_emails():
    """Get all admin emails for notifications"""
    db = SessionLocal()
    try:
        admin_users = db.query(User).filter(User.is_admin == True).all()
        admin_emails = [user.email for user in admin_users]

        # If no admin users found, use a default admin email from settings
        if not admin_emails and hasattr(settings, 'DEFAULT_ADMIN_EMAIL'):
            return [settings.DEFAULT_ADMIN_EMAIL]

        return admin_emails
    finally:
        db.close()


async def send_password_reset_email(email: str, reset_url: str):
    """Send password reset link to user"""
    message = MessageSchema(
        subject="Reset Your Password - FitExplorer",
        recipients=[email],
        body=f"""
        <html>
          <body>
            <h1>Reset Your Password</h1>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <p>
              <a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p>This link will expire in 1 hour. If you did not request this reset, please ignore this email.</p>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_password_changed_email(email: str):
    """Send confirmation that password has been changed"""
    message = MessageSchema(
        subject="Your Password Has Been Changed - FitExplorer",
        recipients=[email],
        body=f"""
        <html>
          <body>
            <h1>Password Changed Successfully</h1>
            <p>Your password has been changed successfully.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_account_deletion_email(email: str, deletion_url: str):
    """Send account deletion confirmation email"""
    message = MessageSchema(
        subject="Confirm Account Deletion - FitExplorer",
        recipients=[email],
        body=f"""
        <html>
          <body>
            <h1>Confirm Account Deletion</h1>
            <p>You have requested to delete your FitExplorer account. This action is permanent and cannot be undone.</p>
            <p>If you wish to proceed, click the button below:</p>
            <p>
              <a href="{deletion_url}" style="background-color: #FF5252; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Confirm Deletion
              </a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{deletion_url}</p>
            <p>This link will expire in 1 hour. If you did not request account deletion, please secure your account immediately.</p>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def notify_admin_account_verified(user_id: int, email: str, username: str):
    """Notify admin when a user verifies their account"""
    admin_emails = get_admin_emails()

    message = MessageSchema(
        subject="Account Verified - FitExplorer",
        recipients=admin_emails,
        body=f"""
        <html>
          <body>
            <h1>User Account Verified</h1>
            <p>A user has verified their email address on FitExplorer:</p>
            <ul>
              <li>User ID: {user_id}</li>
              <li>Username: {username}</li>
              <li>Email: {email}</li>
              <li>Verification Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
            </ul>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def notify_admin_password_changed(user_id: int, email: str, username: str):
    """Notify admin when a user changes their password"""
    admin_emails = get_admin_emails()

    message = MessageSchema(
        subject="Password Changed - FitExplorer",
        recipients=admin_emails,
        body=f"""
        <html>
          <body>
            <h1>User Password Changed</h1>
            <p>A user has changed their password on FitExplorer:</p>
            <ul>
              <li>User ID: {user_id}</li>
              <li>Username: {username}</li>
              <li>Email: {email}</li>
              <li>Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
            </ul>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def notify_admin_account_deletion(user_id: int, email: str, username: str):
    """Notify admin when a user deletes their account"""
    admin_emails = get_admin_emails()

    message = MessageSchema(
        subject="Account Deleted - FitExplorer",
        recipients=admin_emails,
        body=f"""
        <html>
          <body>
            <h1>User Account Deleted</h1>
            <p>A user has deleted their account from FitExplorer:</p>
            <ul>
              <li>User ID: {user_id}</li>
              <li>Username: {username}</li>
              <li>Email: {email}</li>
              <li>Deletion Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</li>
            </ul>
          </body>
        </html>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
