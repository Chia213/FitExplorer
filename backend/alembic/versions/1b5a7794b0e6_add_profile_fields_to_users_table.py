"""Add profile fields to users table

Revision ID: 1b5a7794b0e6
Revises: fd283dd035a9
Create Date: 2025-04-04 10:33:58.096619

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1b5a7794b0e6'
down_revision = 'fd283dd035a9'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('height', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('weight', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('gender', sa.String(), nullable=True))
    op.add_column('users', sa.Column('fitness_goals', sa.String(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.String(), nullable=True))

def downgrade():
    # Remove columns from users table
    op.drop_column('users', 'height')
    op.drop_column('users', 'weight')
    op.drop_column('users', 'age')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'fitness_goals')
    op.drop_column('users', 'bio') 