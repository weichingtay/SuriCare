import os
import sys
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, select
from app.models import Symptom_Types

def update_symptom_types():
    """
    Updates existing symptom types in the database:
    - Changes 'fever' to 'high_temperature' with label 'High Temperature'
    - Changes 'cold' to 'sneezing' with label 'Sneezing'
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

    engine = create_engine(database_url, echo=False)
    
    with Session(engine) as session:
        print("Updating symptom types...")
        
        # Update fever to high_temperature
        fever_record = session.exec(select(Symptom_Types).where(Symptom_Types.value == "fever")).first()
        if fever_record:
            fever_record.value = "high_temperature"
            fever_record.label = "High Temperature"
            session.add(fever_record)
            print("  Updated: fever -> high_temperature (High Temperature)")
        else:
            print("  Skipped: fever record not found")
        
        # Update cold to sneezing
        cold_record = session.exec(select(Symptom_Types).where(Symptom_Types.value == "cold")).first()
        if cold_record:
            cold_record.value = "sneezing"
            cold_record.label = "Sneezing"
            session.add(cold_record)
            print("  Updated: cold -> sneezing (Sneezing)")
        else:
            print("  Skipped: cold record not found")
        
        session.commit()
        print("Symptom types updated successfully!")

if __name__ == "__main__":
    update_symptom_types()