from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from db import get_session
from models import Child

router = APIRouter(
    prefix="/child-profile",
    tags=["children"],
)

@router.get('/{child_id}', response_model=Child)
def child_profile(*, session: Session = Depends(get_session), child_id: int):
    child = session.get(Child, child_id)
    if not child:
        raise HTTPException(status_code=404, detail=f"Child ID #{child_id} not found !!")
    return child

@router.post('/', response_model=Child)
def new_child(*, session: Session = Depends(get_session), child: Child):
    session.add(child)
    session.commit()
    session.refresh(child)
    return child
