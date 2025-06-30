import os
import sys
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine

# Import all models here so SQLModel knows about them
from app.models import *

def create_db_and_tables():
    """
    Creates the database and all tables defined in the SQLModel metadata.
    """
    load_dotenv()
    password = os.getenv("SUPABASE_PASSWORD")
    host = os.getenv("SUPABASE_POOLER_URL")
    user = os.getenv("SUPABASE_USER")
    port = os.getenv("SUPABASE_PORT")
    
    if not all([password, host, user, port]):
        sys.exit("Missing one or more Supabase environment variables (SUPABASE_PASSWORD, SUPABASE_POOLER_URL, SUPABASE_USER, SUPABASE_PORT)")

    database_url = f"postgresql://{user}:{password}@{host}:{port}/postgres"
    print(f"Connecting to database at: {host}")

    engine = create_engine(database_url, echo=False) # Set echo to False for cleaner output
    
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_db_and_tables()
