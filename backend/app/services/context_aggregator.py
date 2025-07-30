from sqlmodel import Session
from .child_profile_service import ChildProfileService
from .growth_service import GrowthService
from .health_service import HealthService
from typing import Dict, Optional

class ChildContextAggregator:
    """Aggregates child data from multiple services for AI context"""
    
    def __init__(self, session: Session):
        self.session = session
        self.profile_service = ChildProfileService(session)
        self.growth_service = GrowthService(session)
        self.health_service = HealthService(session)

    def get_comprehensive_context(self, child_id: int, carer_id: int) -> Dict:
        """Get comprehensive child context for AI processing"""
        
        # Get child profile
        profile = self.profile_service.get_child_profile(child_id, carer_id)
        if not profile:
            return {"error": "Child not found"}
        
        # Gather all data
        context = {
            "profile": profile,
            "growth": self.growth_service.get_growth_data(child_id),
            "health": {
                "symptoms": self.health_service.get_recent_symptoms(child_id),
                "sleep": self.health_service.get_sleep_summary(child_id),
                "nutrition": self.health_service.get_nutrition_summary(child_id)
            }
        }
        
        # Add benchmark comparison if we have growth data
        if context["growth"]["status"] == "available":
            context["growth"]["benchmark"] = self.growth_service.compare_with_benchmark(
                child_id, profile["age_months"]
            )
        
        return context

    def get_context_for_chatbot(self, child_id: int, carer_id: int) -> str:
        """Get formatted context string for chatbot prompts"""
        context = self.get_comprehensive_context(child_id, carer_id)
        
        if "error" in context:
            return "No child context available."
        
        return self.format_context_for_prompt(context)

    def get_context_for_alerts(self, child_id: int, carer_id: int) -> Dict:
        """Get context optimized for smart alerts system"""
        context = self.get_comprehensive_context(child_id, carer_id)
        
        if "error" in context:
            return {"error": "Child not found"}
        
        # Extract alert-relevant information
        alert_context = {
            "child_name": context["profile"]["name"],
            "age_months": context["profile"]["age_months"],
            "developmental_stage": context["profile"]["developmental_stage"],
            "has_recent_symptoms": context["health"]["symptoms"]["status"] == "has_symptoms",
            "sleep_quality": context["health"]["sleep"].get("sleep_quality", "unknown"),
            "nutrition_status": context["health"]["nutrition"].get("nutrition_status", "unknown"),
            "growth_trend": context["growth"].get("trend", "unknown")
        }
        
        return alert_context

    def format_context_for_prompt(self, context: Dict) -> str:
        """Format context into readable string for AI prompts"""
        profile = context["profile"]
        
        # Format age in years and months for better readability
        age_months = profile['age_months']
        if age_months >= 12:
            years = age_months // 12
            remaining_months = age_months % 12
            if remaining_months == 0:
                age_display = f"{years} year{'s' if years != 1 else ''} old"
            else:
                age_display = f"{years} year{'s' if years != 1 else ''} and {remaining_months} month{'s' if remaining_months != 1 else ''} old"
        else:
            age_display = f"{age_months} month{'s' if age_months != 1 else ''} old"
        
        parts = [
            f"Child: {profile['name']}, {age_display} ({profile['developmental_stage']}), {profile['gender']}"
        ]
        
        # Growth information
        if context["growth"]["status"] == "available":
            growth = context["growth"]["latest"]
            parts.append(f"Recent Growth: {growth['weight']}kg, {growth['height']}cm")
            
            if "benchmark" in context["growth"] and context["growth"]["benchmark"]["status"] == "available":
                bench = context["growth"]["benchmark"]
                parts.append(f"Growth vs Benchmark: Weight {bench['weight_comparison']}, Height {bench['height_comparison']}")
        
        # Health information
        health = context["health"]
        
        if health["sleep"]["status"] == "available":
            sleep = health["sleep"]
            parts.append(f"Sleep: {sleep['average_sleep_hours']} hours average ({sleep['sleep_quality']})")
            if "recent_records" in sleep and sleep["recent_records"]:
                sleep_notes = [f"{record['duration_hours']}h - {record['note']}" for record in sleep["recent_records"][:3] if record.get('note')]
                if sleep_notes:
                    parts.append(f"Recent Sleep Notes: {'; '.join(sleep_notes)}")
        
        if health["nutrition"]["status"] == "available":
            nutrition = health["nutrition"]
            parts.append(f"Nutrition: {nutrition['average_consumption']}% consumption ({nutrition['nutrition_status']})")
            if "recent_meals" in nutrition and nutrition["recent_meals"]:
                meal_notes = [f"{record['consumption']}% - {record['note']}" for record in nutrition["recent_meals"][:3] if record.get('note')]
                if meal_notes:
                    parts.append(f"Recent Meal Notes: {'; '.join(meal_notes)}")
        
        if health["symptoms"]["status"] == "has_symptoms":
            symptoms = health["symptoms"]
            recent_symptoms = [s["symptom"] for s in symptoms["recent_symptoms"][:3]]
            parts.append(f"Recent Symptoms: {', '.join(recent_symptoms)}")
        
        return "\n".join(parts)