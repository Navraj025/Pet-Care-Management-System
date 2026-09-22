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


class RegisterBusinessOwnerRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    business_name: str
    business_type: str = "Pet Care Center"
    city: str
    pincode: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    opening_time: str = "09:00"
    closing_time: str = "18:00"
    working_days: str = "Mon,Tue,Wed,Thu,Fri,Sat"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
