from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: UserRole


class RegisterCustomerRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
