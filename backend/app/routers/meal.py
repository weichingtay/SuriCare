from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Meal, Meal_Category, Meal_Time_Category
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json

router = APIRouter(
    prefix="/meal",
    tags=["meals"],
)

@router.get('/{meal_id}', response_model=Meal)
def get_meal(*, session: Session = Depends(get_session), meal_id: int):
    """Get a specific meal record"""
    meal = session.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail=f"Meal ID #{meal_id} not found")
    return meal

@router.get('/child/{child_id}', response_model=List[Meal])
def get_meals_by_child(child_id: int, days: Optional[int] = 30):
    """Get all meals for a specific child (last 30 days by default)"""
    with engine.connect() as conn, conn.begin():
        sql_text_meal = f"""
                            SELECT 
                                m.*,
                                mtc.time_category,
                                mc.category as meal_category_name,
                                COALESCE(a.name, 'Unknown') as account_name
                            FROM meal m
                            JOIN meal_time_category mtc ON m.meal_time_category = mtc.id
                            JOIN meal_category mc ON m.meal_category = mc.id
                            LEFT JOIN accounts a ON m.account_id = a.id
                            WHERE m.child_id = {child_id} AND
                                  m.check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY m.check_in DESC
                        """
        meals = pd.read_sql_query(sql_text_meal, parse_dates=['check_in'], con=conn)
        
        if meals.empty:
            return []
        
        # Convert to Singapore timezone
        meals['check_in'] = meals['check_in'].dt.tz_convert('Asia/Singapore')
        
    return [Meal(**meal) for meal in meals.to_dict(orient='records')]

@router.get('/child/{child_id}/latest', response_model=Optional[Meal])
def get_latest_meal(*, session: Session = Depends(get_session), child_id: int):
    """Get the most recent meal for a specific child"""
    try:
        statement = select(Meal).where(Meal.child_id == child_id).order_by(Meal.check_in.desc()).limit(1)
        latest_meal = session.exec(statement).first()
        
        if not latest_meal:
            raise HTTPException(status_code=404, detail=f"No meal data found for child {child_id}")
            
        return latest_meal
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get meal data: {str(e)}")

@router.post('/', response_model=Meal)
def create_meal(*, session: Session = Depends(get_session), meal: Meal):
    """Create a new meal record"""
    try:
        session.add(meal)
        session.commit()
        session.refresh(meal)
        return meal
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create meal: {str(e)}")

@router.put('/{meal_id}', response_model=Meal)
def update_meal(*, session: Session = Depends(get_session), meal_id: int, meal_update: Meal):
    """Update an existing meal record"""
    try:
        meal = session.get(Meal, meal_id)
        if not meal:
            raise HTTPException(status_code=404, detail=f"Meal ID #{meal_id} not found")
        
        # Update fields
        meal.check_in = meal_update.check_in
        meal.consumption_level = meal_update.consumption_level
        meal.others = meal_update.others
        meal.note = meal_update.note
        meal.meal_time_category = meal_update.meal_time_category
        meal.meal_category = meal_update.meal_category
        
        session.add(meal)
        session.commit()
        session.refresh(meal)
        return meal
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update meal: {str(e)}")

@router.delete('/{meal_id}')
def delete_meal(*, session: Session = Depends(get_session), meal_id: int):
    """Delete a meal record"""
    try:
        meal = session.get(Meal, meal_id)
        if not meal:
            raise HTTPException(status_code=404, detail=f"Meal ID #{meal_id} not found")
        
        session.delete(meal)
        session.commit()
        return {"message": f"Meal ID #{meal_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete meal: {str(e)}")

# Meal Categories endpoints (moved from reference router)
@router.get('/categories', response_model=List[Meal_Category])
def get_meal_categories(*, session: Session = Depends(get_session)):
    """Get all meal categories"""
    categories = session.exec(select(Meal_Category)).all()
    return list(categories)

@router.get('/time-categories', response_model=List[Meal_Time_Category])
def get_meal_time_categories(*, session: Session = Depends(get_session)):
    """Get all meal time categories"""
    categories = session.exec(select(Meal_Time_Category)).all()
    return list(categories)

@router.post('/categories', response_model=Meal_Category)
def create_meal_category(*, session: Session = Depends(get_session), category: Meal_Category):
    """Create a new meal category"""
    try:
        session.add(category)
        session.commit()
        session.refresh(category)
        return category
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create meal category: {str(e)}")

@router.post('/time-categories', response_model=Meal_Time_Category)
def create_meal_time_category(*, session: Session = Depends(get_session), category: Meal_Time_Category):
    """Create a new meal time category"""
    try:
        session.add(category)
        session.commit()
        session.refresh(category)
        return category
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create meal time category: {str(e)}")