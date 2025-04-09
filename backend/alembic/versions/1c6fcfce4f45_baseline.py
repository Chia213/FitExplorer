"""baseline

Revision ID: 1c6fcfce4f45
Revises: 
Create Date: 2025-03-09 00:58:39.020825

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1c6fcfce4f45'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('username', sa.String(), unique=True, nullable=False),
        sa.Column('profile_picture', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('is_admin', sa.Boolean(), default=False, nullable=False),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('verification_token', sa.String(), nullable=True),
        sa.Column('verification_token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reset_token', sa.String(), nullable=True),
        sa.Column('reset_token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deletion_token', sa.String(), nullable=True),
        sa.Column('deletion_token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('height', sa.Float(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.String(), nullable=True),
        sa.Column('fitness_goals', sa.String(), nullable=True),
        sa.Column('bio', sa.String(), nullable=True)
    )

    # Create user_profiles table
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), unique=True),
        sa.Column('goal_weight', sa.Float(), nullable=True),
        sa.Column('email_notifications', sa.Boolean(), default=True),
        sa.Column('summary_frequency', sa.String(), nullable=True),
        sa.Column('summary_day', sa.String(), nullable=True),
        sa.Column('card_color', sa.String(), default="#dbeafe"),
        sa.Column('workout_templates_unlocked', sa.Boolean(), default=False),
        sa.Column('stats_features_unlocked', sa.Boolean(), default=False),
        sa.Column('achievement_alerts', sa.Boolean(), default=True),
        sa.Column('all_notifications_enabled', sa.Boolean(), default=True),
        sa.Column('theme_mode', sa.String(), default="light"),
        sa.Column('premium_theme', sa.String(), default="default"),
        sa.Column('unlocked_themes', postgresql.JSON(), default=lambda: ["default"])
    )

    # Create workouts table
    op.create_table(
        'workouts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('bodyweight', sa.Float(), nullable=True),
        sa.Column('weight_unit', sa.String(), default="kg"),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('is_template', sa.Boolean(), default=False, nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    )

    # Create exercises table
    op.create_table(
        'exercises',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('is_cardio', sa.Boolean(), default=False),
        sa.Column('workout_id', sa.Integer(), sa.ForeignKey('workouts.id', ondelete="CASCADE"), nullable=False)
    )

    # Create sets table
    op.create_table(
        'sets',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('reps', sa.Integer(), nullable=True),
        sa.Column('distance', sa.Float(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('intensity', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('exercise_id', sa.Integer(), sa.ForeignKey('exercises.id', ondelete="CASCADE"), nullable=False),
        sa.Column('is_warmup', sa.Boolean(), default=False),
        sa.Column('is_drop_set', sa.Boolean(), default=False),
        sa.Column('is_superset', sa.Boolean(), default=False),
        sa.Column('is_amrap', sa.Boolean(), default=False),
        sa.Column('is_restpause', sa.Boolean(), default=False),
        sa.Column('is_pyramid', sa.Boolean(), default=False),
        sa.Column('is_giant', sa.Boolean(), default=False),
        sa.Column('drop_number', sa.Integer(), nullable=True),
        sa.Column('original_weight', sa.Float(), nullable=True),
        sa.Column('superset_with', sa.String(), nullable=True),
        sa.Column('rest_pauses', sa.Integer(), nullable=True),
        sa.Column('pyramid_type', sa.String(), nullable=True),
        sa.Column('pyramid_step', sa.Integer(), nullable=True),
        sa.Column('giant_with', postgresql.JSON(), nullable=True)
    )

    # Create custom_exercises table
    op.create_table(
        'custom_exercises',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), index=True),
        sa.Column('category', sa.String(), index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    )

    # Create routine_folders table
    op.create_table(
        'routine_folders',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    # Create routines table
    op.create_table(
        'routines',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('weight_unit', sa.String(), default="kg"),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('workout_id', sa.Integer(), sa.ForeignKey('workouts.id', ondelete="CASCADE"), nullable=True),
        sa.Column('folder_id', sa.Integer(), sa.ForeignKey('routine_folders.id', ondelete="SET NULL"), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # Create saved_workout_programs table
    op.create_table(
        'saved_workout_programs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('name', sa.String(), default="Workout Program"),
        sa.Column('description', sa.String(), default=""),
        sa.Column('category', sa.String(), default="General"),
        sa.Column('program_data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('current_week', sa.Integer(), default=1),
        sa.Column('completed_weeks', postgresql.JSON()),
        sa.Column('exercise_weights', postgresql.JSON(), nullable=True),
        sa.Column('exercise_notes', postgresql.JSON(), nullable=True),
        sa.Column('weight_unit', sa.String(), default="kg")
    )

    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), default="bell"),
        sa.Column('icon_color', sa.String(), default="text-blue-500"),
        sa.Column('read', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    # Create workout_preferences table
    op.create_table(
        'workout_preferences',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), unique=True),
        sa.Column('last_bodyweight', sa.Float(), nullable=True),
        sa.Column('last_weight_unit', sa.String(), default="kg"),
        sa.Column('last_exercises', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('workout_frequency_goal', sa.Integer(), nullable=True)
    )

    # Create admin_settings table
    op.create_table(
        'admin_settings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('auto_verify_users', sa.Boolean(), default=False),
        sa.Column('require_email_verification', sa.Boolean(), default=True),
        sa.Column('require_2fa_admins', sa.Boolean(), default=True),
        sa.Column('session_timeout', sa.Integer(), default=60),
        sa.Column('backup_frequency', sa.String(), default="daily"),
        sa.Column('data_retention_months', sa.Integer(), default=24),
        sa.Column('notify_new_users', sa.Boolean(), default=True),
        sa.Column('notify_system_alerts', sa.Boolean(), default=True),
        sa.Column('last_updated', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'))
    )

    # Create achievements table
    op.create_table(
        'achievements',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('requirement', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # Create user_achievements table
    op.create_table(
        'user_achievements',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('achievement_id', sa.Integer(), sa.ForeignKey('achievements.id')),
        sa.Column('achieved_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('progress', sa.Integer(), default=0),
        sa.Column('reward_claimed', sa.Boolean(), default=False),
        sa.Column('is_read', sa.Boolean(), default=False),
        sa.Column('achievement_type', sa.String(), default="achievement"),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('earned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('level', sa.Integer(), default=1)
    )

    # Create meals table
    op.create_table(
        'meals',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('time', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    )

    # Create meal_foods table
    op.create_table(
        'meal_foods',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('meal_id', sa.Integer(), sa.ForeignKey('meals.id', ondelete="CASCADE"), nullable=False),
        sa.Column('food_name', sa.String(), nullable=False),
        sa.Column('calories', sa.Float(), nullable=True),
        sa.Column('protein', sa.Float(), nullable=True),
        sa.Column('carbs', sa.Float(), nullable=True),
        sa.Column('fat', sa.Float(), nullable=True),
        sa.Column('serving_size', sa.String(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False, default=1.0)
    )

    # Create nutrition_goals table
    op.create_table(
        'nutrition_goals',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column('calories', sa.Integer(), nullable=False),
        sa.Column('protein', sa.Integer(), nullable=False),
        sa.Column('carbs', sa.Integer(), nullable=False),
        sa.Column('fat', sa.Integer(), nullable=False)
    )

    # Create common_foods table
    op.create_table(
        'common_foods',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, index=True),
        sa.Column('calories', sa.Float(), nullable=False),
        sa.Column('protein', sa.Float(), nullable=False),
        sa.Column('carbs', sa.Float(), nullable=False),
        sa.Column('fat', sa.Float(), nullable=False),
        sa.Column('serving_size', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('fiber', sa.Float(), nullable=True),
        sa.Column('sugar', sa.Float(), nullable=True),
        sa.Column('sodium', sa.Float(), nullable=True),
        sa.Column('food_group', sa.String(), nullable=True),
        sa.Column('brand', sa.String(), nullable=True)
    )

    # Create workout_templates table
    op.create_table(
        'workout_templates',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('level', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('creator', sa.String(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('is_premium', sa.Boolean(), default=False),
        sa.Column('workouts', postgresql.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    # Create user_unlocked_templates table
    op.create_table(
        'user_unlocked_templates',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('template_ids', postgresql.JSON(), nullable=False, server_default='[]'),
        sa.Column('last_updated', sa.DateTime(), server_default=sa.text('now()'))
    )


def downgrade() -> None:
    op.drop_table('user_unlocked_templates')
    op.drop_table('workout_templates')
    op.drop_table('common_foods')
    op.drop_table('nutrition_goals')
    op.drop_table('meal_foods')
    op.drop_table('meals')
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_table('admin_settings')
    op.drop_table('workout_preferences')
    op.drop_table('notifications')
    op.drop_table('saved_workout_programs')
    op.drop_table('routines')
    op.drop_table('routine_folders')
    op.drop_table('custom_exercises')
    op.drop_table('sets')
    op.drop_table('exercises')
    op.drop_table('workouts')
    op.drop_table('user_profiles')
    op.drop_table('users')
