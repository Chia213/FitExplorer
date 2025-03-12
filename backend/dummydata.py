from database import Base, engine


def create_tables():
    Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")


if __name__ == "__main__":
    create_tables()
