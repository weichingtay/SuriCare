from sqlmodel import Session, select
from app.models import Symptom, Sleep_Time, Meal
from datetime import datetime, timedelta
from typing import Dict, List
import statistics

class HealthService:
    """Service for health-related data analysis"""
    
    def __init__(self, session: Session):
        self.session = session

    def get_recent_symptoms(self, child_id: int, days_back: int = 30) -> Dict:
        """Get recent symptoms"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        symptoms = self.session.exec(
            select(Symptom)
            .where(Symptom.child_id == child_id, Symptom.check_in >= cutoff_date)
            .order_by(Symptom.check_in.desc())
        ).all()
        
        if not symptoms:
            return {"status": "no_symptoms"}
        
        return {
            "status": "has_symptoms",
            "count": len(symptoms),
            "recent_symptoms": [
                {
                    "symptom": s.symptom,
                    "date": s.check_in.isoformat(),
                    "note": s.note
                }
                for s in symptoms[:5]
            ]
        }

    def get_sleep_summary(self, child_id: int, days_back: int = 7) -> Dict:
        """Get sleep pattern summary"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        sleep_records = self.session.exec(
            select(Sleep_Time)
            .where(Sleep_Time.child_id == child_id, Sleep_Time.check_in >= cutoff_date)
        ).all()
        
        if not sleep_records:
            return {"status": "no_data"}
        
        # Calculate average sleep duration
        durations = []
        for record in sleep_records:
            if record.start_time and record.end_time:
                duration = (record.end_time - record.start_time).total_seconds() / 3600
                if 0 < duration < 24:  # Valid duration
                    durations.append(duration)
        
        if not durations:
            return {"status": "incomplete_data"}
        
        avg_sleep = statistics.mean(durations)
        
        return {
            "status": "available",
            "average_sleep_hours": round(avg_sleep, 1),
            "sleep_quality": "good" if avg_sleep > 8 else "needs_attention",
            "records_count": len(sleep_records)
        }

    def get_nutrition_summary(self, child_id: int, days_back: int = 7) -> Dict:
        """Get nutrition summary"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        meals = self.session.exec(
            select(Meal)
            .where(Meal.child_id == child_id, Meal.check_in >= cutoff_date)
        ).all()
        
        if not meals:
            return {"status": "no_data"}
        
        consumption_levels = [m.consumption_level for m in meals if m.consumption_level]
        
        if not consumption_levels:
            return {"status": "incomplete_data"}
        
        avg_consumption = statistics.mean(consumption_levels)
        
        return {
            "status": "available",
            "average_consumption": round(avg_consumption, 1),
            "nutrition_status": "good" if avg_consumption > 70 else "needs_attention",
            "meals_recorded": len(meals)
        }