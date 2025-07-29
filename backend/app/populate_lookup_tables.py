import os
import sys
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, select
from models import Gender_Options, Relationship_Types, Access_Levels, Symptom_Types, Consumption_Levels

def populate_lookup_tables():
    """
    Populates the lookup tables with initial data for form options.
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
        # Gender Options Data
        gender_data = [
            {"value": "male", "label": "Male"},
            {"value": "female", "label": "Female"},
            {"value": "other", "label": "Other"},
            {"value": "prefer_not_to_say", "label": "Prefer not to say"},
        ]
        
        # Relationship Types Data
        relationship_data = [
            {"value": "mother", "label": "Mother"},
            {"value": "father", "label": "Father"},
            {"value": "grandfather", "label": "Grandfather"},
            {"value": "grandmother", "label": "Grandmother"},
            {"value": "nanny_babysitter", "label": "Nanny/Babysitter"},
            {"value": "aunt", "label": "Aunt"},
            {"value": "uncle", "label": "Uncle"},
            {"value": "guardian", "label": "Guardian"},
            {"value": "other", "label": "Other"},
        ]
        
        # Access Levels Data
        access_data = [
            {"value": "full", "label": "Full Access"},
            {"value": "partial", "label": "Partial Access"},
        ]
        
        # NEW: Symptom Types Data (matching your useSymptomOptions fallback)
        symptom_data = [
            {"value": "cough", "label": "Cough", "icon": "mdi-account-voice"},
            {"value": "fever", "label": "Fever", "icon": "mdi-thermometer"},
            {"value": "cold", "label": "Cold", "icon": "mdi-weather-snowy"},
            {"value": "rash", "label": "Rash", "icon": "mdi-circle-outline"},
            {"value": "other", "label": "Other", "icon": "mdi-dots-horizontal"},
        ]
        
        # NEW: Consumption Levels Data (matching your useMealOptions)
        consumption_data = [
            {"value": "0", "label": "0% (Refused)", "percentage": 0},
            {"value": "25", "label": "25% (Poor)", "percentage": 25},
            {"value": "50", "label": "50% (Partial)", "percentage": 50},
            {"value": "75", "label": "75% (Good)", "percentage": 75},
            {"value": "100", "label": "100% (Full)", "percentage": 100},
        ]
        
        # Populate Gender Options
        print("Populating Gender Options...")
        for item in gender_data:
            existing = session.exec(select(Gender_Options).where(Gender_Options.value == item["value"])).first()
            if not existing:
                gender_option = Gender_Options(**item)
                session.add(gender_option)
                print(f"  Added: {item['label']}")
            else:
                print(f"  Skipped (exists): {item['label']}")
        
        # Populate Relationship Types
        print("Populating Relationship Types...")
        for item in relationship_data:
            existing = session.exec(select(Relationship_Types).where(Relationship_Types.value == item["value"])).first()
            if not existing:
                relationship_type = Relationship_Types(**item)
                session.add(relationship_type)
                print(f"  Added: {item['label']}")
            else:
                print(f"  Skipped (exists): {item['label']}")
        
        # Populate Access Levels
        print("Populating Access Levels...")
        for item in access_data:
            existing = session.exec(select(Access_Levels).where(Access_Levels.value == item["value"])).first()
            if not existing:
                access_level = Access_Levels(**item)
                session.add(access_level)
                print(f"  Added: {item['label']}")
            else:
                print(f"  Skipped (exists): {item['label']}")
        
        # NEW: Populate Symptom Types
        print("Populating Symptom Types...")
        for item in symptom_data:
            existing = session.exec(select(Symptom_Types).where(Symptom_Types.value == item["value"])).first()
            if not existing:
                symptom_type = Symptom_Types(**item)
                session.add(symptom_type)
                print(f"  Added: {item['label']}")
            else:
                print(f"  Skipped (exists): {item['label']}")
        
        # NEW: Populate Consumption Levels
        print("Populating Consumption Levels...")
        for item in consumption_data:
            existing = session.exec(select(Consumption_Levels).where(Consumption_Levels.value == item["value"])).first()
            if not existing:
                consumption_level = Consumption_Levels(**item)
                session.add(consumption_level)
                print(f"  Added: {item['label']}")
            else:
                print(f"  Skipped (exists): {item['label']}")
        
        session.commit()
        print("All lookup tables populated successfully!")

if __name__ == "__main__":
    populate_lookup_tables()