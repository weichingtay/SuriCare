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
                g.id,
                g.child_id,
                g.check_in,
                g.weight,
                g.height,
                g.head_circumference,
                g.note,
                g.account_id,
                COALESCE(a.name, 'Unknown') as account_name
            FROM growth g
            LEFT JOIN accounts a ON g.account_id = a.id
            WHERE g.child_id = {child_id} 
            AND g.check_in >= NOW() - INTERVAL '{days} DAY'
            ORDER BY g.check_in DESC
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
    
@router.get('/child/{child_id}/with-benchmarks')
def get_growth_with_benchmarks(child_id: int, days: Optional[int] = 30):
    """Get growth records with benchmark comparisons"""
    
    # Get the child's actual growth data (existing logic)
    with engine.connect() as conn, conn.begin():
        sql_text = f"""
            SELECT
                id, child_id, check_in, weight, height, head_circumference, note
            FROM growth
            WHERE child_id = {child_id} 
            AND check_in >= NOW() - INTERVAL '{days} DAY'
            ORDER BY check_in DESC
        """
        growth_data = pd.read_sql_query(sql_text, parse_dates=['check_in'], con=conn)
        
        if growth_data.empty:
            return []
        
        # Get child info for benchmark calculation
        child_sql = f"SELECT birth_date, gender FROM child WHERE id = {child_id}"
        child_info = pd.read_sql_query(child_sql, con=conn)
        
        if child_info.empty:
            raise HTTPException(status_code=404, detail=f"Child {child_id} not found")
        
        birth_date = child_info.iloc[0]['birth_date']
        gender = child_info.iloc[0]['gender']  # Assuming you have gender field
        
        # Convert timestamps
        growth_data['check_in'] = growth_data['check_in'].dt.tz_convert('Asia/Singapore')
        
        # Calculate age in months for each record and add benchmarks
        results = []
        for _, record in growth_data.iterrows():
            age_months = calculate_age_in_months(birth_date, record['check_in'])
            
            # Get benchmark values based on age and gender
            benchmark_weight = get_benchmark_weight(age_months, gender)
            benchmark_height = get_benchmark_height(age_months, gender)
            benchmark_hc = get_benchmark_head_circumference(age_months, gender)
            
            results.append({
                'id': record['id'],
                'child_id': record['child_id'],
                'check_in': record['check_in'],
                'actual_weight': record['weight'],
                'actual_height': record['height'],
                'actual_head_circumference': record['head_circumference'],
                'benchmark_weight': benchmark_weight,
                'benchmark_height': benchmark_height,
                'benchmark_head_circumference': benchmark_hc,
                'age_months': age_months,
                'note': record['note']
            })
        
        return results

def calculate_age_in_months(birth_date, check_date):
    """Calculate age in months between birth_date and check_date"""
    years = check_date.year - birth_date.year
    months = check_date.month - birth_date.month
    return years * 12 + months

def get_benchmark_weight(age_months, gender):
    """Get benchmark weight for age and gender (implement your benchmark logic)"""
    # Example benchmark data - replace with your actual benchmark tables/API
    if gender.lower() == 'male':
        # Sample male benchmark weights by month (kg)
        male_benchmarks = {
            0: 3.3, 1: 4.5, 2: 5.6, 3: 6.4, 6: 7.9, 12: 9.6, 24: 12.2, 36: 14.3
        }
        return male_benchmarks.get(age_months, interpolate_benchmark(age_months, male_benchmarks))
    else:
        # Sample female benchmark weights by month (kg)
        female_benchmarks = {
            0: 3.2, 1: 4.2, 2: 5.1, 3: 5.8, 6: 7.3, 12: 9.0, 24: 11.5, 36: 13.9
        }
        return female_benchmarks.get(age_months, interpolate_benchmark(age_months, female_benchmarks))

def get_benchmark_height(age_months, gender):
    """Get benchmark height for age and gender"""
    if gender.lower() == 'male':
        male_benchmarks = {
            0: 49.9, 1: 54.7, 2: 58.4, 3: 61.4, 6: 67.6, 12: 75.7, 24: 87.1, 36: 95.1
        }
        return male_benchmarks.get(age_months, interpolate_benchmark(age_months, male_benchmarks))
    else:
        female_benchmarks = {
            0: 49.1, 1: 53.7, 2: 57.1, 3: 59.8, 6: 65.7, 12: 74.0, 24: 85.7, 36: 94.1
        }
        return female_benchmarks.get(age_months, interpolate_benchmark(age_months, female_benchmarks))

def get_benchmark_head_circumference(age_months, gender):
    """Get benchmark head circumference for age and gender"""
    if gender.lower() == 'male':
        male_benchmarks = {
            0: 34.5, 1: 37.3, 2: 39.1, 3: 40.5, 6: 43.3, 12: 46.1, 24: 48.4, 36: 49.6
        }
        return male_benchmarks.get(age_months, interpolate_benchmark(age_months, male_benchmarks))
    else:
        female_benchmarks = {
            0: 33.9, 1: 36.5, 2: 38.3, 3: 39.5, 6: 42.2, 12: 45.0, 24: 47.2, 36: 48.1
        }
        return female_benchmarks.get(age_months, interpolate_benchmark(age_months, female_benchmarks))

def interpolate_benchmark(age_months, benchmarks):
    """Linear interpolation for ages between benchmark points"""
    ages = sorted(benchmarks.keys())
    
    if age_months <= ages[0]:
        return benchmarks[ages[0]]
    if age_months >= ages[-1]:
        return benchmarks[ages[-1]]
    
    # Find surrounding ages for interpolation
    for i in range(len(ages) - 1):
        if ages[i] <= age_months <= ages[i + 1]:
            # Linear interpolation
            x1, y1 = ages[i], benchmarks[ages[i]]
            x2, y2 = ages[i + 1], benchmarks[ages[i + 1]]
            return y1 + (y2 - y1) * (age_months - x1) / (x2 - x1)
    
    return benchmarks[ages[0]]  # Fallback