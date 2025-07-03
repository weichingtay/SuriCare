from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.db import engine, get_session
from app.models import Child, Growth, Sleep_Time, Meal, Poop, Symptom
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import json

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get('/dashboard/{user_id}')
def get_dashboard_summary(user_id: int):
    """Get comprehensive dashboard summary for a user"""
    with engine.connect() as conn, conn.begin():
        # Get user's children
        children_sql = f"""
                        SELECT id, name, birth_date, gender, carer_id
                        FROM child
                        WHERE carer_id = {user_id}
                    """
        children_data = pd.read_sql_query(children_sql, parse_dates=['birth_date'], con=conn)
        
        if children_data.empty:
            raise HTTPException(status_code=404, detail="No children found for this user")
        
        child_ids = children_data['id'].tolist()
        child_ids_str = ','.join(map(str, child_ids))
        
        # Get recent record counts (last 7 days)
        recent_counts_sql = f"""
                            SELECT 
                                'growth' as record_type, COUNT(*) as count
                            FROM growth 
                            WHERE child_id IN ({child_ids_str}) AND check_in >= NOW() - INTERVAL 7 DAY
                            UNION ALL
                            SELECT 
                                'sleep' as record_type, COUNT(*) as count
                            FROM sleep_time 
                            WHERE child_id IN ({child_ids_str}) AND check_in >= NOW() - INTERVAL 7 DAY
                            UNION ALL
                            SELECT 
                                'meals' as record_type, COUNT(*) as count
                            FROM meal 
                            WHERE child_id IN ({child_ids_str}) AND check_in >= NOW() - INTERVAL 7 DAY
                            UNION ALL
                            SELECT 
                                'symptoms' as record_type, COUNT(*) as count
                            FROM symptom 
                            WHERE child_id IN ({child_ids_str}) AND check_in >= NOW() - INTERVAL 7 DAY
                        """
        recent_counts = pd.read_sql_query(recent_counts_sql, con=conn)
        
        # Process counts
        counts_dict = dict(zip(recent_counts['record_type'], recent_counts['count']))
        
        # Generate alerts
        alerts = []
        if counts_dict.get('growth', 0) == 0:
            alerts.append("No growth measurements in 7 days")
        if counts_dict.get('symptoms', 0) > 0:
            alerts.append(f"{counts_dict.get('symptoms', 0)} symptoms recorded recently")
        
        # Calculate ages
        children_list = []
        for _, child in children_data.iterrows():
            age_months = int((datetime.now() - child['birth_date']).days / 30)
            children_list.append({
                "id": child['id'],
                "name": child['name'],
                "age_months": age_months
            })
        
        return {
            "child_count": len(children_data),
            "children": children_list,
            "recent_records": {
                "growth": counts_dict.get('growth', 0),
                "sleep": counts_dict.get('sleep', 0),
                "meals": counts_dict.get('meals', 0),
                "symptoms": counts_dict.get('symptoms', 0)
            },
            "alerts": alerts,
            "last_updated": datetime.now().isoformat()
        }

@router.get('/growth-trends/{child_id}')
def get_growth_trends(child_id: int, months: Optional[int] = 6):
    """Get growth trends for a specific child - matches your dashboard chart needs"""
    with engine.connect() as conn, conn.begin():
        sql_text_growth = f"""
                            SELECT 
                                check_in,
                                weight,
                                height,
                                head_circumference,
                                note
                            FROM growth
                            WHERE child_id = {child_id} AND
                                  check_in >= NOW() - INTERVAL '{months} MONTH'
                            ORDER BY check_in ASC
                        """
        growth_data = pd.read_sql_query(sql_text_growth, parse_dates=['check_in'], con=conn)
        
        if growth_data.empty:
            return {
                "dates": [],
                "weights": [],
                "heights": [],
                "head_circumferences": [],
                "message": "No growth data found for the specified period"
            }
        
        # Convert to Singapore timezone (matching your existing pattern)
        growth_data['check_in'] = growth_data['check_in'].dt.tz_convert('Asia/Singapore')
        
        return {
            "dates": growth_data['check_in'].dt.strftime('%Y-%m-%d').tolist(),
            "weights": growth_data['weight'].tolist(),
            "heights": growth_data['height'].tolist(),
            "head_circumferences": growth_data['head_circumference'].tolist(),
            "total_records": len(growth_data)
        }

