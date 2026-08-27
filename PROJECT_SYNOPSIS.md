# PROJECT SYNOPSIS

## 🐾 Smart Pet Care Appointment & Customer Management System

---

### **1. Basic Project Information**

| Field | Details |
| :--- | :--- |
| **Project Title** | Smart Pet Care Appointment & Customer Management System |
| **Domain / Area** | Full-Stack Web Development, SaaS, Veterinary Healthcare Technology, Cloud Computing |
| **Project Type** | B.Tech 7th Semester / Final Year Major Capstone Project |
| **Architecture** | Client-Server Architecture (Decoupled RESTful API + SPA Frontend) |
| **Frontend Technologies** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend Technologies** | Python 3.11+, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib (Bcrypt) |
| **Database** | PostgreSQL (Production) / SQLite3 (Development) |
| **Deployment Platform** | Render (Backend API & PostgreSQL Database), Vercel (Frontend SPA) |

---

### **2. Executive Summary / Abstract**

The **Smart Pet Care Appointment & Customer Management System** is an enterprise-grade, multi-role SaaS (Software as a Service) web application designed to digitize and streamline operations for veterinary clinics, pet grooming centers, and pet care hubs.

Traditional pet care management relies heavily on manual record-keeping, paper-based appointment registers, disconnected medical histories, and fragmented billing systems. These legacy practices lead to scheduling conflicts, missed vaccination cycles, communication gaps between pet owners and veterinarians, and significant administrative overhead.

This project addresses these critical challenges by offering a centralized, cloud-enabled web platform equipped with **Role-Based Access Control (RBAC)** across three primary user tiers: **System Administrators**, **Veterinarians/Staff**, and **Pet Owners (Customers)**. Key features include dynamic appointment scheduling, automated medical record tracking, digital vaccination passports, automated invoicing and payment processing, interactive analytics dashboards, audit trail logging, and an integrated **AI Veterinary Assistant** for smart triage and client support.

---

### **3. Problem Statement**

Modern pet care clinics face several operational bottlenecks:
1. **Inefficient & Overlapped Scheduling:** Manual booking systems frequently result in double-booking of veterinarians or long waiting times for pet parents.
2. **Scattered Pet Health Records:** Pet medical histories, diagnostic reports, and vaccination schedules are often recorded on paper or isolated spreadsheets, leading to lost records and delayed care during emergencies.
3. **Missed Vaccinations & Treatments:** Without automated reminder systems, pet owners frequently forget follow-up vaccination dates, risking pet wellness.
4. **Complex Billing & Invoicing:** Manual calculations of treatments, medications, and service charges increase financial errors and slow down check-outs.
5. **Lack of Business Intelligence:** Clinic managers lack real-time visibility into daily revenue trends, popular services, doctor availability, and customer satisfaction ratings.

---

### **4. Proposed Solution & Project Objectives**

The proposed system delivers a unified, secure, scalable, and responsive digital solution. 

#### **Key Objectives:**
- **Automate Booking & Doctor Allocation:** Enable pet owners to browse clinic services, check doctor availability dynamically, and book appointments online with instant confirmation.
- **Centralize Electronic Health Records (EHR):** Provide veterinarians with a dedicated portal to view complete medical history, diagnose conditions, prescribe medications, and update pet profiles.
- **Automated Preventive Care & Reminders:** Maintain structured vaccination records with automatic due-date alerts and reminders for pet owners.
- **Streamline Financial Operations:** Generate itemized digital invoices, calculate tax/discounts automatically, and integrate payment tracking (Cash, Card, UPI, Online).
- **AI-Assisted Guidance:** Incorporate an AI assistant to answer common pet health queries, recommend clinic services, and assist staff in quick diagnostic summaries.
- **Data-Driven Insights:** Provide administrators with real-time visual analytics detailing total appointments, monthly revenue, service distributions, and vet availability metrics.

---

### **5. System Architecture & Tech Stack**

