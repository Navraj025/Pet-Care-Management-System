# 🚀 How to Deploy BOTH Backend & PostgreSQL Database on Render for FREE ($0/month)

Render provides a **$0 Free Plan** for both the **Python FastAPI Web Service** AND the **PostgreSQL Database**.

---

## ⚡ Method 1: Deploying BOTH Services via Blueprint ($0/month)

1. Push your updated code to GitHub.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository (`Navraj025/Pet-Care-Management-System`).
5. Render will automatically read `render.yaml` and show:
   * **`petcare-backend`** ➔ Plan: **Free ($0/mo)**
   * **`petcare-db`** ➔ Plan: **Free ($0/mo)**
6. Click **Apply**. Render will deploy both services for **$0/month**!

---

## 🛠️ Method 2: Manual 2-Step Creation ($0/month)

If you create services manually on Render dashboard:

### Step 1: Create Free PostgreSQL Database ($0/mo)
1. Go to [Render Dashboard](https://dashboard.render.com) ➔ Click **New +** ➔ **PostgreSQL**.
2. Fill in:
   * **Name**: `petcare-db`
   * **Database**: `petcare`
   * **User**: `petcare_user`
   * **Instance Type**: Select **Free ($0/month)** *(scroll down to select Free)*.
3. Click **Create Database**.
4. Copy the **Internal Database URL** from the database info page.

### Step 2: Create Free Web Service ($0/mo)
1. Click **New +** ➔ **Web Service**.
2. Connect your GitHub repo (`Navraj025/Pet-Care-Management-System`).
3. Fill in:
   * **Name**: `petcare-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: Select **Free ($0/month)**.
4. Under **Environment Variables**:
   * Add `DATABASE_URL` = *(Paste the Internal Database URL from Step 1)*
   * Add `JWT_SECRET` = `super-secret-key-petcare-btech-2026`
5. Click **Create Web Service**.

---

## 🔑 Login Credentials After Deployment

Once deployed, your backend will **automatically seed all 15 Users, 18 Pets, 19 Appointments, Invoices, and Medical Records** into PostgreSQL on first start.

Log in at `https://<your-render-backend-url>.onrender.com/docs`:
* **Admin**: `admin@petcare.com` / `password123`
* **Veterinarian**: `dr.smith@petcare.com` / `password123`
* **Customer**: `customer@petcare.com` / `password123`
