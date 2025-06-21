from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, desc, text
from db import create_db_and_tables, get_session
from models import *


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
@app.get('/growth/', response_model=list[Growth])
def growth_metrics(*, session: Session = Depends(get_session)):
    metrics = session.exec(
        select(Growth).order_by(desc(Growth.check_in)).limit(30)
    ).all()

    return metrics


# Insert new record for height, weight and head circumference
@app.post('growth')
def new_growth(*, session: Session = Depends(get_session), growth: Growth):
    session.add(growth)
    session.commit()
    session.refresh(growth)

    return growth


# Sleep metric
@app.get('/sleeptime/', response_model=list[SleepTime])
def sleep_metrics(*, session: Session = Depends(get_session)):
    metrics = session.exec(
        select(SleepTime).order_by(desc(SleepTime.check_in)).limit(30)
    ).all()

    # metrics = [{"date": row.check_in, "start_time": row.start_time, "end_time": row.end_time} for row in metrics]

    return metrics


# Insert new sleep record
@app.post('/sleeptime/')
def new_sleep(*, session: Session = Depends(get_session), sleep: SleepTime):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)

    return sleep