@router.get('/sleeptime/{child_id}')
def sleep_analytics(child_id: int, days: Optional[int] = 30):
    """Enhanced sleep analytics - compatible with your existing sleep charts"""
    with engine.connect() as conn, conn.begin():
        sql_text_sleep = f"""
                            WITH date_range AS
                            (
                                SELECT
                                    MAX(check_in) - INTERVAL '{days} DAY' as start_date,
                                    MAX(check_in) as end_date
                                FROM sleep_time
                                WHERE child_id = {child_id}
                            )

                            SELECT
                                child_id,
                                check_in,
                                start_time,
                                end_time
                            FROM	sleep_time
                            WHERE	child_id = {child_id} AND 
                                    (check_in BETWEEN (SELECT start_date FROM date_range) AND
                                    (SELECT end_date FROM date_range))
                            ORDER BY	check_in DESC
                        """
        sleep_data = pd.read_sql_query(sql_text_sleep, parse_dates=['check_in', 'start_time', 'end_time'], con=conn)
        
        if sleep_data.empty:
            return json.loads(pd.DataFrame().to_json(orient='records'))
        
        # Convert to Singapore timezone (matching your existing sleep router)
        sleep_data['check_in'] = sleep_data['check_in'].dt.tz_convert('Asia/Singapore')
        sleep_data['start_time'] = sleep_data['start_time'].dt.tz_convert('Asia/Singapore')
        sleep_data['end_time'] = sleep_data['end_time'].dt.tz_convert('Asia/Singapore')
        
        # Calculate sleep duration
        sleep_data['sleep_hours'] = (sleep_data['end_time'] - sleep_data['start_time']).dt.total_seconds() / 3600
        
        # Basic analytics
        avg_sleep = sleep_data['sleep_hours'].mean()
        consistency = sleep_data['sleep_hours'].std() if len(sleep_data) > 1 else 0
        
        result = sleep_data.copy()
        result['analytics'] = {
            "average_sleep_hours": round(avg_sleep, 2) if not pd.isna(avg_sleep) else 0,
            "consistency": round(consistency, 2),
            "total_records": len(sleep_data)
        }
        
    return json.loads(result.to_json(orient='records'))

@router.get('/meal-analytics/{child_id}')
def get_meal_analytics(child_id: int, days: Optional[int] = 30):
    """Meal consumption analytics"""
    with engine.connect() as conn, conn.begin():
        sql_text_meal = f"""
                            SELECT 
                                m.check_in,
                                m.consumption_level,
                                m.meal_time_category,
                                m.meal_category,
                                mtc.time_category,
                                mc.category as meal_category_name
                            FROM meal m
                            JOIN meal_time_category mtc ON m.meal_time_category = mtc.id
                            JOIN meal_category mc ON m.meal_category = mc.id
                            WHERE m.child_id = {child_id} AND
                                  m.check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY m.check_in DESC
                        """
        meal_data = pd.read_sql_query(sql_text_meal, parse_dates=['check_in'], con=conn)
        
        if meal_data.empty:
            return {
                "total_meals": 0,
                "average_consumption": 0,
                "meal_frequency": 0,
                "consumption_trend": [],
                "meal_time_distribution": {},
                "message": "No meal data found for the specified period"
            }
        
        # Convert to Singapore timezone
        meal_data['check_in'] = meal_data['check_in'].dt.tz_convert('Asia/Singapore')
        
        # Calculate basic statistics
        total_meals = len(meal_data)
        average_consumption = meal_data['consumption_level'].mean()
        meal_frequency = total_meals / days
        
        # Group by meal time category
        meal_time_distribution = meal_data['time_category'].value_counts().to_dict()
        
        return {
            "total_meals": total_meals,
            "average_consumption": round(average_consumption, 2),
            "meal_frequency": round(meal_frequency, 2),
            "consumption_trend": meal_data['consumption_level'].tolist(),
            "meal_time_distribution": meal_time_distribution,
            "analysis_period_days": days
        }

@router.get('/poop-analytics/{child_id}')
def get_poop_analytics(child_id: int, days: Optional[int] = 30):
    """Poop frequency and pattern analytics"""
    with engine.connect() as conn, conn.begin():
        sql_text_poop = f"""
                            SELECT 
                                p.check_in,
                                pc.category as color_name,
                                pcon.category as consistency_name,
                                p.note
                            FROM poop p
                            JOIN poop_color pc ON p.color = pc.id
                            JOIN poop_consistency pcon ON p.consistency = pcon.id
                            WHERE p.child_id = {child_id} AND
                                  p.check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY p.check_in DESC
                        """
        poop_data = pd.read_sql_query(sql_text_poop, parse_dates=['check_in'], con=conn)
        
        if poop_data.empty:
            return {
                "total_count": 0,
                "daily_frequency": 0,
                "color_distribution": {},
                "consistency_distribution": {},
                "message": "No poop data found for the specified period"
            }
        
        # Convert to Singapore timezone
        poop_data['check_in'] = poop_data['check_in'].dt.tz_convert('Asia/Singapore')
        
        # Calculate statistics
        total_count = len(poop_data)
        daily_frequency = total_count / days
        
        # Distributions
        color_distribution = poop_data['color_name'].value_counts().to_dict()
        consistency_distribution = poop_data['consistency_name'].value_counts().to_dict()
        
        return {
            "total_count": total_count,
            "daily_frequency": round(daily_frequency, 2),
            "color_distribution": color_distribution,
            "consistency_distribution": consistency_distribution,
            "analysis_period_days": days
        }

