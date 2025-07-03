from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Poop, Poop_Color, Poop_Consistency
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

router = APIRouter(
    prefix="/poop",
    tags=["poop"],
)

@router.get('/{poop_id}', response_model=Poop)
def get_poop(*, session: Session = Depends(get_session), poop_id: int):
    """Get a specific poop record"""
    poop = session.get(Poop, poop_id)
    if not poop:
        raise HTTPException(status_code=404, detail=f"Poop ID #{poop_id} not found")
    return poop

@router.get('/child/{child_id}', response_model=List[Poop])
def get_poops_by_child(child_id: int, days: Optional[int] = 30):
    """Get all poop records for a specific child (last 30 days by default)"""
    with engine.connect() as conn, conn.begin():
        sql_text_poop = f"""
                            SELECT 
                                p.*,
                                pc.category as color_name,
                                pcon.category as consistency_name
                            FROM poop p
                            JOIN poop_color pc ON p.color = pc.id
                            JOIN poop_consistency pcon ON p.consistency = pcon.id
                            WHERE p.child_id = {child_id} AND
                                  p.check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY p.check_in DESC
                        """
        poops = pd.read_sql_query(sql_text_poop, parse_dates=['check_in'], con=conn)
        
        if poops.empty:
            return []
        
        # Convert to Singapore timezone
        poops['check_in'] = poops['check_in'].dt.tz_convert('Asia/Singapore')
        
    return json.loads(poops.to_json(orient='records'))

@router.get('/child/{child_id}/latest', response_model=Optional[Poop])
def get_latest_poop(*, session: Session = Depends(get_session), child_id: int):
    """Get the most recent poop record for a specific child"""
    try:
        statement = select(Poop).where(Poop.child_id == child_id).order_by(Poop.check_in.desc()).limit(1)
        latest_poop = session.exec(statement).first()
        
        if not latest_poop:
            raise HTTPException(status_code=404, detail=f"No poop data found for child {child_id}")
            
        return latest_poop
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get poop data: {str(e)}")

@router.post('/', response_model=Poop)
def create_poop(*, session: Session = Depends(get_session), poop: Poop):
    """Create a new poop record"""
    try:
        session.add(poop)
        session.commit()
        session.refresh(poop)
        return poop
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create poop record: {str(e)}")

@router.put('/{poop_id}', response_model=Poop)
def update_poop(*, session: Session = Depends(get_session), poop_id: int, poop_update: Poop):
    """Update an existing poop record"""
    try:
        poop = session.get(Poop, poop_id)
        if not poop:
            raise HTTPException(status_code=404, detail=f"Poop ID #{poop_id} not found")
        
        # Update fields
        poop.check_in = poop_update.check_in
        poop.note = poop_update.note
        poop.color = poop_update.color
        poop.consistency = poop_update.consistency
        
        session.add(poop)
        session.commit()
        session.refresh(poop)
        return poop
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update poop record: {str(e)}")

@router.delete('/{poop_id}')
def delete_poop(*, session: Session = Depends(get_session), poop_id: int):
    """Delete a poop record"""
    try:
        poop = session.get(Poop, poop_id)
        if not poop:
            raise HTTPException(status_code=404, detail=f"Poop ID #{poop_id} not found")
        
        session.delete(poop)
        session.commit()
        return {"message": f"Poop ID #{poop_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete poop record: {str(e)}")

# Poop reference data endpoints (moved from reference router)
@router.get('/colors', response_model=List[Poop_Color])
def get_poop_colors(*, session: Session = Depends(get_session)):
    """Get all poop color options"""
    colors = session.exec(select(Poop_Color)).all()
    return list(colors)

@router.get('/consistencies', response_model=List[Poop_Consistency])
def get_poop_consistencies(*, session: Session = Depends(get_session)):
    """Get all poop consistency options"""
    consistencies = session.exec(select(Poop_Consistency)).all()
    return list(consistencies)

@router.post('/colors', response_model=Poop_Color)
def create_poop_color(*, session: Session = Depends(get_session), color: Poop_Color):
    """Create a new poop color option"""
    try:
        session.add(color)
        session.commit()
        session.refresh(color)
        return color
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create poop color: {str(e)}")

@router.post('/consistencies', response_model=Poop_Consistency)
def create_poop_consistency(*, session: Session = Depends(get_session), consistency: Poop_Consistency):
    """Create a new poop consistency option"""
    try:
        session.add(consistency)
        session.commit()
        session.refresh(consistency)
        return consistency
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create poop consistency: {str(e)}")