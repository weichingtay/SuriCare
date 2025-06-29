from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import engine, get_session
from app.models import Sleep_Time
import pandas as pd
import json

router = APIRouter(
    tags=["sleep"],
)

@router.get('/sleeptime/{child_id}')
def sleep_metrics(child_id: int):
    with engine.connect() as conn, conn.begin():
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

    return json.loads(sleep.to_json(orient='records'))

@router.post('/sleeptime/', response_model=Sleep_Time)
def new_sleep(*, session: Session = Depends(get_session), sleep: Sleep_Time):
    session.add(sleep)
    session.commit()
    session.refresh(sleep)
    return sleep
