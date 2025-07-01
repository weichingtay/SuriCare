from sqlmodel import Session, select
from app.models import Child
from datetime import datetime
from typing import Dict, Optional

class ChildProfileService:
    """Service for basic child profile operations"""
    
    def __init__(self, session: Session):
        self.session = session

    def get_child_profile(self, child_id: int, carer_id: int) -> Optional[Dict]:
        """Get basic child profile information"""
        child = self.session.exec(
            select(Child).where(Child.id == child_id, Child.carer_id == carer_id)
        ).first()
        
        if not child:
            return None
            
        age_months = self.calculate_age_months(child.birth_date)
        
        return {
            "id": child.id,
            "name": child.name,
            "age_months": age_months,
            "age_years": round(age_months / 12, 1),
            "gender": child.gender,
            "birth_date": child.birth_date.isoformat(),
            "developmental_stage": self.get_developmental_stage(age_months)
        }

    def calculate_age_months(self, birth_date: datetime) -> int:
        """Calculate age in months"""
        today = datetime.now()
        months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
        return max(0, months)

    def get_developmental_stage(self, age_months: int) -> str:
        """Determine developmental stage based on age"""
        if age_months < 3:
            return "newborn"
        elif age_months < 12:
            return "infant"
        elif age_months < 24:
            return "toddler_early"
        elif age_months < 36:
            return "toddler_late"
        else:
            return "preschooler"