# app/api/v1/endpoints/user.py
from fastapi import APIRouter, HTTPException
from app.schemas.user import UserProfileCreate, UserProfileRead
from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import UserProfile

router = APIRouter()

@router.post("/", response_model=UserProfileRead)
def create_user(payload: UserProfileCreate):
    with Session(engine) as session:
        user = UserProfile.from_orm(payload)  # Pydantic -> SQLModel
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

@router.get("/", response_model=list[UserProfileRead])
def list_users():
    with Session(engine) as session:
        users = session.exec(select(UserProfile)).all()
        return users

@router.get("/{user_id}", response_model=UserProfileRead)
def get_user(user_id: int):
    with Session(engine) as session:
        user = session.get(UserProfile, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

@router.put("/{user_id}", response_model=UserProfileRead)
def update_user(user_id: int, payload: UserProfileCreate):
    with Session(engine) as session:
        user = session.get(UserProfile, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_data = payload.dict(exclude_unset=True)
        for k, v in user_data.items():
            setattr(user, k, v)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user