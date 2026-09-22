import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class BusinessStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class BusinessType(str, enum.Enum):
    PET_SHOP = "Pet Shop"
    VET_CLINIC = "Veterinary Clinic"
    GROOMING = "Grooming Center"
    PET_CARE = "Pet Care Center"
    OTHER = "Other"


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    business_type = Column(String(100), default="Pet Care Center", nullable=False)
    
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), index=True, nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), index=True, nullable=True)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    opening_time = Column(String(10), default="09:00", nullable=False)
    closing_time = Column(String(10), default="18:00", nullable=False)
    working_days = Column(String(255), default="Mon,Tue,Wed,Thu,Fri,Sat", nullable=False)
    
    status = Column(Enum(BusinessStatus), default=BusinessStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="owned_businesses")
    services = relationship("Service", back_populates="business", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="business", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="business", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="business", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="business", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="business", cascade="all, delete-orphan")
