"""rename user_preferences to user_profile and add summary_day

Revision ID: 4f960ea6e362
Revises: d1c76c23b4f8
Create Date: 2025-04-04 08:33:33.260599

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '4f960ea6e362'
down_revision = 'd1c76c23b4f8'
branch_labels = None
depends_on = None


def upgrade():
    # Rename the table
    op.rename_table('user_preferences', 'user_profiles')
    
    # Rename the foreign key constraint
    op.execute('ALTER TABLE user_profiles RENAME CONSTRAINT user_preferences_user_id_fkey TO user_profiles_user_id_fkey')
    
    # Add summary_day column
    op.add_column('user_profiles', sa.Column('summary_day', sa.String(), nullable=True))
    
    # Update email_notifications default
    op.alter_column('user_profiles', 'email_notifications',
                    existing_type=sa.Boolean(),
                    server_default=sa.text('true'))

def downgrade():
    # Remove summary_day column
    op.drop_column('user_profiles', 'summary_day')
    
    # Revert email_notifications default
    op.alter_column('user_profiles', 'email_notifications',
                    existing_type=sa.Boolean(),
                    server_default=sa.text('false'))
    
    # Rename the table back
    op.rename_table('user_profiles', 'user_preferences')
    
    # Rename the foreign key constraint back
    op.execute('ALTER TABLE user_preferences RENAME CONSTRAINT user_profiles_user_id_fkey TO user_preferences_user_id_fkey') 