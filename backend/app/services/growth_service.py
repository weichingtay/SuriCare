from sqlmodel import Session, select
from app.models import Growth, Growth_Benchmark
from datetime import datetime, timedelta
from typing import Dict, List
import statistics

class GrowthService:
    """Service for growth data analysis"""
    
    def __init__(self, session: Session):
        self.session = session

    def get_growth_data(self, child_id: int, days_back: int = 90) -> Dict:
        """Get growth data with basic analysis"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        growth_records = self.session.exec(
            select(Growth)
            .where(Growth.child_id == child_id, Growth.check_in >= cutoff_date)
            .order_by(Growth.check_in.desc())
        ).all()
        
        if not growth_records:
            return {"status": "no_data"}
        
        latest = growth_records[0]
        
        return {
            "status": "available",
            "latest": {
                "weight": latest.weight,
                "height": latest.height,
                "head_circumference": latest.head_circumference,
                "date": latest.check_in.isoformat(),
                "note": latest.note
            },
            "records_count": len(growth_records),
            "trend": self.calculate_growth_trend(growth_records) if len(growth_records) > 1 else "insufficient_data"
        }

    def calculate_growth_trend(self, records: List) -> str:
        """Calculate basic growth trend"""
        if len(records) < 2:
            return "insufficient_data"
        
        sorted_records = sorted(records, key=lambda r: r.check_in)
        weight_diff = sorted_records[-1].weight - sorted_records[0].weight
        
        if weight_diff > 0.5:
            return "increasing"
        elif weight_diff < -0.5:
            return "decreasing"
        else:
            return "stable"

    def compare_with_benchmark(self, child_id: int, child_age_months: int) -> Dict:
        """Compare latest growth with benchmark"""
        latest_growth = self.session.exec(
            select(Growth)
            .where(Growth.child_id == child_id)
            .order_by(Growth.check_in.desc())
        ).first()
        
        if not latest_growth:
            return {"status": "no_data"}
        
        benchmark = self.session.exec(
            select(Growth_Benchmark)
            .where(Growth_Benchmark.age_month == child_age_months)
        ).first()
        
        if not benchmark:
            return {"status": "no_benchmark"}
        
        return {
            "status": "available",
            "weight_comparison": "above" if latest_growth.weight > benchmark.weight else "below",
            "height_comparison": "above" if latest_growth.height > benchmark.height else "below",
            "benchmark_weight": benchmark.weight,
            "benchmark_height": benchmark.height,
            "actual_weight": latest_growth.weight,
            "actual_height": latest_growth.height
        }