```
+-----------------------------------------------------------------------+
|                             CLIENT TIER                               |
|        React 18 Single Page Application (SPA) + Tailwind CSS          |
|              (Hosted on Vercel / Responsive UI)                       |
+-----------------------------------------------------------------------+
                                   |
                         HTTP REST API / JSON (Axios)
                                   |
+-----------------------------------------------------------------------+
|                             APPLICATION TIER                          |
|           FastAPI Python Framework + Uvicorn ASGI Server              |
|        - JWT Bearer Authentication & OAuth2                           |
|        - Pydantic Schema Validation & Business Logic                  |
|        - AI Assistant Router (Gemini Integration)                     |
+-----------------------------------------------------------------------+
                                   |
                            SQLAlchemy ORM
                                   |
+-----------------------------------------------------------------------+
|                              DATA TIER                                |
|        PostgreSQL Database (Render) / SQLite3 (Local Dev)             |
|     (Users, Pets, Appointments, EHR, Invoices, Audit Logs)            |
+-----------------------------------------------------------------------+
```

#### **Tech Stack Overview:**
- **Frontend Stack:**
  - **Framework:** React 18 with Vite for lightning-fast build times.
  - **Styling:** Tailwind CSS for custom responsive UI design.
  - **Icons & Data Visualization:** Lucide React Icons, Recharts for dynamic charts.
  - **HTTP Client:** Axios with global request/response interceptors for token handling.
- **Backend Stack:**
  - **Framework:** FastAPI (Asynchronous Python REST API framework).
  - **OR Mapper:** SQLAlchemy ORM for database abstraction and query optimization.
  - **Data Validation:** Pydantic v2 schemas for robust request/response validation.
  - **Security:** Passlib (Bcrypt hashing), PyJWT (JSON Web Tokens) with RBAC authorization dependencies.
- **Database & Storage:**
  - **Database Engine:** PostgreSQL on Render Cloud (SQLite3 for local dev).
  - **Static Assets:** StaticFiles for file uploads (pet photos, prescription attachments).

---

### **6. Module Breakdown**

The application is engineered into modular components to ensure separation of concerns, scalability, and ease of maintenance:

#### **Module 1: Authentication & User Management**
- Secure Registration and Multi-Role Login (Admin, Staff/Vet, Customer).
- JWT Token-based authentication with auto-expiration and token refreshes.
- Password reset and profile management capabilities.

#### **Module 2: Customer & Pet Management Portal**
- Pet registration supporting multiple species (Dog, Cat, Bird, Exotic), breeds, age, weight, gender, and medical allergy notes.
- Comprehensive pet health passport showing medical history, active treatments, and past visit logs.

#### **Module 3: Dynamic Appointment & Availability System**
- Real-time availability grid for veterinarians.
- Online appointment booking with options for service selection (General Checkup, Surgery, Vaccination, Grooming, Dental).
- Status workflow tracking (`Pending`, `Confirmed`, `In-Progress`, `Completed`, `Cancelled`).

#### **Module 4: Electronic Health Records (EHR) & Medical Records**
- Doctor portal for logging diagnosis, clinical notes, prescribed medications, follow-up dates, and vital signs.
- Digital prescription generation accessible by pet parents.

#### **Module 5: Preventive Care & Vaccination Tracker**
- Dedicated vaccination tracking per pet.
- Expiry date and due date computation with status badges (`Up-to-Date`, `Due Soon`, `Overdue`).
- Automated notification triggers for scheduled immunizations.

#### **Module 6: Billing, Invoicing & Payment Processing**
- Itemized invoice creation linking services, treatments, and medicines.
- Tax computation, discount application, and total amount calculation.
- Support for multi-mode payment recording (Cash, UPI, Credit/Debit Card, Online).
- PDF download/print-friendly invoice interface.

#### **Module 7: AI Veterinary Assistant**
- Integrated AI query engine to answer routine pet care questions.
- Automated symptom pre-checker guiding users to appropriate appointment types.

#### **Module 8: Admin Analytics Dashboard & Audit Logging**
- Visual representation of clinic KPIs (Total Revenue, Monthly Appointments, Top Services, Vet Performance).
- Security audit logs tracking critical system transactions and data updates.

---

### **7. Database Entity-Relationship (ER) Schema**

The database design comprises 14+ relational tables enforcing strong data integrity:

