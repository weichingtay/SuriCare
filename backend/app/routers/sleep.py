from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Sleep_Time
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

router = APIRouter(
    prefix="/sleep",
    tags=["sleep"],
)

@router.get('/{sleep_id}', response_model=Sleep_Time)
def get_sleep(*, session: Session = Depends(get_session), sleep_id: int):
    """Get a specific sleep record"""
    sleep = session.get(Sleep_Time, sleep_id)
    if not sleep:
        raise HTTPException(status_code=404, detail=f"Sleep ID #{sleep_id} not found")
    return sleep

@router.get('/child/{child_id}', response_model=List[Sleep_Time])
def get_sleep_by_child(child_id: int, days: Optional[int] = 30):
    """Get sleep records for a specific child within the last N days"""
    with engine.connect() as conn, conn.begin():
        sql_text = f"""
            SELECT
                s.id,
                s.child_id,
                s.check_in,
                s.start_time,
                s.end_time,
                s.note,
                s.account_id,
                COALESCE(a.name, 'Unknown') as account_name
            FROM sleep_time s
            LEFT JOIN accounts a ON s.account_id = a.id
            WHERE s.child_id = {child_id} 
            AND s.check_in >= NOW() - INTERVAL '{days} DAY'
            ORDER BY s.check_in DESC
        """
        sleep_data = pd.read_sql_query(sql_text, parse_dates=['check_in', 'start_time', 'end_time'], con=conn)
        
        if sleep_data.empty:
            return []
        
        # Convert timestamps to Asia/Singapore timezone
        sleep_data['check_in'] = sleep_data['check_in'].dt.tz_convert('Asia/Singapore')
        sleep_data['start_time'] = sleep_data['start_time'].dt.tz_convert('Asia/Singapore')
        sleep_data['end_time'] = sleep_data['end_time'].dt.tz_convert('Asia/Singapore')

    return [Sleep_Time(**sleep) for sleep in sleep_data.to_dict(orient='records')]

@router.get('/child/{child_id}/latest', response_model=Optional[Sleep_Time])
def get_latest_sleep(*, session: Session = Depends(get_session), child_id: int):
    """Get the most recent sleep record for a specific child"""
    try:
        statement = select(Sleep_Time).where(Sleep_Time.child_id == child_id).order_by(Sleep_Time.check_in.desc()).limit(1)
        latest_sleep = session.exec(statement).first()
        
        if not latest_sleep:
            raise HTTPException(status_code=404, detail=f"No sleep data found for child {child_id}")
            
        return latest_sleep
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sleep data: {str(e)}")

@router.post('/', response_model=Sleep_Time)
def create_sleep(*, session: Session = Depends(get_session), sleep: Sleep_Time):
    """Create a new sleep record"""
    try:
        session.add(sleep)
        session.commit()
        session.refresh(sleep)
        return sleep
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create sleep: {str(e)}")

@router.put('/{sleep_id}', response_model=Sleep_Time)
def update_sleep(*, session: Session = Depends(get_session), sleep_id: int, sleep_update: Sleep_Time):
    """Update an existing sleep record"""
    try:
        sleep = session.get(Sleep_Time, sleep_id)
        if not sleep:
            raise HTTPException(status_code=404, detail=f"Sleep ID #{sleep_id} not found")
        
        # Update fields (exactly like meal router)
        sleep.check_in = sleep_update.check_in
        sleep.start_time = sleep_update.start_time
        sleep.end_time = sleep_update.end_time
        sleep.note = sleep_update.note
        sleep.child_id = sleep_update.child_id
        
        session.add(sleep)
        session.commit()
        session.refresh(sleep)
        return sleep
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update sleep: {str(e)}")

@router.delete('/{sleep_id}')
def delete_sleep(*, session: Session = Depends(get_session), sleep_id: int):
    """Delete a sleep record"""
    try:
        sleep = session.get(Sleep_Time, sleep_id)
        if not sleep:
            raise HTTPException(status_code=404, detail=f"Sleep ID #{sleep_id} not found")
        
        session.delete(sleep)
        session.commit()
        return {"message": f"Sleep ID #{sleep_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete sleep: {str(e)}")

# LEGACY ENDPOINTS (keeping for backward compatibility)
@router.get('/sleeptime/{child_id}')
def sleep_metrics(child_id: int):
    """Legacy endpoint for sleep metrics"""
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
    """Legacy endpoint for creating sleep records"""
    session.add(sleep)
    session.commit()
    session.refresh(sleep)
    return sleep