from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, desc, text
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
                            where c.id = {child_id}
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
                                FROM   growthbenchmark 
                            """
        metrics = pd.read_sql_query(sql_text_metrics, conn)

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
@app.get('/sleeptime/{child_id}', response_model=list[SleepTime])
def sleep_metrics(*, session: Session = Depends(get_session), child_id: int):
    metrics = session.exec(
        select(SleepTime)
        .where(child_id==child_id)
        .order_by(desc(SleepTime.check_in))
        .limit(30)
    ).all()

    return metrics


# Insert new sleep record
@app.post('/sleeptime/')
def new_sleep(*, session: Session = Depends(get_session), sleep: SleepTime):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)

    return sleep