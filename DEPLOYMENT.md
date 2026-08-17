# 🚀 Render Deployment Guide for Smart Pet Care Backend & PostgreSQL

This guide provides step-by-step instructions to deploy the FastAPI backend and PostgreSQL database on Render.

---

## ⚡ Method 1: 1-Click Deployment using Render Blueprint (Recommended)

Since the project includes a `render.yaml` Blueprint file, Render can provision the PostgreSQL database and backend web service automatically.

1. **Push your code to GitHub / GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml`, set up the `petcare-db` database and `petcare-backend` web service, and wire the `DATABASE_URL` environment variable automatically.
6. Click **Apply**.

---

## 🛠️ Method 2: Manual Deployment on Render

If you prefer setting up services manually:

### Step 1: Create the PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com) ➔ Click **New +** ➔ **PostgreSQL**.
2. Set the following details:
   - **Name**: `petcare-db`
   - **Database**: `petcare`
   - **User**: `petcare_user`
   - **Region**: Choose the closest region to you (e.g. Singapore or Frankfurt)
   - **Plan**: Free / Standard
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g. `postgres://petcare_user:password@dpg-xxxx-a.singapore-postgres.render.com/petcare`).

### Step 2: Create the Web Service on Render
1. Click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `petcare-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Set Environment Variables on Render
Under the **Environment** tab of your Web Service, add the following key-value pairs:

| Environment Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(Paste Internal Database URL)* | Connects FastAPI to Render PostgreSQL |
| `JWT_SECRET` | `super-secret-key-petcare-btech-2026` | Used to sign & verify JWT login tokens |
| `PYTHON_VERSION` | `3.11.0` | Recommended Python version |

---

## ⚙️ Automatic Seeding & DB Initialization

The backend application is configured to **automatically seed** initial demo data when connected to a fresh PostgreSQL database:
* When the app starts up on Render, `main.py` detects if the `users` table is empty.
* If empty, it automatically executes `seed.py` without dropping existing tables, inserting all **15 Users, 18 Pets, 19 Appointments, 8 Services, Invoices, and Medical Records**.
* Subsequent server restarts will preserve your existing database without re-seeding.

---

## 🔑 Demo Account Credentials

Once deployed, log into your backend API or React frontend with:

* **Admin**: `admin@petcare.com` / `password123`
* **Veterinarian**: `dr.smith@petcare.com` / `password123`
* **Customer**: `customer@petcare.com` / `password123`

---

## 🧪 Verification

After deployment finishes on Render:
1. Open `https://<your-render-app>.onrender.com/docs` to test Swagger UI docs.
2. Test `POST /api/auth/login` using `admin@petcare.com` and `password123`.
3. Check `GET /api/health` to confirm the service status is `online`.
