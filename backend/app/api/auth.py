from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.schemas.auth import (
    LoginRequest, TokenResponse, RegisterCustomerRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.schemas.user import UserOut
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
def register_customer(req: RegisterCustomerRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        phone=req.phone,
        role=UserRole.CUSTOMER
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    customer = Customer(
        user_id=user.id,
        address=req.address,
        emergency_contact=req.emergency_contact
    )
    db.add(customer)
    db.commit()

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Return success for security privacy
        return {"message": "If the email is registered, a password reset link has been dispatched."}
    return {"message": "If the email is registered, a password reset link has been dispatched.", "demo_reset_token": f"reset-token-{user.id}"}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not req.token.startswith("reset-token-"):
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user_id = int(req.token.replace("reset-token-", ""))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successfully."}
