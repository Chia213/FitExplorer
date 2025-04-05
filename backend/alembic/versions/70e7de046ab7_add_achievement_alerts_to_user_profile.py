"""add_achievement_alerts_to_user_profile

Revision ID: 70e7de046ab7
Revises: 44a759b3820d
Create Date: 2025-04-05 18:16:04.294519

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '70e7de046ab7'
down_revision = '44a759b3820d'
branch_labels = None
depends_on = None

def upgrade():
    # Add achievement_alerts column with default True value
    op.add_column('user_profiles', sa.Column('achievement_alerts', sa.Boolean(), nullable=True, server_default='true'))
    
    # Fill any existing rows with True
    op.execute("UPDATE user_profiles SET achievement_alerts = true WHERE achievement_alerts IS NULL")
    
    # Make the column non-nullable after filling
    op.alter_column('user_profiles', 'achievement_alerts', nullable=False)


def downgrade():
    # Remove the column
    op.drop_column('user_profiles', 'achievement_alerts') 