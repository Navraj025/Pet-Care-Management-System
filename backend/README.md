# Smart Pet Care Appointment & Customer Management System

A full-stack, commercial-grade SaaS web application built for pet clinics, veterinary centers, and pet grooming hubs as a B.Tech Final Year Project.

## Architecture

- **`backend/`**: FastAPI, SQLAlchemy ORM, Pydantic, Passlib/Bcrypt, PyJWT.
- **`frontend/`**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios.

## Quick Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py
python -m uvicorn main:app --reload
```
API running at `http://127.0.0.1:8000` (Docs at `http://127.0.0.1:8000/docs`)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web App running at `http://localhost:3000`

## Demo Accounts
- **Admin**: `admin@petcare.com` / `password123`
- **Staff / Vet**: `dr.smith@petcare.com` / `password123`
- **Customer**: `customer@petcare.com` / `password123`
