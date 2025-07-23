from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from app.db import get_session
from app.models import Health_Alerts, Child
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from typing import List, Dict, Any, Optional

router = APIRouter(
    prefix="/health-alerts",
    tags=["health-alerts"],
)

class HealthAlertCreate(BaseModel):
    child_id: int
    alert_type: str
    title: str
    description: str
    severity: str  # 'error', 'warning', 'info'
    suggestions: List[Dict[str, Any]]
    analysis_date: date
    data_period_start: date
    data_period_end: date

class HealthAlertResponse(BaseModel):
    id: UUID
    child_id: int
    alert_type: str
    title: str
    description: str
    severity: str
    suggestions: List[Dict[str, Any]]
    analysis_date: date
    created_at: datetime
    is_read: bool
    read_at: Optional[datetime]

class MarkReadRequest(BaseModel):
    is_read: bool

@router.get('/timeline/{child_id}', response_model=List[HealthAlertResponse])
def get_alert_timeline(*, session: Session = Depends(get_session), child_id: int):
    """Get all alerts for a child in chronological order (timeline)"""
    try:
        child = session.get(Child, child_id)
        if not child:
            raise HTTPException(status_code=404, detail=f"Child ID #{child_id} not found")
        
        alerts_statement = select(Health_Alerts).where(
            Health_Alerts.child_id == child_id,
            Health_Alerts.is_deleted == False
        ).order_by(desc(Health_Alerts.created_at))
        
        alerts = session.exec(alerts_statement).all()
        
        return [HealthAlertResponse(
            id=alert.id,
            child_id=alert.child_id,
            alert_type=alert.alert_type,
            title=alert.title,
            description=alert.description,
            severity=alert.severity,
            suggestions=alert.suggestions,
            analysis_date=alert.analysis_date,
            created_at=alert.created_at,
            is_read=alert.is_read,
            read_at=alert.read_at
        ) for alert in alerts]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alert timeline: {str(e)}")

@router.get('/unread-count/{child_id}')
def get_unread_count(*, session: Session = Depends(get_session), child_id: int):
    """Get count of unread alerts for a child"""
    try:
        child = session.get(Child, child_id)
        if not child:
            raise HTTPException(status_code=404, detail=f"Child ID #{child_id} not found")
        
        unread_statement = select(Health_Alerts).where(
            Health_Alerts.child_id == child_id,
            Health_Alerts.is_read == False,
            Health_Alerts.is_deleted == False
        )
        
        unread_alerts = session.exec(unread_statement).all()
        count = len(unread_alerts)
        
        return {"child_id": child_id, "unread_count": count}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get unread count: {str(e)}")

@router.post('/', response_model=HealthAlertResponse)
def create_alert(*, session: Session = Depends(get_session), alert_data: HealthAlertCreate):
    """Create or update an alert (upsert based on child_id, alert_type, analysis_date)"""
    try:
        child = session.get(Child, alert_data.child_id)
        if not child:
            raise HTTPException(status_code=404, detail=f"Child ID #{alert_data.child_id} not found")
        
        # Check if alert already exists
        existing_alert_statement = select(Health_Alerts).where(
            Health_Alerts.child_id == alert_data.child_id,
            Health_Alerts.alert_type == alert_data.alert_type,
            Health_Alerts.analysis_date == alert_data.analysis_date
        )
        
        existing_alert = session.exec(existing_alert_statement).first()
        
        if existing_alert:
            # Update existing alert
            existing_alert.title = alert_data.title
            existing_alert.description = alert_data.description
            existing_alert.severity = alert_data.severity
            existing_alert.suggestions = alert_data.suggestions
            existing_alert.data_period_start = alert_data.data_period_start
            existing_alert.data_period_end = alert_data.data_period_end
            
            session.add(existing_alert)
            session.commit()
            session.refresh(existing_alert)
            alert = existing_alert
        else:
            # Create new alert
            alert = Health_Alerts(
                child_id=alert_data.child_id,
                alert_type=alert_data.alert_type,
                title=alert_data.title,
                description=alert_data.description,
                severity=alert_data.severity,
                suggestions=alert_data.suggestions,
                analysis_date=alert_data.analysis_date,
                data_period_start=alert_data.data_period_start,
                data_period_end=alert_data.data_period_end,
                created_at=datetime.now(),
                is_read=False
            )
            
            session.add(alert)
            session.commit()
            session.refresh(alert)
        
        return HealthAlertResponse(
            id=alert.id,
            child_id=alert.child_id,
            alert_type=alert.alert_type,
            title=alert.title,
            description=alert.description,
            severity=alert.severity,
            suggestions=alert.suggestions,
            analysis_date=alert.analysis_date,
            created_at=alert.created_at,
            is_read=alert.is_read,
            read_at=alert.read_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create/update alert: {str(e)}")

@router.put('/{alert_id}/read', response_model=HealthAlertResponse)
def mark_alert_read_status(*, session: Session = Depends(get_session), alert_id: UUID, read_data: MarkReadRequest):
    """Mark an alert as read or unread"""
    try:
        alert = session.get(Health_Alerts, alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        alert.is_read = read_data.is_read
        alert.read_at = datetime.now() if read_data.is_read else None
        
        session.add(alert)
        session.commit()
        session.refresh(alert)
        
        return HealthAlertResponse(
            id=alert.id,
            child_id=alert.child_id,
            alert_type=alert.alert_type,
            title=alert.title,
            description=alert.description,
            severity=alert.severity,
            suggestions=alert.suggestions,
            analysis_date=alert.analysis_date,
            created_at=alert.created_at,
            is_read=alert.is_read,
            read_at=alert.read_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update alert read status: {str(e)}")
    

@router.delete('/{alert_id}')
def delete_alert(*, session: Session = Depends(get_session), alert_id: UUID):
    """Soft delete an alert (when user clicks X)"""
    try:
        alert = session.get(Health_Alerts, alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
        
        # Soft delete - mark as deleted but keep in database
        alert.is_deleted = True
        alert.deleted_at = datetime.now()
        
        session.add(alert)
        session.commit()
        
        return {"message": "Alert deleted successfully", "alert_id": str(alert_id)}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")