@router.get('/symptom-analytics/{child_id}')
def get_symptom_analytics(child_id: int, days: Optional[int] = 30):
    """Symptom tracking analytics"""
    with engine.connect() as conn, conn.begin():
        sql_text_symptom = f"""
                            SELECT 
                                check_in,
                                symptom,
                                note
                            FROM symptom
                            WHERE child_id = {child_id} AND
                                  check_in >= NOW() - INTERVAL '{days} DAY'
                            ORDER BY check_in DESC
                        """
        symptom_data = pd.read_sql_query(sql_text_symptom, parse_dates=['check_in'], con=conn)
        
        if symptom_data.empty:
            return {
                "total_symptoms": 0,
                "symptom_breakdown": {},
                "recent_symptoms": [],
                "message": "No symptoms recorded for the specified period"
            }
        
        # Convert to Singapore timezone
        symptom_data['check_in'] = symptom_data['check_in'].dt.tz_convert('Asia/Singapore')
        
        # Calculate statistics
        total_symptoms = len(symptom_data)
        symptom_breakdown = symptom_data['symptom'].value_counts().to_dict()
        
        # Recent symptoms list
        recent_symptoms = []
        for _, row in symptom_data.head(5).iterrows():
            recent_symptoms.append({
                "date": row['check_in'].strftime('%Y-%m-%d'),
                "symptom": row['symptom'],
                "note": row['note']
            })
        
        return {
            "total_symptoms": total_symptoms,
            "symptom_breakdown": symptom_breakdown,
            "recent_symptoms": recent_symptoms,
            "analysis_period_days": days
        }

@router.get('/health-overview/{child_id}')
def get_health_overview(child_id: int, days: Optional[int] = 30):
    """Comprehensive health overview combining all data types"""
    with engine.connect() as conn, conn.begin():
        # Get child info
        child_sql = f"""
                    SELECT id, name, birth_date, gender
                    FROM child
                    WHERE id = {child_id}
                """
        child_data = pd.read_sql_query(child_sql, parse_dates=['birth_date'], con=conn)
        
        if child_data.empty:
            raise HTTPException(status_code=404, detail="Child not found")
        
        child_info = child_data.iloc[0]
        
        # Get latest growth
        latest_growth_sql = f"""
                            SELECT check_in, weight, height, head_circumference
                            FROM growth
                            WHERE child_id = {child_id}
                            ORDER BY check_in DESC
                            LIMIT 1
                        """
        latest_growth = pd.read_sql_query(latest_growth_sql, parse_dates=['check_in'], con=conn)
        
        # Get latest sleep
        latest_sleep_sql = f"""
                           SELECT check_in, start_time, end_time
                           FROM sleep_time
                           WHERE child_id = {child_id}
                           ORDER BY check_in DESC
                           LIMIT 1
                       """
        latest_sleep = pd.read_sql_query(latest_sleep_sql, parse_dates=['check_in', 'start_time', 'end_time'], con=conn)
        
        # Count recent activities
        recent_counts_sql = f"""
                            SELECT 
                                (SELECT COUNT(*) FROM symptom WHERE child_id = {child_id} AND check_in >= NOW() - INTERVAL {days} DAY) as symptoms,
                                (SELECT COUNT(*) FROM poop WHERE child_id = {child_id} AND check_in >= NOW() - INTERVAL {days} DAY) as poops
                        """
        recent_counts = pd.read_sql_query(recent_counts_sql, con=conn)
        
        # Calculate age
        age_months = int((datetime.now() - child_info['birth_date']).days / 30)
        
        # Process latest data
        growth_data = {}
        if not latest_growth.empty:
            latest_growth['check_in'] = latest_growth['check_in'].dt.tz_convert('Asia/Singapore')
            growth_data = {
                "weight": latest_growth.iloc[0]['weight'],
                "height": latest_growth.iloc[0]['height'],
                "head_circumference": latest_growth.iloc[0]['head_circumference'],
                "date": latest_growth.iloc[0]['check_in'].strftime('%Y-%m-%d')
            }
        
        sleep_data = {}
        if not latest_sleep.empty:
            latest_sleep['start_time'] = latest_sleep['start_time'].dt.tz_convert('Asia/Singapore')
            latest_sleep['end_time'] = latest_sleep['end_time'].dt.tz_convert('Asia/Singapore')
            sleep_hours = (latest_sleep.iloc[0]['end_time'] - latest_sleep.iloc[0]['start_time']).total_seconds() / 3600
            sleep_data = {
                "last_bedtime": latest_sleep.iloc[0]['start_time'].strftime('%Y-%m-%d %H:%M'),
                "last_wake_time": latest_sleep.iloc[0]['end_time'].strftime('%Y-%m-%d %H:%M'),
                "sleep_hours": round(sleep_hours, 2)
            }
        
        return {
            "child_info": {
                "id": int(child_info['id']),
                "name": child_info['name'],
                "age_months": age_months,
                "gender": child_info['gender']
            },
            "latest_measurements": {
                "growth": growth_data,
                "sleep": sleep_data
            },
            "recent_activity": {
                "symptoms_count": int(recent_counts.iloc[0]['symptoms']) if not recent_counts.empty else 0,
                "poops_count": int(recent_counts.iloc[0]['poops']) if not recent_counts.empty else 0,
                "period_days": days
            }
        }