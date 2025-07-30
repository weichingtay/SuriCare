#!/usr/bin/env python3
"""
Debug script to check symptom data for Pui Sim
"""

import os
import sys
from sqlmodel import create_engine, text
from datetime import datetime, timedelta, timezone

# Database connection
DATABASE_URL = "postgresql://postgres:postgres@localhost/suricare_dev"
engine = create_engine(DATABASE_URL)

def debug_symptoms():
    with engine.connect() as conn:
        print("🔍 DEBUGGING SYMPTOMS FOR PUI SIM (child_id=1)")
        print("=" * 50)
        
        # 1. Check raw database data
        print("\n1. RAW DATABASE QUERY:")
        result = conn.execute(text("""
            SELECT check_in, symptom, note 
            FROM symptom 
            WHERE child_id = 1 
            ORDER BY check_in DESC
        """))
        
        symptoms = result.fetchall()
        print(f"Total symptoms found: {len(symptoms)}")
        for symptom in symptoms:
            print(f"  - {symptom[0]}: {symptom[1]} - {symptom[2]}")
        
        # 2. Check with timezone-aware cutoff (like health service now does)
        print("\n2. TIMEZONE-AWARE QUERY (30 days back):")
        gmt_plus_8 = timezone(timedelta(hours=8))
        cutoff_date = datetime.now(gmt_plus_8) - timedelta(days=30)
        print(f"Cutoff date (GMT+8): {cutoff_date}")
        
        result_recent = conn.execute(text("""
            SELECT check_in, symptom, note 
            FROM symptom 
            WHERE child_id = 1 AND check_in >= :cutoff_date
            ORDER BY check_in DESC
        """), {"cutoff_date": cutoff_date})
        
        symptoms_recent = result_recent.fetchall()
        print(f"Recent symptoms found: {len(symptoms_recent)}")
        for symptom in symptoms_recent:
            print(f"  - {symptom[0]}: {symptom[1]} - {symptom[2]}")
        
        # 3. Check dates comparison
        print("\n3. DATE COMPARISON:")
        print(f"Current time (GMT+8): {datetime.now(gmt_plus_8)}")
        print(f"Cutoff time (GMT+8): {cutoff_date}")
        
        if symptoms:
            latest_symptom_time = symptoms[0][0]
            print(f"Latest symptom time: {latest_symptom_time}")
            print(f"Is latest symptom after cutoff? {latest_symptom_time >= cutoff_date}")
            
        # 4. Check last 7 days specifically
        print("\n4. LAST 7 DAYS:")
        cutoff_7_days = datetime.now(gmt_plus_8) - timedelta(days=7)
        result_7days = conn.execute(text("""
            SELECT check_in, symptom, note 
            FROM symptom 
            WHERE child_id = 1 AND check_in >= :cutoff_date
            ORDER BY check_in DESC
        """), {"cutoff_date": cutoff_7_days})
        
        symptoms_7days = result_7days.fetchall()
        print(f"Symptoms in last 7 days: {len(symptoms_7days)}")
        for symptom in symptoms_7days:
            print(f"  - {symptom[0]}: {symptom[1]} - {symptom[2]}")

if __name__ == "__main__":
    debug_symptoms()