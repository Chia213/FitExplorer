"""fix_routine_timestamps_preserve_time

Revision ID: ca97868535f3
Revises: 57933cfabf1f
Create Date: 2025-04-04 09:37:00.515924

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'ca97868535f3'
down_revision = '57933cfabf1f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get the current year
    current_year = datetime.now().year
    # Update the year in created_at to current year while preserving month, day, time
    op.execute(f"""
        UPDATE routines 
        SET created_at = created_at + interval '1 year' * ({current_year} - EXTRACT(YEAR FROM created_at))
        WHERE EXTRACT(YEAR FROM created_at) > {current_year}
    """)


def downgrade() -> None:
    # Cannot meaningfully revert timestamp changes
    pass
