from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os
import pickle
from config import settings
from datetime import datetime, timezone

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Shows basic usage of the Gmail API.
    Returns the authorized Gmail API service.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)

def create_message(sender, to, subject, message_text):
    """Create a message for an email."""
    message = MIMEMultipart('alternative')
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject

    # Create the HTML version of the message
    html_part = MIMEText(message_text, 'html')
    message.attach(html_part)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

async def send_summary_email(email: str, subject: str, body: str):
    try:
        service = get_gmail_service()
        message = create_message(settings.GMAIL_FROM_EMAIL, email, subject, body)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

async def send_verification_email(email: str, verification_url: str):
    try:
        service = get_gmail_service()
        subject = "Verify Your Email - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, email, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False

async def send_password_reset_email(email: str, reset_url: str):
    try:
        service = get_gmail_service()
        subject = "Reset Your Password - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, email, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending password reset email: {str(e)}")
        return False

async def send_password_changed_email(email: str):
    try:
        service = get_gmail_service()
        subject = "Your Password Has Been Changed - FitExplorer"
        message_text = f"""
        <html>
          <body>
            <h1>Password Changed Successfully</h1>
            <p>Your password has been changed successfully.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
          </body>
        </html>
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, email, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending password changed email: {str(e)}")
        return False

async def send_account_deletion_email(email: str, deletion_url: str):
    try:
        service = get_gmail_service()
        subject = "Confirm Account Deletion - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, email, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending account deletion email: {str(e)}")
        return False

async def notify_admin_new_registration(user_id: int, email: str, username: str):
    try:
        service = get_gmail_service()
        subject = "New User Registration - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, settings.DEFAULT_ADMIN_EMAIL, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending admin notification email: {str(e)}")
        return False

async def notify_admin_account_verified(user_id: int, email: str, username: str):
    """Notify admin when a user verifies their account"""
    try:
        service = get_gmail_service()
        subject = "Account Verified - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, settings.DEFAULT_ADMIN_EMAIL, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending admin notification email: {str(e)}")
        return False

async def notify_admin_password_changed(user_id: int, email: str, username: str):
    """Notify admin when a user changes their password"""
    try:
        service = get_gmail_service()
        subject = "Password Changed - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, settings.DEFAULT_ADMIN_EMAIL, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending admin notification email: {str(e)}")
        return False

async def notify_admin_account_deletion(user_id: int, email: str, username: str):
    """Notify admin when a user deletes their account"""
    try:
        service = get_gmail_service()
        subject = "Account Deleted - FitExplorer"
        message_text = f"""
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
        """
        message = create_message(settings.GMAIL_FROM_EMAIL, settings.DEFAULT_ADMIN_EMAIL, subject, message_text)
        service.users().messages().send(userId='me', body=message).execute()
        return True
    except Exception as e:
        print(f"Error sending admin notification email: {str(e)}")
        return False 