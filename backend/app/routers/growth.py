from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Growth  # Adjust import based on your model name
import pandas as pd
import json
from datetime import datetime, timedelta

router = APIRouter(
    tags=["growth"],
)

@router.get('/growth/child/{child_id}')
def get_growth_by_child(child_id: int, days: int = 30):
    """Get growth records for a specific child within the last N days"""
    with engine.connect() as conn, conn.begin():
        sql_text = f"""
            SELECT
                id,
                child_id,
                check_in,
                weight,
                height,
                head_circumference,
                note
            FROM growth
            WHERE child_id = {child_id} 
            AND check_in >= NOW() - INTERVAL '{days} DAY'
            ORDER BY check_in DESC
        """
        growth_data = pd.read_sql_query(sql_text, con=conn)
        
        # Convert timestamps to Asia/Singapore timezone
        if not growth_data.empty:
            growth_data['check_in'] = growth_data['check_in'].dt.tz_convert('Asia/Singapore')

    return json.loads(growth_data.to_json(orient='records'))

@router.get('/growth/{growth_id}')
def get_growth_by_id(growth_id: int, session: Session = Depends(get_session)):
    """Get a specific growth record by ID"""
    growth_record = session.get(Growth, growth_id)
    if not growth_record:
        raise HTTPException(status_code=404, detail="Growth record not found")
    return growth_record

@router.put('/growth/{growth_id}')
def update_growth(growth_id: int, growth_update: Growth, session: Session = Depends(get_session)):
    """Update a specific growth record"""
    # Get the existing record
    existing_growth = session.get(Growth, growth_id)
    if not existing_growth:
        raise HTTPException(status_code=404, detail="Growth record not found")
    
    # Update the fields
    existing_growth.child_id = growth_update.child_id
    existing_growth.weight = growth_update.weight
    existing_growth.height = growth_update.height
    existing_growth.head_circumference = growth_update.head_circumference
    existing_growth.note = growth_update.note
    existing_growth.check_in = growth_update.check_in
    
    session.commit()
    session.refresh(existing_growth)
    return existing_growth

@router.delete('/growth/{growth_id}')
def delete_growth(growth_id: int, session: Session = Depends(get_session)):
    """Delete a specific growth record"""
    growth_record = session.get(Growth, growth_id)
    if not growth_record:
        raise HTTPException(status_code=404, detail="Growth record not found")
    
    session.delete(growth_record)
    session.commit()
    return {"message": f"Growth record {growth_id} deleted successfully"}

@router.post('/growth/', response_model=Growth)
def new_growth(*, session: Session = Depends(get_session), growth: Growth):
    """Create a new growth record"""
    session.add(growth)
    session.commit()
    session.refresh(growth)
    return growth