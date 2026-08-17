# 🎁 100% FREE Render Deployment Guide (Zero Payment / Credit Card Required)

Render allows you to host both your **FastAPI Backend API** and your **Database** for **100% FREE** with **NO Credit Card / Payment Required**.

---

## ⚡ Option 1: 100% FREE 1-Click Deployment on Render (Recommended)

This option uses Render's **Free Web Service Tier** + auto-initialized SQLite database. It requires **ZERO credit card** and **ZERO payment details**.

1. Push your updated code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository (`Navraj025/Pet-Care-Management-System`).
5. Render will detect `render.yaml` and select the **Free Plan** (`plan: free`).
6. Click **Apply**.
7. Your app will build, launch, and **automatically seed all 15 Users, 18 Pets, 19 Appointments, Invoices, and Medical Records** on start!

---

## 🗄️ Option 2: 100% FREE Cloud PostgreSQL Database (No Credit Card)

If you want a **Cloud PostgreSQL Database** for free without entering payment details on Render:

1. Create a free account on **[Neon.tech](https://neon.tech)** or **[Supabase.com](https://supabase.com)** (100% free forever, no credit card needed).
2. Create a new database project and copy the PostgreSQL connection string (`DATABASE_URL`).
3. Go to your Render Web Service Dashboard ➔ **Environment**.
4. Add Environment Variable:
   * **Key**: `DATABASE_URL`
   * **Value**: *(Paste your Neon/Supabase PostgreSQL connection string)*
5. Click **Save Changes**. Your Render app will re-deploy and auto-seed onto your free cloud PostgreSQL database!

---

## 🔑 Login Credentials

Once your deployment is Live, test login with:
* **Admin**: `admin@petcare.com` / `password123`
* **Veterinarian**: `dr.smith@petcare.com` / `password123`
* **Customer**: `customer@petcare.com` / `password123`
