from sqlmodel import Session, SQLModel, create_engine, text
import os
from dotenv import load_dotenv


load_dotenv()
password = os.getenv("SUPABASE_PASSWORD")
host = os.getenv("SUPABASE_HOST")
DATABASE_URL = f"postgresql://postgres:{password}@{host}:5432/postgres"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
