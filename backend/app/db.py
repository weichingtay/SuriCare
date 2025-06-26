from sqlmodel import Session, SQLModel, create_engine, text
import os,sys
from dotenv import load_dotenv


load_dotenv()
password = os.getenv("SUPABASE_PASSWORD")
host = os.getenv("SUPABASE_POOLER_URL")
user = os.getenv("SUPABASE_USER")
port = os.getenv("SUPABASE_PORT")
DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/postgres"

if not DATABASE_URL:
    sys.exit("SUPABASE_POOLER_URL is not set!")
else: 
    print("DATABASE_URL is set")
    print(DATABASE_URL)

engine = create_engine(DATABASE_URL, echo=True)



def get_session():
    with Session(engine) as session:
        yield session
