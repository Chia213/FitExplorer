"""Add exercise and set models

Revision ID: fb8db323f472
Revises: 4dc93ab3e6e6
Create Date: 2025-03-05 15:09:03.598147

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'fb8db323f472'
down_revision: Union[str, None] = '4dc93ab3e6e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop tables in the correct order (respecting dependencies)
    # First drop tables that depend on other tables
    op.execute('DROP TABLE IF EXISTS sets CASCADE')
    op.execute('DROP TABLE IF EXISTS exercises CASCADE')
    op.execute('DROP TABLE IF EXISTS workouts CASCADE')
    op.execute('DROP TABLE IF EXISTS custom_exercises CASCADE')
    op.execute('DROP TABLE IF EXISTS users CASCADE')

    # Now create the tables in the correct order
    # Users first (no dependencies)
    op.create_table('users',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('email', sa.VARCHAR(), nullable=False),
                    sa.Column('hashed_password', sa.VARCHAR(), nullable=False),
                    sa.Column('username', sa.VARCHAR(), nullable=False),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Then tables that depend on users
    op.create_table('workouts',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(), nullable=False),
                    sa.Column('date', sa.DateTime(), nullable=True),
                    sa.Column('start_time', sa.DateTime(), nullable=True),
                    sa.Column('end_time', sa.DateTime(), nullable=True),
                    sa.Column('bodyweight', sa.INTEGER(), nullable=True),
                    sa.Column('notes', sa.VARCHAR(), nullable=True),
                    sa.Column('user_id', sa.INTEGER(), nullable=True),
                    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_workouts_id', 'workouts', ['id'], unique=False)

    op.create_table('custom_exercises',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(), nullable=True),
                    sa.Column('category', sa.VARCHAR(), nullable=True),
                    sa.Column('user_id', sa.INTEGER(), nullable=True),
                    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_custom_exercises_id',
                    'custom_exercises', ['id'], unique=False)
    op.create_index('ix_custom_exercises_name',
                    'custom_exercises', ['name'], unique=False)
    op.create_index('ix_custom_exercises_category',
                    'custom_exercises', ['category'], unique=False)

    # Then tables that depend on workouts
    op.create_table('exercises',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(), nullable=False),
                    sa.Column('category', sa.VARCHAR(), nullable=True),
                    sa.Column('is_cardio', sa.BOOLEAN(), nullable=True),
                    sa.Column('workout_id', sa.INTEGER(), nullable=True),
                    sa.ForeignKeyConstraint(['workout_id'], ['workouts.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_exercises_id', 'exercises', ['id'], unique=False)

    # Finally tables that depend on exercises
    op.create_table('sets',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('weight', sa.Float(), nullable=True),
                    sa.Column('reps', sa.INTEGER(), nullable=True),
                    sa.Column('distance', sa.Float(), nullable=True),
                    sa.Column('duration', sa.INTEGER(), nullable=True),
                    sa.Column('intensity', sa.INTEGER(), nullable=True),
                    sa.Column('notes', sa.VARCHAR(), nullable=True),
                    sa.Column('exercise_id', sa.INTEGER(), nullable=True),
                    sa.ForeignKeyConstraint(
                        ['exercise_id'], ['exercises.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_sets_id', 'sets', ['id'], unique=False)


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('custom_exercises',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.Column('category', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.Column('user_id', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.ForeignKeyConstraint(
                        ['user_id'], ['users.id'], name='custom_exercises_user_id_fkey'),
                    sa.PrimaryKeyConstraint('id', name='custom_exercises_pkey')
                    )
    op.create_index('ix_custom_exercises_name',
                    'custom_exercises', ['name'], unique=False)
    op.create_index('ix_custom_exercises_id',
                    'custom_exercises', ['id'], unique=False)
    op.create_index('ix_custom_exercises_category',
                    'custom_exercises', ['category'], unique=False)
    op.create_table('exercises',
                    sa.Column('id', sa.INTEGER(), server_default=sa.text(
                        "nextval('exercises_id_seq'::regclass)"), autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(),
                              autoincrement=False, nullable=False),
                    sa.Column('category', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.Column('is_cardio', sa.BOOLEAN(),
                              autoincrement=False, nullable=True),
                    sa.Column('workout_id', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.ForeignKeyConstraint(
                        ['workout_id'], ['workouts.id'], name='exercises_workout_id_fkey'),
                    sa.PrimaryKeyConstraint('id', name='exercises_pkey'),
                    postgresql_ignore_search_path=False
                    )
    op.create_index('ix_exercises_id', 'exercises', ['id'], unique=False)
    op.create_table('sets',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('weight', sa.DOUBLE_PRECISION(
                        precision=53), autoincrement=False, nullable=True),
                    sa.Column('reps', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.Column('distance', sa.DOUBLE_PRECISION(precision=53),
                              autoincrement=False, nullable=True),
                    sa.Column('duration', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.Column('intensity', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.Column('notes', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.Column('exercise_id', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.ForeignKeyConstraint(
                        ['exercise_id'], ['exercises.id'], name='sets_exercise_id_fkey'),
                    sa.PrimaryKeyConstraint('id', name='sets_pkey')
                    )
    op.create_index('ix_sets_id', 'sets', ['id'], unique=False)
    op.create_table('workouts',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(),
                              autoincrement=False, nullable=False),
                    sa.Column('date', postgresql.TIMESTAMP(),
                              autoincrement=False, nullable=True),
                    sa.Column('start_time', postgresql.TIMESTAMP(),
                              autoincrement=False, nullable=True),
                    sa.Column('end_time', postgresql.TIMESTAMP(),
                              autoincrement=False, nullable=True),
                    sa.Column('bodyweight', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.Column('notes', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.Column('user_id', sa.INTEGER(),
                              autoincrement=False, nullable=True),
                    sa.ForeignKeyConstraint(
                        ['user_id'], ['users.id'], name='workouts_user_id_fkey'),
                    sa.PrimaryKeyConstraint('id', name='workouts_pkey')
                    )
    op.create_index('ix_workouts_id', 'workouts', ['id'], unique=False)
    op.create_table('users',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),
                    sa.Column('email', sa.VARCHAR(),
                              autoincrement=False, nullable=False),
                    sa.Column('hashed_password', sa.VARCHAR(),
                              autoincrement=False, nullable=False),
                    sa.Column('username', sa.VARCHAR(),
                              autoincrement=False, nullable=True),
                    sa.PrimaryKeyConstraint('id', name='users_pkey')
                    )
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    # ### end Alembic commands ###
