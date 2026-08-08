from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.schemas.customer import CustomerOut, CustomerUpdate
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    query = db.query(Customer).join(User)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
    return query.order_by(Customer.id.desc()).all()


@router.get("/me", response_model=CustomerOut)
def get_my_customer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.customer_profile:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return current_user.customer_profile


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if current_user.role == UserRole.CUSTOMER and current_user.id != cust.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return cust


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if current_user.role == UserRole.CUSTOMER and current_user.id != cust.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if data.address is not None:
        cust.address = data.address
    if data.emergency_contact is not None:
        cust.emergency_contact = data.emergency_contact
    if data.notes is not None and current_user.role in [UserRole.ADMIN, UserRole.STAFF]:
        cust.notes = data.notes

    db.commit()
    db.refresh(cust)
    return cust
