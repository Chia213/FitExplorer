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
    # This is a documentation-only migration to update model table names
    # We changed the model classes to match the existing table names in the database
    # NutritionMeal now uses table 'meals' instead of 'nutrition_meals'
    # NutritionFood now uses table 'meal_foods' instead of 'nutrition_foods'
    # No actual schema changes are needed
    pass


def downgrade() -> None:
    # This is a documentation-only migration
    pass
