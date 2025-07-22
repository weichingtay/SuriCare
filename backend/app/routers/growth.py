from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Growth
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

router = APIRouter(
    prefix="/growth",
    tags=["growth"],
)

@router.get('/{growth_id}', response_model=Growth)
def get_growth(*, session: Session = Depends(get_session), growth_id: int):
    """Get a specific growth record"""
    growth = session.get(Growth, growth_id)
    if not growth:
        raise HTTPException(status_code=404, detail=f"Growth ID #{growth_id} not found")
    return growth

@router.get('/child/{child_id}', response_model=List[Growth])
def get_growth_by_child(child_id: int, days: Optional[int] = 30):
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
        growth_data = pd.read_sql_query(sql_text, parse_dates=['check_in'], con=conn)
        
        if growth_data.empty:
            return []
        
        # Convert timestamps to Asia/Singapore timezone
        growth_data['check_in'] = growth_data['check_in'].dt.tz_convert('Asia/Singapore')

    return [Growth(**growth) for growth in growth_data.to_dict(orient='records')]

@router.get('/child/{child_id}/latest', response_model=Optional[Growth])
def get_latest_growth(*, session: Session = Depends(get_session), child_id: int):
    """Get the most recent growth record for a specific child"""
    try:
        statement = select(Growth).where(Growth.child_id == child_id).order_by(Growth.check_in.desc()).limit(1)
        latest_growth = session.exec(statement).first()
        
        if not latest_growth:
            raise HTTPException(status_code=404, detail=f"No growth data found for child {child_id}")
            
        return latest_growth
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get growth data: {str(e)}")

@router.post('/', response_model=Growth)
def create_growth(*, session: Session = Depends(get_session), growth: Growth):
    """Create a new growth record"""
    try:
        session.add(growth)
        session.commit()
        session.refresh(growth)
        return growth
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create growth: {str(e)}")

@router.put('/{growth_id}', response_model=Growth)
def update_growth(*, session: Session = Depends(get_session), growth_id: int, growth_update: Growth):
    """Update an existing growth record"""
    try:
        growth = session.get(Growth, growth_id)
        if not growth:
            raise HTTPException(status_code=404, detail=f"Growth ID #{growth_id} not found")
        
        # Update fields (exactly like meal router)
        growth.check_in = growth_update.check_in
        growth.weight = growth_update.weight
        growth.height = growth_update.height
        growth.head_circumference = growth_update.head_circumference
        growth.note = growth_update.note
        growth.child_id = growth_update.child_id
        
        session.add(growth)
        session.commit()
        session.refresh(growth)
        return growth
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update growth: {str(e)}")

@router.delete('/{growth_id}')
def delete_growth(*, session: Session = Depends(get_session), growth_id: int):
    """Delete a growth record"""
    try:
        growth = session.get(Growth, growth_id)
        if not growth:
            raise HTTPException(status_code=404, detail=f"Growth ID #{growth_id} not found")
        
        session.delete(growth)
        session.commit()
        return {"message": f"Growth ID #{growth_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete growth: {str(e)}")