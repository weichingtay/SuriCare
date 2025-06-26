from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from db import get_session
from models import Primary_Care_Giver

router = APIRouter(
    prefix="/user-profile",
    tags=["users"],
)

@router.get('/{user_id}', response_model=Primary_Care_Giver)
def user_profile(*, user_id: int, session: Session = Depends(get_session)):
    user = session.get(Primary_Care_Giver, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post('/', response_model=Primary_Care_Giver)
def new_user(*, session: Session = Depends(get_session), user: Primary_Care_Giver):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
