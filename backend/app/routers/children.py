from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models import Child, Primary_Care_Giver
from typing import List

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

@router.get('/my-children/{user_email}', response_model=List[Child])
def get_my_children(*, session: Session = Depends(get_session), user_email: str):
    """Get all children for a specific user by email"""
    try:
        # Find the user by email
        user_statement = select(Primary_Care_Giver).where(Primary_Care_Giver.email == user_email)
        user = session.exec(user_statement).first()
        
        if not user:
            raise HTTPException(status_code=404, detail=f"User with email {user_email} not found")
        
        # Get all children for this user
        children_statement = select(Child).where(Child.carer_id == user.id)
        children = session.exec(children_statement).all()
        
        return list(children)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get children: {str(e)}")

@router.get('/my-children-by-auth/{auth_user_id}', response_model=List[Child])
def get_my_children_by_auth_id(*, session: Session = Depends(get_session), auth_user_id: str):
    """Get all children for a specific user by Supabase Auth user ID"""
    try:
        # Find the user by auth_user_id
        user_statement = select(Primary_Care_Giver).where(Primary_Care_Giver.auth_user_id == auth_user_id)
        user = session.exec(user_statement).first()
        
        if not user:
            raise HTTPException(status_code=404, detail=f"User with auth_user_id {auth_user_id} not found")
        
        # Get all children for this user
        children_statement = select(Child).where(Child.carer_id == user.id)
        children = session.exec(children_statement).all()
        
        return list(children)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get children: {str(e)}")

@router.post('/', response_model=Child)
def new_child(*, session: Session = Depends(get_session), child: Child):
    session.add(child)
    session.commit()
    session.refresh(child)
    return child
