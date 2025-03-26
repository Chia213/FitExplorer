"""Update saved workout programs table to use JSON

Revision ID: d8045dc7fc6c
Revises: ce4233aefb7a
Create Date: 2025-03-26 19:00:58.960478

"""
from alembic import op
import sqlalchemy as sa
import json


# revision identifiers, used by Alembic.
revision = 'd8045dc7fc6c'
down_revision = 'ce4233aefb7a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Temporarily convert existing data to JSON
    connection = op.get_bind()

    # Fetch existing data
    result = connection.execute(
        sa.text("SELECT id, program_data, completed_weeks FROM saved_workout_programs"))
    rows = result.fetchall()

    # Alter column type
    op.alter_column('saved_workout_programs', 'program_data',
                    type_=sa.JSON(),
                    postgresql_using='program_data::json')

    op.alter_column('saved_workout_programs', 'completed_weeks',
                    type_=sa.JSON(),
                    postgresql_using='completed_weeks::json')

    # Reinsert data with proper JSON conversion
    if rows:
        for row in rows:
            try:
                # Try to parse existing data
                program_data = json.loads(row[1]) if row[1] else {}
                completed_weeks = json.loads(row[2]) if row[2] else []

                # Update row with parsed JSON
                connection.execute(
                    sa.text("""
                    UPDATE saved_workout_programs 
                    SET program_data = :program_data, 
                        completed_weeks = :completed_weeks 
                    WHERE id = :id
                    """),
                    {
                        'id': row[0],
                        'program_data': json.dumps(program_data),
                        'completed_weeks': json.dumps(completed_weeks)
                    }
                )
            except (TypeError, json.JSONDecodeError):
                # Handle any rows with invalid JSON
                print(f"Could not convert row {row[0]}")


def downgrade() -> None:
    # Revert column types back to string if needed
    op.alter_column('saved_workout_programs', 'program_data',
                    type_=sa.String(),
                    postgresql_using='program_data::text')

    op.alter_column('saved_workout_programs', 'completed_weeks',
                    type_=sa.String(),
                    postgresql_using='completed_weeks::text')
