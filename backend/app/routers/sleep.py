from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db import engine, get_session
from app.models import Sleep_Time
import pandas as pd
import json

router = APIRouter(
    tags=["sleep"],
)

@router.get('/sleeptime/{child_id}')
def sleep_metrics(child_id: int):
    with engine.connect() as conn, conn.begin():
        sql_text_sleep = f"""
                            WITH date_range AS
                            (
                                SELECT
                                    MAX(check_in) - INTERVAL '30 DAY' as start_date,
                                    MAX(check_in) as end_date
                                FROM sleep_time
                            )

                            SELECT
                                child_id,
                                check_in,
                                start_time,
                                end_time
                            FROM	sleep_time
                            WHERE	child_id = {child_id} AND 
                                    (check_in BETWEEN (SELECT start_date FROM date_range) AND
                                    (SELECT end_date FROM date_range))
                            ORDER BY	check_in DESC
                        """
        sleep = pd.read_sql_query(sql_text_sleep, con=conn)
        sleep['check_in'] = sleep['check_in'].dt.tz_convert('Asia/Singapore')
        sleep['start_time'] = sleep['start_time'].dt.tz_convert('Asia/Singapore')
        sleep['end_time'] = sleep['end_time'].dt.tz_convert('Asia/Singapore')

    return json.loads(sleep.to_json(orient='records'))

@router.post('/sleeptime/', response_model=Sleep_Time)
def new_sleep(*, session: Session = Depends(get_session), sleep: Sleep_Time):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)
    return sleep

# NEW ENDPOINTS FOR CHECKIN HISTORY

@router.get('/sleep/child/{child_id}')
def get_sleep_by_child(child_id: int, days: int = 30):
    """Get sleep records for a specific child within the last N days"""
    with engine.connect() as conn, conn.begin():
        sql_text = f"""
            SELECT
                id,
                child_id,
                check_in,
                start_time,
                end_time,
                note
            FROM sleep_time
            WHERE child_id = {child_id} 
            AND check_in >= NOW() - INTERVAL '{days} DAY'
            ORDER BY check_in DESC
        """
        sleep_data = pd.read_sql_query(sql_text, con=conn)
        
        # Convert timestamps to Asia/Singapore timezone
        if not sleep_data.empty:
            sleep_data['check_in'] = sleep_data['check_in'].dt.tz_convert('Asia/Singapore')
            sleep_data['start_time'] = sleep_data['start_time'].dt.tz_convert('Asia/Singapore')
            sleep_data['end_time'] = sleep_data['end_time'].dt.tz_convert('Asia/Singapore')

    return json.loads(sleep_data.to_json(orient='records'))

@router.get('/sleep/{sleep_id}')
def get_sleep_by_id(sleep_id: int, session: Session = Depends(get_session)):
    """Get a specific sleep record by ID"""
    sleep_record = session.get(Sleep_Time, sleep_id)
    if not sleep_record:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    return sleep_record

@router.put('/sleep/{sleep_id}')
def update_sleep(sleep_id: int, sleep_update: Sleep_Time, session: Session = Depends(get_session)):
    """Update a specific sleep record"""
    # Get the existing record
    existing_sleep = session.get(Sleep_Time, sleep_id)
    if not existing_sleep:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    
    # Update the fields
    existing_sleep.child_id = sleep_update.child_id
    existing_sleep.start_time = sleep_update.start_time
    existing_sleep.end_time = sleep_update.end_time
    existing_sleep.note = sleep_update.note
    existing_sleep.check_in = sleep_update.check_in
    
    session.commit()
    session.refresh(existing_sleep)
    return existing_sleep

@router.delete('/sleep/{sleep_id}')
def delete_sleep(sleep_id: int, session: Session = Depends(get_session)):
    """Delete a specific sleep record"""
    sleep_record = session.get(Sleep_Time, sleep_id)
    if not sleep_record:
        raise HTTPException(status_code=404, detail="Sleep record not found")
    
    session.delete(sleep_record)
    session.commit()
    return {"message": f"Sleep record {sleep_id} deleted successfully"}