from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from database import Base
from config import settings

from models import User, UserPreferences, Workout, Exercise, Set, CustomExercise, Routine

config = context.config
fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.DB_URL)
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode without a DB connection."""
    context.configure(
        url=settings.DB_URL, 
        target_metadata=target_metadata, 
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}), 
        prefix="sqlalchemy.", 
        poolclass=pool.NullPool
    )

    with connectable.connect() as connection:

        Base.metadata.reflect(bind=connection)
        
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
