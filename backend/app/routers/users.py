from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models import Primary_Care_Giver
from pydantic import BaseModel
import hashlib

router = APIRouter(
    prefix="/user-profile",
    tags=["users"],
)

# Request/Response models
class UserProfileRequest(BaseModel):
    auth_user_id: str
    username: str | None = None
    email: str | None = None
    contact_number: str | None = None
    relationship: str | None = None

class UserProfileResponse(BaseModel):
    id: int
    auth_user_id: str
    username: str
    email: str
    contact_number: str
    relationship: str

class DirectLoginRequest(BaseModel):
    email: str
    password: str

class DirectLoginResponse(BaseModel):
    success: bool
    user: UserProfileResponse | None = None
    message: str | None = None

def hash_password(password: str) -> str:
    """Simple password hashing for development. In production, use proper password hashing."""
    return hashlib.sha256(password.encode()).hexdigest()

@router.get('/{user_id}', response_model=Primary_Care_Giver)
def user_profile(*, user_id: int, session: Session = Depends(get_session)):
    user = session.get(Primary_Care_Giver, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get('/by-auth-id/{auth_user_id}', response_model=UserProfileResponse)
def get_user_by_auth_id(*, auth_user_id: str, session: Session = Depends(get_session)):
    """Get user profile by Supabase Auth user ID"""
    statement = select(Primary_Care_Giver).where(Primary_Care_Giver.auth_user_id == auth_user_id)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user

@router.post('/link-auth', response_model=UserProfileResponse)
def link_or_create_user_profile(*, session: Session = Depends(get_session), profile_data: UserProfileRequest):
    """Link Supabase Auth user to primary_care_giver profile or create new profile"""
    
    # Check if user already exists with this auth_user_id
    statement = select(Primary_Care_Giver).where(Primary_Care_Giver.auth_user_id == profile_data.auth_user_id)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        # Update existing user if needed
        if profile_data.username:
            existing_user.username = profile_data.username
        if profile_data.email:
            existing_user.email = profile_data.email
        if profile_data.contact_number:
            existing_user.contact_number = profile_data.contact_number
        if profile_data.relationship:
            existing_user.relationship = profile_data.relationship
            
        session.add(existing_user)
        session.commit()
        session.refresh(existing_user)
        return existing_user
    
    # Create new user profile
    new_user = Primary_Care_Giver(
        auth_user_id=profile_data.auth_user_id,
        username=profile_data.username or "User",
        email=profile_data.email or "",
        contact_number=profile_data.contact_number or "",
        relationship=profile_data.relationship or "Parent"
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post('/', response_model=Primary_Care_Giver)
def new_user(*, session: Session = Depends(get_session), user: Primary_Care_Giver):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post('/auth/direct-login', response_model=DirectLoginResponse)
def direct_login(*, session: Session = Depends(get_session), login_data: DirectLoginRequest):
    """
    Direct authentication against primary_care_giver table for development.
    This bypasses Supabase Auth and authenticates directly with your database.
    """
    try:
        # Find user by email
        statement = select(Primary_Care_Giver).where(Primary_Care_Giver.email == login_data.email)
        user = session.exec(statement).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check password (in production, use proper password hashing/comparison)
        if user.password and user.password == login_data.password:
            # Return user profile without password
            user_response = UserProfileResponse(
                id=user.id,
                auth_user_id=user.auth_user_id or f"direct-{user.id}",
                username=user.username,
                email=user.email,
                contact_number=user.contact_number,
                relationship=user.relationship
            )
            
            return DirectLoginResponse(
                success=True,
                user=user_response,
                message="Login successful"
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
