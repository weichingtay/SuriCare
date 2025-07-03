from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Symptom
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

router = APIRouter(
    prefix="/symptom",
    tags=["symptoms"],
)

@router.get('/{symptom_id}', response_model=Symptom)
def get_symptom(*, session: Session = Depends(get_session), symptom_id: int):
    """Get a specific symptom record"""
    symptom = session.get(Symptom, symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail=f"Symptom ID #{symptom_id} not found")
    return symptom

@router.get('/child/{child_id}', response_model=List[Symptom])
def get_symptoms_by_child(child_id: int, days: Optional[int] = 30):
    """Get all symptoms for a specific child (last 30 days by default)"""
    with engine.connect() as conn, conn.begin():
        sql_text_symptom = f"""
                            SELECT 
                                *
                            FROM symptom
                            WHERE child_id = {child_id} AND
                                  check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY check_in DESC
                        """
        symptoms = pd.read_sql_query(sql_text_symptom, parse_dates=['check_in'], con=conn)
        
        if symptoms.empty:
            return []
        
        # Convert to Singapore timezone
        symptoms['check_in'] = symptoms['check_in'].dt.tz_convert('Asia/Singapore')
        
    return json.loads(symptoms.to_json(orient='records'))

@router.get('/child/{child_id}/latest', response_model=Optional[Symptom])
def get_latest_symptom(*, session: Session = Depends(get_session), child_id: int):
    """Get the most recent symptom for a specific child"""
    try:
        statement = select(Symptom).where(Symptom.child_id == child_id).order_by(Symptom.check_in.desc()).limit(1)
        latest_symptom = session.exec(statement).first()
        
        if not latest_symptom:
            raise HTTPException(status_code=404, detail=f"No symptom data found for child {child_id}")
            
        return latest_symptom
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get symptom data: {str(e)}")

@router.get('/child/{child_id}/by-symptom/{symptom_name}', response_model=List[Symptom])
def get_symptoms_by_type(*, session: Session = Depends(get_session), child_id: int, symptom_name: str, days: Optional[int] = 30):
    """Get symptoms of a specific type for a child"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        statement = select(Symptom).where(
            Symptom.child_id == child_id,
            Symptom.symptom.ilike(f"%{symptom_name}%"),
            Symptom.check_in >= start_date,
            Symptom.check_in <= end_date
        ).order_by(Symptom.check_in.desc())
        
        symptoms = session.exec(statement).all()
        return list(symptoms)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get symptoms: {str(e)}")

@router.post('/', response_model=Symptom)
def create_symptom(*, session: Session = Depends(get_session), symptom: Symptom):
    """Create a new symptom record"""
    try:
        session.add(symptom)
        session.commit()
        session.refresh(symptom)
        return symptom
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create symptom: {str(e)}")

@router.put('/{symptom_id}', response_model=Symptom)
def update_symptom(*, session: Session = Depends(get_session), symptom_id: int, symptom_update: Symptom):
    """Update an existing symptom record"""
    try:
        symptom = session.get(Symptom, symptom_id)
        if not symptom:
            raise HTTPException(status_code=404, detail=f"Symptom ID #{symptom_id} not found")
        
        # Update fields
        symptom.check_in = symptom_update.check_in
        symptom.symptom = symptom_update.symptom
        symptom.photo_url = symptom_update.photo_url
        symptom.note = symptom_update.note
        
        session.add(symptom)
        session.commit()
        session.refresh(symptom)
        return symptom
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update symptom: {str(e)}")

@router.delete('/{symptom_id}')
def delete_symptom(*, session: Session = Depends(get_session), symptom_id: int):
    """Delete a symptom record"""
    try:
        symptom = session.get(Symptom, symptom_id)
        if not symptom:
            raise HTTPException(status_code=404, detail=f"Symptom ID #{symptom_id} not found")
        
        session.delete(symptom)
        session.commit()
        return {"message": f"Symptom ID #{symptom_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete symptom: {str(e)}")

@router.get('/child/{child_id}/summary')
def get_symptom_summary(child_id: int, days: Optional[int] = 30):
    """Get symptom summary/statistics for a child"""
    with engine.connect() as conn, conn.begin():
        sql_text_symptom = f"""
                            SELECT 
                                symptom,
                                COUNT(*) as count,
                                check_in
                            FROM symptom
                            WHERE child_id = {child_id} AND
                                  check_in >= NOW() - INTERVAL '{days} DAY'
                            GROUP BY symptom, check_in
                            ORDER BY check_in DESC
                        """
        symptoms = pd.read_sql_query(sql_text_symptom, parse_dates=['check_in'], con=conn)
        
        if symptoms.empty:
            return {
                "total_symptoms": 0,
                "symptom_breakdown": {},
                "date_range": {
                    "start": (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d'),
                    "end": datetime.now().strftime('%Y-%m-%d'),
                    "days": days
                }
            }
        
        # Convert to Singapore timezone
        symptoms['check_in'] = symptoms['check_in'].dt.tz_convert('Asia/Singapore')
        
        # Create summary statistics
        symptom_counts = symptoms.groupby('symptom')['count'].sum().to_dict()
        
        return {
            "total_symptoms": symptoms['count'].sum(),
            "symptom_breakdown": symptom_counts,
            "date_range": {
                "start": (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d'),
                "end": datetime.now().strftime('%Y-%m-%d'),
                "days": days
            }
        }