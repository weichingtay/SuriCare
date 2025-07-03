from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine, get_session
from app.models import Growth, Growth_Benchmark
from typing import Optional
import pandas as pd
import numpy as np
import json

router = APIRouter(
    tags=["growth"],
)

@router.get('/growth/{child_id}')
def growth_metrics(child_id: int):
    with engine.connect() as conn, conn.begin():
        sql_text_child = f"""
                            SELECT 
                                c.name, 
                                c.gender,
                                c.birth_date,  
                                g.check_in, 
                                (g.check_in - c.birth_date) as age,
                                g.weight as actual_weight, 
                                g.height as actual_height, 
                                g.head_circumference as actual_head_circumference
                            FROM child as c
                            JOIN growth as g    ON c.id = g.child_id
                            WHERE c.id = {child_id}
                            ORDER BY    g.check_in DESC
                            LIMIT   30
                        """
        child = pd.read_sql_query(sql_text_child, parse_dates=['birth_date', 'check_in'], con=conn)
        child['age'] = (child.check_in - child.birth_date) / np.timedelta64(30,'D')
        child['age'] = child['age'].astype(int)

        sql_text_metrics = f"""
                                SELECT
                                    gender as benchmark_gender,
                                    age_month as benchmark_age,
                                    weight as benchmark_weight,
                                    height as benchmark_height,
                                    head_circumference as benchmark_head_circumference
                                FROM   growth_benchmark 
                            """
        metrics = pd.read_sql_query(sql_text_metrics, conn)

        df = pd.merge(
            left=child,
            right=metrics,
            left_on=['gender', 'age'],
            right_on=['benchmark_gender', 'benchmark_age']
        )

    return json.loads(df.to_json(orient='records'))

@router.get('/growth/latest/{child_id}', response_model=Optional[Growth])
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

@router.post('/growth', response_model=Growth)
def new_growth(*, session: Session = Depends(get_session), growth: Growth):
    session.add(growth)
    session.commit()
    session.refresh(growth)
    return growth

# Growth benchmarks endpoints (moved from reference router)
@router.get('/growth/benchmarks')
def get_growth_benchmarks(gender: Optional[str] = None, age_month: Optional[int] = None):
    """Get growth benchmarks, optionally filtered by gender and/or age"""
    with engine.connect() as conn, conn.begin():
        sql_conditions = []
        if gender:
            sql_conditions.append(f"gender = '{gender}'")
        if age_month is not None:
            sql_conditions.append(f"age_month = {age_month}")
        
        where_clause = " AND ".join(sql_conditions) if sql_conditions else "1=1"
        
        sql_text = f"""
                    SELECT *
                    FROM growth_benchmark
                    WHERE {where_clause}
                    ORDER BY age_month ASC
                """
        benchmarks = pd.read_sql_query(sql_text, con=conn)
        
        if benchmarks.empty:
            return []
        
    return json.loads(benchmarks.to_json(orient='records'))

@router.get('/growth/benchmarks/{gender}/{age_month}')
def get_growth_benchmark_specific(gender: str, age_month: int):
    """Get specific growth benchmark for gender and age"""
    with engine.connect() as conn, conn.begin():
        sql_text = f"""
                    SELECT *
                    FROM growth_benchmark
                    WHERE gender = '{gender}' AND age_month = {age_month}
                """
        benchmark = pd.read_sql_query(sql_text, con=conn)
        
        if benchmark.empty:
            raise HTTPException(status_code=404, detail=f"Growth benchmark not found for {gender} at {age_month} months")
        
    return json.loads(benchmark.to_json(orient='records'))[0]