```
[User] (1) <--- (1) [Customer Profile] (1) <--- (N) [Pet]
  |                                                  | (1)
  +-------- (1) [Staff Profile]                      |
                     | (1)                           +---> (N) [Appointment]
                     |                                       |
                     +---> (N) [Availability]                +---> (1) [MedicalRecord]
                                                             +---> (1) [Invoice] ---> (N) [Payment]
```

- **`users`**: Base credentials, email, password hash, role (`admin`, `staff`, `customer`), status.
- **`customers`**: Customer profile, emergency contact, home address.
- **`staff`**: Vet/Staff specialization, qualification, experience, consultation fee.
- **`pets`**: Pet demographic details, species, breed, birth date, microchip ID, allergies.
- **`services`**: Clinic offerings, duration, pricing, category.
- **`appointments`**: Date, time slot, status, notes, foreign keys linking Customer, Pet, Staff, Service.
- **`availability`**: Vet schedule, day of week, start time, end time, maximum slot capacity.
- **`medical_records`**: Diagnosis, treatment plan, symptoms, prescriptions, follow-up date.
- **`vaccinations`**: Vaccine name, dose number, administration date, next due date, status.
- **`invoices`**: Billing summary, subtotal, tax, discount, grand total, payment status.
- **`payments`**: Payment date, method, transaction reference ID, paid amount.
- **`reviews`**: Customer ratings (1-5 stars) and feedback for staff/services.
- **`notifications`**: System notifications, delivery status, timestamp.
- **`audit_logs`**: Action type, user ID, target table, timestamp, IP address.

---

### **8. Hardware & Software Requirements**

#### **Software Requirements:**
- **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 20.04+).
- **Runtime Environments:** Node.js (v18.x or later), Python (v3.11 or later).
- **Database Engine:** PostgreSQL 14+ (Cloud/Local) or SQLite3.
- **Web Browser:** Modern browser with ES6+ support (Google Chrome, Mozilla Firefox, Edge).
- **API Client:** Postman / FastAPI Interactive Swagger UI.

#### **Minimum Hardware Requirements:**
- **Processor:** Dual-Core 2.0 GHz CPU (Intel Core i3 / AMD Ryzen 3 or equivalent).
- **RAM:** 4 GB minimum (8 GB recommended for concurrent backend/frontend dev server execution).
- **Disk Space:** 500 MB free hard disk space for code repositories and local database storage.
- **Network:** Active internet connection for API communication and deployment.

---

### **9. Feasibility Analysis**

#### **1. Technical Feasibility:**
The technology stack utilizes well-documented, industry-proven open-source frameworks (FastAPI, React, PostgreSQL). The decoupled architecture allows independent testing, maintenance, and deployment.

#### **2. Operational Feasibility:**
The user interfaces are designed with modern UX principles, featuring role-tailored dashboards. Admin, vets, and customers require zero specialized training to navigate the application effectively.

#### **3. Economic Feasibility:**
Built entirely on open-source tools with $0 cloud deployment options (Render Free Tier, Vercel Hobby Tier), making it highly cost-effective for small to medium veterinary clinics.

---

### **10. Future Scope & Enhancements**

1. **Tele-Veterinary Consultations:** Integrating WebRTC video call infrastructure for virtual pet health assessments.
2. **IoT Wearable Integration:** Syncing data from pet smart collars (activity logs, heart rate, GPS) directly into pet EHR.
3. **Multi-Branch Support:** Extending the database schema to support multi-location clinic chains with centralized administration.
4. **Mobile Applications:** Developing native iOS and Android mobile apps using React Native.
5. **WhatsApp & SMS Gateway:** Automated SMS/WhatsApp notifications for appointment confirmations and urgent medication reminders.

---

### **11. Conclusion**

The **Smart Pet Care Appointment & Customer Management System** successfully replaces manual clinic workflows with an intelligent, cloud-based digital ecosystem. By integrating real-time scheduling, electronic health records, automated billing, and AI support into an intuitive React-FastAPI architecture, the system significantly enhances operational efficiency, reduces missed appointments, and elevates the quality of pet healthcare management.
