import os
from datetime import datetime, timedelta
from typing import Optional, Any
import jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-petcare-btech-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Use pbkdf2_sha256 and bcrypt for robust cross-platform compatibility
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = plain_password[:72]
    return pwd_context.verify(safe_password, hashed_password)


def get_password_hash(password: str) -> str:
    safe_password = password[:72]
    return pwd_context.hash(safe_password)


def create_access_token(subject: Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
