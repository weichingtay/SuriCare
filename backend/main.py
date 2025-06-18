from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, desc, text
from db import engine, create_db_and_tables, get_session
from models import *
from pydantic import BaseModel
from chatbot.app.model import generate_reply

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
                                FROM   growthbenchmark 
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
                                FROM sleeptime
                            )

                            SELECT
                                child_id,
                                check_in,
                                start_time,
                                end_time
                            FROM	sleeptime
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
@app.post('/sleeptime/')
def new_sleep(*, session: Session = Depends(get_session), sleep: SleepTime):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)
    return sleep


# Chatbot Gemini endpoint

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.post('/chat/', response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """Relay the user's message to the Gemini model and return its reply."""
    try:
        reply_text = generate_reply(payload.message)
        return ChatResponse(reply=reply_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
