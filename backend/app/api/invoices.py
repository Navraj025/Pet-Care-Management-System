from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.appointment import Appointment
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceOut
from app.auth.deps import get_current_user

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", response_model=List[InvoiceOut])
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice).join(Appointment)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.filter(Appointment.customer_id == current_user.customer_profile.id)

    return query.order_by(Invoice.created_at.desc()).all()


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or inv.appointment.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    return inv
