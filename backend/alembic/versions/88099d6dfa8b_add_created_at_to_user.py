"""add_created_at_to_user

Revision ID: 88099d6dfa8b
Revises: ca71e9215cee
Create Date: 2025-03-31 22:13:01.026438

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '88099d6dfa8b'
down_revision = 'ca71e9215cee'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # First update any NULL is_template values
    op.execute("UPDATE workouts SET is_template = FALSE WHERE is_template IS NULL")
    # Then alter the column
    op.alter_column('workouts', 'is_template',
                    existing_type=sa.BOOLEAN(),
                    nullable=False)


def downgrade() -> None:
    # Make is_template nullable again
    op.alter_column('workouts', 'is_template',
                    existing_type=sa.BOOLEAN(),
                    nullable=True)
