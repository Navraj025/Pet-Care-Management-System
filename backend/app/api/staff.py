from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.staff import Staff
from app.schemas.staff import StaffOut, StaffCreate, StaffUpdate
from app.auth.security import get_password_hash
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("", response_model=List[StaffOut])
def list_staff(
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Staff).join(User).filter(User.is_active == True)
    if available_only:
        query = query.filter(Staff.is_available == True)
    return query.all()


@router.get("/me", response_model=StaffOut)
def get_my_staff_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["STAFF", "ADMIN"]))
):
    if not current_user.staff_profile:
        raise HTTPException(status_code=404, detail="Staff profile not found")
    return current_user.staff_profile


@router.post("", response_model=StaffOut)
def create_staff(
    data: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    if data.user_id:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.role = UserRole.STAFF
    elif data.user_data:
        existing = db.query(User).filter(User.email == data.user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User email already exists")
        user = User(
            email=data.user_data.email,
            password_hash=get_password_hash(data.user_data.password),
            full_name=data.user_data.full_name,
            phone=data.user_data.phone,
            role=UserRole.STAFF
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        raise HTTPException(status_code=400, detail="Either user_id or user_data must be provided")

    staff = Staff(
        user_id=user.id,
        specialization=data.specialization,
        bio=data.bio,
        working_days=data.working_days,
        start_time=data.start_time,
        end_time=data.end_time,
        break_start=data.break_start,
        break_end=data.break_end,
        is_available=data.is_available
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    
    log_audit_action(db, current_user.id, "CREATE_STAFF", "STAFF", staff.id, f"Created staff member {user.full_name}")
    return staff


@router.get("/{staff_id}", response_model=StaffOut)
def get_staff_member(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff


@router.put("/{staff_id}", response_model=StaffOut)
def update_staff_member(
    staff_id: int,
    data: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    if current_user.role != UserRole.ADMIN and (not current_user.staff_profile or current_user.staff_profile.id != staff_id):
        raise HTTPException(status_code=403, detail="Not authorized to edit staff details")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(staff, field, val)

    db.commit()
    db.refresh(staff)
    return staff
