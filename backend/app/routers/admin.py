from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
import random
from typing import List
from pydantic import BaseModel
from sqlmodel import text
from ..db import engine

router = APIRouter(prefix="/admin", tags=["admin"])

class EarInfectionRequest(BaseModel):
    days: int = 3
    children: List[int] = [1, 2]

def generate_timestamp_for_day(days_ago: int, hour: int = None, minute: int = None) -> datetime:
    """Generate a timestamp for a specific day with optional hour/minute in GMT+8"""
    # Create GMT+8 timezone
    gmt_plus_8 = timezone(timedelta(hours=8))
    
    # Start with today in GMT+8 and subtract the number of days
    today = datetime.now(gmt_plus_8).replace(hour=0, minute=0, second=0, microsecond=0)
    base_time = today - timedelta(days=days_ago)
    
    if hour is not None:
        base_time = base_time.replace(hour=hour, minute=minute or 0)
    else:
        # Random time during reasonable daytime hours (avoid sleeping times 10pm-5am)
        base_time = base_time.replace(
            hour=random.randint(6, 19),  # 6am to 7pm only
            minute=random.randint(0, 59)
        )
    return base_time

@router.post("/generate-ear-infection-data")
async def generate_ear_infection_data(request: EarInfectionRequest = None):
    """Generate ear infection progression for Pui Sim (id=1) and normal data for Pang (id=2)"""
    
    if request is None:
        request = EarInfectionRequest()
    
    days = request.days
    children = request.children
    
    try:
        with engine.connect() as conn:
            with conn.begin():
                # Clear existing data for the last 3 days first
                gmt_plus_8 = timezone(timedelta(hours=8))
                cutoff_date = datetime.now(gmt_plus_8) - timedelta(days=days)
                
                for child_id in children:
                    # Clear existing data
                    conn.execute(text("DELETE FROM growth WHERE child_id = :child_id AND check_in >= :cutoff_date"), 
                               {"child_id": child_id, "cutoff_date": cutoff_date})
                    conn.execute(text("DELETE FROM meal WHERE child_id = :child_id AND check_in >= :cutoff_date"), 
                               {"child_id": child_id, "cutoff_date": cutoff_date})
                    conn.execute(text("DELETE FROM sleep_time WHERE child_id = :child_id AND check_in >= :cutoff_date"), 
                               {"child_id": child_id, "cutoff_date": cutoff_date})
                    conn.execute(text("DELETE FROM symptom WHERE child_id = :child_id AND check_in >= :cutoff_date"), 
                               {"child_id": child_id, "cutoff_date": cutoff_date})
                    conn.execute(text("DELETE FROM poop WHERE child_id = :child_id AND check_in >= :cutoff_date"), 
                               {"child_id": child_id, "cutoff_date": cutoff_date})
                
                # Generate data for each child - ONLY Pui Sim (id=1) gets ear infection signs
                for child_id in children:
                    child_name = "Pui Sim" if child_id == 1 else "Pang"
                    
                    if child_id == 1:  # PUI SIM - Ear infection progression
                        # Day 1 (3 days ago, not including today): Very early signs
                        day1_timestamp = generate_timestamp_for_day(3)
                        print(f"DEBUG: Day 1 timestamp for {child_name}: {day1_timestamp} (should be 3 days ago)")
                        
                        # Meals - Slightly reduced appetite (90-95%)
                        meal_times = [
                            (1, 1, 8),  # Breakfast at 8am
                            (2, 2, 13), # Lunch at 1pm  
                            (3, 3, 18)  # Dinner at 6pm
                        ]
                        for meal_time, meal_cat, hour in meal_times:
                            consumption = random.uniform(90, 95)
                            meal_timestamp = day1_timestamp.replace(hour=hour, minute=random.randint(0, 30))
                            conn.execute(text("""
                                INSERT INTO meal (child_id, check_in, consumption_level, meal_time_category, meal_category, note, account_id)
                                VALUES (:child_id, :check_in, :consumption, :meal_time, :meal_cat, :note, 1)
                            """), {
                                "child_id": child_id,
                                "check_in": meal_timestamp,
                                "consumption": consumption,
                                "meal_time": meal_time,
                                "meal_cat": meal_cat,
                                "note": f"Good appetite - {child_name}"
                            })
                        
                        # Sleep - Slightly restless
                        sleep_start = day1_timestamp.replace(hour=19, minute=30)  # 7:30 PM
                        sleep_end = sleep_start + timedelta(hours=9, minutes=random.randint(0, 30))
                        conn.execute(text("""
                            INSERT INTO sleep_time (child_id, check_in, start_time, end_time, note, account_id)
                            VALUES (:child_id, :check_in, :start_time, :end_time, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day1_timestamp,
                            "start_time": sleep_start,
                            "end_time": sleep_end,
                            "note": f"Slightly restless - {child_name}"
                        })
                        
                        # Symptoms - Occasional head touching
                        conn.execute(text("""
                            INSERT INTO symptom (child_id, check_in, symptom, photo_url, note, account_id)
                            VALUES (:child_id, :check_in, :symptom, :photo_url, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day1_timestamp + timedelta(hours=10),
                            "symptom": "Head touching",
                            "photo_url": "https://example.com/photo1.jpg",
                            "note": f"Occasional head touching - {child_name}"
                        })
                        
                        # Day 2 (2 days ago, not including today): Early-middle signs
                        day2_timestamp = generate_timestamp_for_day(2)
                        print(f"DEBUG: Day 2 timestamp for {child_name}: {day2_timestamp} (should be 2 days ago)")
                        
                        # Meals - More reduced appetite (80-85%)
                        for meal_time, meal_cat, hour in meal_times:
                            consumption = random.uniform(80, 85)
                            meal_timestamp = day2_timestamp.replace(hour=hour, minute=random.randint(0, 30))
                            conn.execute(text("""
                                INSERT INTO meal (child_id, check_in, consumption_level, meal_time_category, meal_category, note, account_id)
                                VALUES (:child_id, :check_in, :consumption, :meal_time, :meal_cat, :note, 1)
                            """), {
                                "child_id": child_id,
                                "check_in": meal_timestamp,
                                "consumption": consumption,
                                "meal_time": meal_time,
                                "meal_cat": meal_cat,
                                "note": f"Reduced appetite - {child_name}"
                            })
                        
                        # Sleep - More restless
                        sleep_start = day2_timestamp.replace(hour=19, minute=45)  # 7:45 PM
                        sleep_end = sleep_start + timedelta(hours=8, minutes=random.randint(30, 45))
                        conn.execute(text("""
                            INSERT INTO sleep_time (child_id, check_in, start_time, end_time, note, account_id)
                            VALUES (:child_id, :check_in, :start_time, :end_time, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day2_timestamp,
                            "start_time": sleep_start,
                            "end_time": sleep_end,
                            "note": f"More restless sleep - {child_name}"
                        })
                        
                        # Symptoms - Ear touching + low temperature
                        conn.execute(text("""
                            INSERT INTO symptom (child_id, check_in, symptom, photo_url, note, account_id)
                            VALUES (:child_id, :check_in, :symptom, :photo_url, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day2_timestamp + timedelta(hours=8),
                            "symptom": "Ear touching",
                            "photo_url": "https://example.com/photo2.jpg",
                            "note": f"Frequent ear touching - {child_name}"
                        })
                        
                        conn.execute(text("""
                            INSERT INTO symptom (child_id, check_in, symptom, photo_url, note, account_id)
                            VALUES (:child_id, :check_in, :symptom, :photo_url, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day2_timestamp + timedelta(hours=14),
                            "symptom": "Low temperature",
                            "photo_url": "https://example.com/photo3.jpg",
                            "note": f"Temperature 37.2°C - {child_name}"
                        })
                        
                        # Day 3 (1 day ago): More noticeable signs
                        day3_timestamp = generate_timestamp_for_day(1)
                        print(f"DEBUG: Day 3 timestamp for {child_name}: {day3_timestamp} (should be 1 day ago)")
                        
                        # Meals - Further decreased appetite (75-80%)
                        for meal_time, meal_cat, hour in meal_times:
                            consumption = random.uniform(75, 80)
                            meal_timestamp = day3_timestamp.replace(hour=hour, minute=random.randint(0, 30))
                            conn.execute(text("""
                                INSERT INTO meal (child_id, check_in, consumption_level, meal_time_category, meal_category, note, account_id)
                                VALUES (:child_id, :check_in, :consumption, :meal_time, :meal_cat, :note, 1)
                            """), {
                                "child_id": child_id,
                                "check_in": meal_timestamp,
                                "consumption": consumption,
                                "meal_time": meal_time,
                                "meal_cat": meal_cat,
                                "note": f"Poor appetite - {child_name}"
                            })
                        
                        # Sleep - Very restless
                        sleep_start = day3_timestamp.replace(hour=19, minute=0)  # 7:00 PM
                        sleep_end = sleep_start + timedelta(hours=8, minutes=random.randint(0, 30))
                        conn.execute(text("""
                            INSERT INTO sleep_time (child_id, check_in, start_time, end_time, note, account_id)
                            VALUES (:child_id, :check_in, :start_time, :end_time, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day3_timestamp,
                            "start_time": sleep_start,
                            "end_time": sleep_end,
                            "note": f"Very restless sleep - {child_name}"
                        })
                        
                        # Symptoms - Fussiness + higher temperature
                        conn.execute(text("""
                            INSERT INTO symptom (child_id, check_in, symptom, photo_url, note, account_id)
                            VALUES (:child_id, :check_in, :symptom, :photo_url, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day3_timestamp + timedelta(hours=9),
                            "symptom": "Fussiness",
                            "photo_url": "https://example.com/photo4.jpg",
                            "note": f"Fussy and irritable - {child_name}"
                        })
                        
                        conn.execute(text("""
                            INSERT INTO symptom (child_id, check_in, symptom, photo_url, note, account_id)
                            VALUES (:child_id, :check_in, :symptom, :photo_url, :note, 1)
                        """), {
                            "child_id": child_id,
                            "check_in": day3_timestamp + timedelta(hours=15),
                            "symptom": "Low temperature",
                            "photo_url": "https://example.com/photo5.jpg",
                            "note": f"Temperature 37.5°C - {child_name}"
                        })
                    
                    else:  # PANG (id=2) - Completely normal data
                        for day_num in range(1, 4):  # Days 1, 2, 3
                            day_timestamp = generate_timestamp_for_day(4 - day_num)
                            
                            # Meals - Excellent appetite (95-100%)
                            meal_times_normal = [
                                (1, 1, 8),  # Breakfast at 8am
                                (2, 2, 13), # Lunch at 1pm  
                                (3, 3, 18)  # Dinner at 6pm
                            ]
                            for meal_time, meal_cat, hour in meal_times_normal:
                                consumption = random.uniform(95, 100)
                                meal_timestamp = day_timestamp.replace(hour=hour, minute=random.randint(0, 30))
                                conn.execute(text("""
                                    INSERT INTO meal (child_id, check_in, consumption_level, meal_time_category, meal_category, note, account_id)
                                    VALUES (:child_id, :check_in, :consumption, :meal_time, :meal_cat, :note, 1)
                                """), {
                                    "child_id": child_id,
                                    "check_in": meal_timestamp,
                                    "consumption": consumption,
                                    "meal_time": meal_time,
                                    "meal_cat": meal_cat,
                                    "note": f"Excellent appetite - {child_name}"
                                })
                            
                            # Sleep - Great sleep (10-11 hours)
                            sleep_start = day_timestamp.replace(hour=19, minute=0)  # 7:00 PM
                            sleep_end = sleep_start + timedelta(hours=10, minutes=random.randint(30, 60))
                            conn.execute(text("""
                                INSERT INTO sleep_time (child_id, check_in, start_time, end_time, note, account_id)
                                VALUES (:child_id, :check_in, :start_time, :end_time, :note, 1)
                            """), {
                                "child_id": child_id,
                                "check_in": day_timestamp,
                                "start_time": sleep_start,
                                "end_time": sleep_end,
                                "note": f"Great sleep - {child_name}"
                            })
                            
                            # Normal poop
                            conn.execute(text("""
                                INSERT INTO poop (child_id, check_in, texture, color, note, account_id)
                                VALUES (:child_id, :check_in, :texture, :color, :note, 1)
                            """), {
                                "child_id": child_id,
                                "check_in": day_timestamp + timedelta(hours=8),
                                "texture": 3,  # Normal texture
                                "color": 2,    # Normal color
                                "note": f"Normal consistency - {child_name}"
                            })
        
        return {
            "success": True,
            "message": f"Generated ear infection data for Pui Sim (id=1) and normal data for Pang (id=2) over {days} days",
            "children_affected": children,
            "days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating data: {str(e)}")

@router.delete("/clear-checkins")
async def clear_last_days_checkins(days: int = 3):
    """Clear all check-in data from the last N days"""
    
    try:
        with engine.connect() as conn:
            with conn.begin():
                gmt_plus_8 = timezone(timedelta(hours=8))
                cutoff_date = datetime.now(gmt_plus_8) - timedelta(days=days)
                
                # Delete from all check-in tables
                tables = ['growth', 'meal', 'sleep_time', 'symptom', 'poop']
                total_deleted = 0
                
                for table in tables:
                    result = conn.execute(text(f"DELETE FROM {table} WHERE check_in >= :cutoff_date"), 
                                        {"cutoff_date": cutoff_date})
                    deleted_count = result.rowcount
                    total_deleted += deleted_count
                    print(f"Deleted {deleted_count} records from {table}")
        
        return {
            "success": True,
            "message": f"Cleared {total_deleted} check-in records from the last {days} days",
            "days": days,
            "records_deleted": total_deleted
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing check-ins: {str(e)}")

@router.delete("/clear-chats")
async def clear_last_days_chats(days: int = 3):
    """Clear all chat data from the last N days"""
    
    try:
        with engine.connect() as conn:
            with conn.begin():
                gmt_plus_8 = timezone(timedelta(hours=8))
                cutoff_date = datetime.now(gmt_plus_8) - timedelta(days=days)
                
                # Get chat IDs from the last N days
                result = conn.execute(text("SELECT id FROM chatbot_chats WHERE created_at >= :cutoff_date"), 
                                    {"cutoff_date": cutoff_date})
                chat_ids = [row[0] for row in result.fetchall()]
                
                messages_deleted = chats_deleted = 0
                
                if chat_ids:
                    # Delete messages for these chats
                    placeholders = ','.join([f":chat_id_{i}" for i in range(len(chat_ids))])
                    chat_params = {f"chat_id_{i}": chat_id for i, chat_id in enumerate(chat_ids)}
                    
                    result = conn.execute(text(f"DELETE FROM chat_messages WHERE chat_id IN ({placeholders})"), 
                                        chat_params)
                    messages_deleted = result.rowcount
                    
                    # Delete the chats themselves
                    result = conn.execute(text(f"DELETE FROM chatbot_chats WHERE id IN ({placeholders})"), 
                                        chat_params)
                    chats_deleted = result.rowcount
        
        return {
            "success": True,
            "message": f"Cleared {chats_deleted} chats and {messages_deleted} messages from the last {days} days",
            "days": days,
            "chats_deleted": chats_deleted,
            "messages_deleted": messages_deleted
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chats: {str(e)}")