import os
import sys
from pathlib import Path

# Add backend directory to Python sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.api import (
    auth, users, customers, staff, pets, services,
    appointments, availability, medical_records, vaccinations,
    payments, invoices, notifications, reviews, reports,
    ai_assistant, audit_logs, settings,
    businesses, admin_businesses, business_owner
)

# Initialize database tables on app start
Base.metadata.create_all(bind=engine)

# Auto-seed initial demo data if database is brand new & empty, and update service prices
try:
    from app.database import SessionLocal
    from app.models.user import User
    from app.models.service import Service
    with SessionLocal() as db:
        if db.query(User).count() == 0:
            print("[INFO] Empty database detected. Auto-seeding initial demo dataset...")
            from seed import seed_database
            seed_database(drop_existing=False)
        else:
            # Migration/auto-update: Convert any legacy USD numeric prices in DB (< 500) to INR values
            price_map = {
                "General Health Checkup": 4250.0,
                "Veterinary Consultation": 6800.0,
                "Rabies Vaccination": 3400.0,
                "DHPP Core Vaccine": 5100.0,
                "Dental Cleaning & Scaling": 12750.0,
                "Full Grooming Package": 8500.0,
                "Bath & De-Shedding Dry": 5100.0,
                "Nail Trimming & Paw Care": 2550.0
            }
            db_services = db.query(Service).all()
            updated_count = 0
            for srv in db_services:
                if srv.price < 500:
                    if srv.name in price_map:
                        srv.price = price_map[srv.name]
                    else:
                        srv.price = round(srv.price * 85.0, -1)  # 85 conversion multiplier fallback
                    updated_count += 1
            if updated_count > 0:
                db.commit()
                print(f"[INFO] Auto-updated {updated_count} service price(s) from USD to INR in database.")

            # Ensure recent payments exist for analytics trends
            from datetime import date, timedelta
            from app.models.payment import Payment, PaymentStatus
            today_d = date.today()
            latest_payment = db.query(Payment).filter(Payment.status == PaymentStatus.PAID).order_by(Payment.payment_date.desc()).first()
            if latest_payment and latest_payment.payment_date and latest_payment.payment_date.date() < (today_d - timedelta(days=7)):
                all_paid = db.query(Payment).filter(Payment.status == PaymentStatus.PAID).order_by(Payment.id.asc()).all()
                total_p = len(all_paid)
                for idx, p in enumerate(all_paid):
                    p.payment_date = datetime.combine(today_d - timedelta(days=(total_p - 1 - idx) % 14), datetime.min.time())
                db.commit()
                print(f"[INFO] Re-anchored {total_p} demo payment dates to current 14-day window for active analytics.")
except Exception as e:
    print(f"[INFO] Database initialization check complete: {e}")

app = FastAPI(
    title="Smart Pet Care Marketplace & Customer Management System",
    description="Multi-Business Pet-Care Marketplace REST API backend",
    version="2.0.0"
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
app.include_router(businesses.router, prefix="/api")
app.include_router(admin_businesses.router, prefix="/api")
app.include_router(business_owner.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Smart Pet Care SaaS Backend API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Smart Pet Care SaaS Backend API",
        "version": "1.0.0"
    }


frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
uploads_dir = Path(__file__).resolve().parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

if frontend_dist.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=frontend_dist / "assets"),
        name="frontend-assets",
    )


    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    print("\nSmart Pet Care is starting...")
    print(f"Open the app: http://{host}:{port}")
    print(f"API docs:     http://{host}:{port}/docs\n")
    uvicorn.run("main:app", host=host, port=port, reload=True)
