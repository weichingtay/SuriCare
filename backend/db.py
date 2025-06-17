from sqlmodel import Session, SQLModel, create_engine, text
import os
from dotenv import load_dotenv


load_dotenv()
pgAdmin_password = os.getenv("DB_PASSWORD")
DATABASE_URL = f"postgresql+psycopg://postgres:{pgAdmin_password}@localhost:5432/test_db"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
