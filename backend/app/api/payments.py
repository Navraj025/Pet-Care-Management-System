import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.appointment import Appointment
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.invoice import Invoice
from app.schemas.payment import PaymentOut, PaymentCreate
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=List[PaymentOut])
def list_payments(
    status: Optional[PaymentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.join(Appointment).filter(Appointment.customer_id == current_user.customer_profile.id)

    if status:
        query = query.filter(Payment.status == status)

    return query.order_by(Payment.created_at.desc()).all()


@router.post("/process", response_model=PaymentOut)
def process_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Safe test/mock payment gateway execution."""
    payment = db.query(Payment).filter(Payment.appointment_id == data.appointment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record for appointment not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or payment.appointment.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    if payment.status == PaymentStatus.PAID:
        raise HTTPException(status_code=400, detail="Payment has already been completed")

    # Simulate Mock Successful Payment Processing
    payment.status = PaymentStatus.PAID
    payment.payment_method = data.payment_method
    payment.transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
    payment.payment_date = datetime.utcnow()

    # Generate Invoice if not exists
    existing_invoice = db.query(Invoice).filter(Invoice.appointment_id == data.appointment_id).first()
    if not existing_invoice:
        inv_count = db.query(Invoice).count() + 1
        invoice_number = f"INV-{datetime.utcnow().year}-{inv_count:04d}"
        due_date = datetime.utcnow().date()

        invoice = Invoice(
            appointment_id=data.appointment_id,
            payment_id=payment.id,
            invoice_number=invoice_number,
            issue_date=datetime.utcnow().date(),
            due_date=due_date,
            total_amount=payment.final_amount
        )
        db.add(invoice)

    db.commit()
    db.refresh(payment)

    log_audit_action(db, current_user.id, "PROCESS_PAYMENT", "PAYMENT", payment.id, f"Payment of ${payment.final_amount:.2f} successful ({payment.transaction_id})")
    return payment
