from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.auth.security import get_password_hash
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    return query.order_by(User.id.desc()).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    if data.password is not None and data.password.strip():
        user.password_hash = get_password_hash(data.password)
    if data.is_active is not None and current_user.role == UserRole.ADMIN:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    log_audit_action(db, current_user.id, "UPDATE_USER", "USER", user.id, f"Updated profile for {user.email}")
    return user
