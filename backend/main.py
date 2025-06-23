from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, desc
from db import engine, create_db_and_tables, get_session
from models import *


import pandas as pd
import numpy as np
import json


app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#create_db_and_tables()


# Retrieve user profile by ID
@app.get('/user-profile/{user_id}', response_model=Primary_Care_Giver)
def user_profile(*, user_id: int, session: Session = Depends(get_session)):
    user = session.get(Primary_Care_Giver, user_id)

    return user


# Create new user record
@app.post('/user-profile/', response_model=Primary_Care_Giver)
def new_user(*, session: Session = Depends(get_session), user: Primary_Care_Giver):
    session.add(user)
    session.commit()
    session.refresh(user)

    return user
    

# Retrieve child profile by ID
@app.get('/child-profile/{child_id}', response_model=Child)
def child_profile(*, session: Session = Depends(get_session), child_id: int):

    try:
        child = session.get(Child, child_id)
        return child
    except Exception:
        raise HTTPException(status_code=404, detail=f"Child ID #{child_id} not found !!")


# Create new child profile
@app.post('/child-profile/', response_model=Child)
def new_child(*, session: Session = Depends(get_session), child: Child):
    session.add(child)
    session.commit()
    session.refresh(child)

    return child


# Growth metrics: height & weight
@app.get('/growth/{child_id}')
def growth_metrics(child_id: int):

    with engine.connect() as conn, conn.begin():

        # Get data from child & growth tables
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

        # Calculate age based on the difference between check_in date and birth_date
        child['age'] = (child.check_in - child.birth_date) / np.timedelta64(30,'D')
        child['age'] = child['age'].astype(int)

        print('Child Metrics:\n')
        print(child.loc[0:5, ['name', 'birth_date', 'check_in', 'age', 'gender']])

        print("\n\n")

        # Get data from growthbenchmark table
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

        print('Growth Daily Check In:\n')
        print(metrics.loc[0:5,:])

        df = pd.merge(
            left=child,
            right=metrics,
            left_on=['gender', 'age'],
            right_on=['benchmark_gender', 'benchmark_age']
        )

        print('\n')
        print(df.loc[0:5, :])
        print('\n')

    return json.loads(df.to_json(orient='records'))


# Insert new record for height, weight and head circumference
@app.post('growth')
def new_growth(*, session: Session = Depends(get_session), growth: Growth):
    session.add(growth)
    session.commit()
    session.refresh(growth)

    return growth


# Sleep metric
@app.get('/sleeptime/{child_id}')
def sleep_metrics(child_id: int):

    with engine.connect() as conn, conn.begin():
        
        # Get sleep data for the last 30 days
        sql_text_sleep = f"""
                            WITH date_range AS
                            (
                                SELECT
                                    MAX(check_in) - INTERVAL '30 DAY' as start_date,
                                    MAX(check_in) as end_date
                                FROM sleep_time
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
        
        sleep = pd.read_sql_query(sql_text_sleep, con=conn)
        
        sleep['check_in'] = sleep['check_in'].dt.tz_convert('Asia/Singapore')
        sleep['start_time'] = sleep['start_time'].dt.tz_convert('Asia/Singapore')
        sleep['end_time'] = sleep['end_time'].dt.tz_convert('Asia/Singapore')

        print('\n')
        print('Sleep Record:\n')
        print(sleep)
        print('\n')

    return json.loads(sleep.to_json(orient='records'))


# Insert new sleep record
@app.post('/sleeptime/', response_model=Sleep_Time)
def new_sleep(*, session: Session = Depends(get_session), sleep: Sleep_Time):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)

    return sleep