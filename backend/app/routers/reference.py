from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models import (
    Access_Levels, 
    Gender_Options, 
    Relationship_Types
)
from typing import List

router = APIRouter(
    prefix="/reference",
    tags=["reference-data"],
)

# Access Levels
@router.get('/access-levels', response_model=List[Access_Levels])
def get_access_levels(*, session: Session = Depends(get_session)):
    """Get all access levels"""
    access_levels = session.exec(select(Access_Levels)).all()
    return list(access_levels)

# Gender Options
@router.get('/gender-options', response_model=List[Gender_Options])
def get_gender_options(*, session: Session = Depends(get_session)):
    """Get all gender options"""
    gender_options = session.exec(select(Gender_Options)).all()
    return list(gender_options)

# Relationship Types
@router.get('/relationship-types', response_model=List[Relationship_Types])
def get_relationship_types(*, session: Session = Depends(get_session)):
    """Get all relationship types"""
    relationship_types = session.exec(select(Relationship_Types)).all()
    return list(relationship_types)

# Combined endpoint for basic reference data
@router.get('/all')
def get_all_reference_data(*, session: Session = Depends(get_session)):
    """Get all basic reference data in a single response"""
    try:
        return {
            "access_levels": list(session.exec(select(Access_Levels)).all()),
            "gender_options": list(session.exec(select(Gender_Options)).all()),
            "relationship_types": list(session.exec(select(Relationship_Types)).all())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reference data: {str(e)}")

# Admin endpoints for managing basic reference data
@router.post('/access-levels', response_model=Access_Levels)
def create_access_level(*, session: Session = Depends(get_session), access_level: Access_Levels):
    """Create a new access level"""
    try:
        session.add(access_level)
        session.commit()
        session.refresh(access_level)
        return access_level
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create access level: {str(e)}")

@router.post('/gender-options', response_model=Gender_Options)
def create_gender_option(*, session: Session = Depends(get_session), gender_option: Gender_Options):
    """Create a new gender option"""
    try:
        session.add(gender_option)
        session.commit()
        session.refresh(gender_option)
        return gender_option
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create gender option: {str(e)}")

@router.post('/relationship-types', response_model=Relationship_Types)
def create_relationship_type(*, session: Session = Depends(get_session), relationship_type: Relationship_Types):
    """Create a new relationship type"""
    try:
        session.add(relationship_type)
        session.commit()
        session.refresh(relationship_type)
        return relationship_type
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create relationship type: {str(e)}")