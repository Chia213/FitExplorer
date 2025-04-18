"""update_custom_exercises_table_structure

Revision ID: ad4ce748257e
Revises: 75d8c83bc04f
Create Date: 2025-04-18 14:21:08.221258

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ad4ce748257e'
down_revision = '75d8c83bc04f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add created_at column
    op.add_column('custom_exercises', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    
    # Make name and category not nullable
    op.alter_column('custom_exercises', 'name',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('custom_exercises', 'category',
               existing_type=sa.VARCHAR(),
               nullable=False)
    
    # Make user_id nullable and remove CASCADE
    op.alter_column('custom_exercises', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    
    # Update foreign key constraint (remove CASCADE)
    op.drop_constraint('custom_exercises_user_id_fkey', 'custom_exercises', type_='foreignkey')
    op.create_foreign_key(None, 'custom_exercises', 'users', ['user_id'], ['id'])
               

def downgrade() -> None:
    # Remove created_at column
    op.drop_column('custom_exercises', 'created_at')
    
    # Make name and category nullable
    op.alter_column('custom_exercises', 'name',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('custom_exercises', 'category',
               existing_type=sa.VARCHAR(),
               nullable=True)
    
    # Make user_id not nullable and add CASCADE
    op.alter_column('custom_exercises', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    
    # Restore original foreign key with CASCADE
    op.drop_constraint(None, 'custom_exercises', type_='foreignkey')
    op.create_foreign_key('custom_exercises_user_id_fkey', 'custom_exercises', 'users', ['user_id'], ['id'], ondelete='CASCADE')
