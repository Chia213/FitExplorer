"""Remove completed flag from workouts

Revision ID: ca71e9215cee
Revises: 735ed8196c5c
Create Date: 2025-03-31 08:48:48.181094

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ca71e9215cee'
down_revision = '735ed8196c5c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column('workouts', 'completed')

def downgrade() -> None:
    op.add_column('workouts', sa.Column('completed', sa.Boolean(), nullable=True))
