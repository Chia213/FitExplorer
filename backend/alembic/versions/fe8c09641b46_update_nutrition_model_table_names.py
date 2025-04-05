"""update nutrition model table names

Revision ID: fe8c09641b46
Revises: 492b3f54f66b
Create Date: 2025-04-05 20:21:06.567213

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fe8c09641b46'
down_revision = '492b3f54f66b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the meals and meal_foods tables as they don't exist yet
    op.create_table('meals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('time', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('meal_foods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meal_id', sa.Integer(), nullable=False),
        sa.Column('food_name', sa.String(), nullable=False),
        sa.Column('serving_size', sa.String(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False, default=1.0),
        sa.Column('calories', sa.Float(), nullable=True),
        sa.Column('protein', sa.Float(), nullable=True),
        sa.Column('carbs', sa.Float(), nullable=True),
        sa.Column('fat', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['meal_id'], ['meals.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop the tables if needed to roll back
    op.drop_table('meal_foods')
    op.drop_table('meals')
