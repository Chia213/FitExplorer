"""add admin settings table

Revision ID: d1c76c23b4f8
Revises: bd62777e6305
Create Date: 2025-04-04 01:36:01.031548

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd1c76c23b4f8'
down_revision = 'bd62777e6305'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create admin_settings table
    op.create_table(
        'admin_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auto_verify_users', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('require_email_verification', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('require_2fa_admins', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('session_timeout', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('backup_frequency', sa.String(), nullable=False, server_default='daily'),
        sa.Column('data_retention_months', sa.Integer(), nullable=False, server_default='24'),
        sa.Column('notify_new_users', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_system_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_updated', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create initial admin settings record
    op.execute("""
        INSERT INTO admin_settings (
            auto_verify_users,
            require_email_verification,
            require_2fa_admins,
            session_timeout,
            backup_frequency,
            data_retention_months,
            notify_new_users,
            notify_system_alerts
        ) VALUES (
            false,
            true,
            true,
            60,
            'daily',
            24,
            true,
            true
        )
    """)


def downgrade() -> None:
    op.drop_table('admin_settings')