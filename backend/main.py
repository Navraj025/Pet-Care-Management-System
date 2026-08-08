import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.api import (
    auth, users, customers, staff, pets, services,
    appointments, availability, medical_records, vaccinations,
    payments, invoices, notifications, reviews, reports,
    ai_assistant, audit_logs, settings
)

# Initialize database tables on app start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Pet Care Appointment & Customer Management System",
    description="Enterprise REST API backend for B.Tech Final Year Project",
    version="1.0.0"
)

# CORS Configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(pets.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(availability.router, prefix="/api")
app.include_router(medical_records.router, prefix="/api")
app.include_router(vaccinations.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Smart Pet Care SaaS Backend API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
