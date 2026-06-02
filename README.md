# School Management System / School Automation Software

A complete, production-ready full-stack School ERP system built using **React.js (with Tailwind CSS v4)** on the frontend and **Node.js + Express + MongoDB** on the backend. This software features secure JWT authentication, role-based access controls, interactive dashboards for 5 roles, and printable reports.

---

## 🚀 Key Features

*   **Role-Based Dashboards**: Customized workspaces for **Super Admin (Principal)**, **School Admin (Vice Principal & Staff)**, **Teachers**, **Students**, and **Parents**.
*   **Secure Authentication**: JWT-based authentication guards, SHA-256 equivalent salt hashing on backend, onboarding setup validation, and automatic session expiration checks.
*   **Student Management Desk**: Enroll students, assign class/section, roll number designation, profile updates, and search filters.
*   **Daily Attendance System**: Record class attendance, review monthly logs, and export reports.
*   **Billing & Fee Management**: Pay tuition/bus fees, installment transaction ledger, and payment confirmations.
*   **Academics & Exams**: Exam scheduler schedules, marks entry desk, automatic grade calculations, and digital report cards.
*   **Simulated Google Hub**: Displays dynamic rows automatically appended to virtual Google Sheets, events marked on Google Calendar, and confirmation email logs.
*   **Notice Board**: Broadcast bulletins to students, teachers, parents, or all users.
*   **Homework Management**: Upload files/instructions, submission forms, and student grading boards.

---

## 📂 Folder Structure

```
├── backend/                  # REST API Express Server
│   ├── config/               # DB Connection configurations
│   ├── controllers/          # Business logic controllers
│   ├── middleware/           # Protect & Auth guards
│   ├── models/               # MongoDB Mongoose models (14 schemas)
│   ├── routes/               # API Router endpoints
│   ├── scripts/              # DB seeder (seed.js)
│   ├── .env.example          # Environment variables template
│   └── server.js             # API entrypoint
├── src/                      # React Frontend App
│   ├── components/           # Reusable UI Blocks (LandingPage, IDGenerator, etc.)
│   ├── context/              # Auth & Database Context Providers
│   ├── dashboards/           # Customized dashboard grid components
│   ├── styles/               # Global styling sheets (premium custom themes)
│   └── utils/                # api.js helpers and text formatting functions
├── package.json              # Main project task runner (runs dev concurrently)
└── vite.config.js            # Frontend bundler settings
```

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017` or a MongoDB Atlas URI)

### Local Step-by-Step Setup

1.  **Clone / Download the project files** into a directory.
2.  **Install dependencies** for both the frontend and the backend by running the following command in the project root directory:
    ```bash
    # Install root and frontend dev dependencies
    npm install
    
    # Install backend dependencies
    npm run install --prefix backend
    ```

3.  **Set up Backend Environment Variables**:
    *   Navigate to the `backend/` directory.
    *   Create a `.env` file (copied from `.env.example`):
        ```bash
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/school_automation
        JWT_SECRET=supersecret_school_erp_token_guard_2026
        JWT_EXPIRE=2h
        NODE_ENV=development
        ```

4.  **Seed the MongoDB Database**:
    *   Ensure your MongoDB database server is active.
    *   Run the database seeder script in the project root to load the default testing accounts:
        ```bash
        npm run seed-backend
        ```
        This will populate MongoDB with the required students, teachers, fees records, exams, classes, and auth records.

5.  **Run the System Locally**:
    *   Run the concurrent dev command in the root folder:
        ```bash
        npm run dev
        ```
        This script will start:
        *   **Frontend**: Vite dev server on `http://localhost:5173/`
        *   **Backend**: Node-Express server on `http://localhost:5000/`

---

## 🔑 Default Accounts (For Testing & Onboarding Hub)

Use these administrator-issued temporary credentials in the **Developer Onboarding Hub** drawer on the Login page to test activation and dashboards:

| User Role | Temporary ID | Temporary Password | Notes / Functions |
| :--- | :--- | :--- | :--- |
| **Principal** | `TEMP-PRN-90281` | `Demo-PRN-2026` | Financial overview, calendars approval, staff logs |
| **Vice Principal** | `TEMP-VPS-10291` | `Demo-VPS-2026` | Transport setup, salary disbursement, leaf approval |
| **Admin Staff** | `TEMP-ADM-10822` | `Demo-ADM-2026` | Roster edits, student registration, ID generator |
| **Teacher** | `TEMP-TCH-20192` | `Demo-TCH-2026` | Mark attendance, upload marks, assign homework |
| **Student** | `TEMP-STD-88201` | `Demo-STD-2026` | Raise queries, check homework, view report cards |
| **Parent** | `TEMP-PAR-30821` | `Demo-PAR-2026` | Parent of Liam Chen. Pay fee balance, book teachers |
| **Receptionist** | `TEMP-REC-00192` | `Demo-REC-2026` | Visitor log, front office calls register |

---

## 🌐 Production Deployment Guide

### 1. MongoDB Database (MongoDB Atlas)
1.  Create a free database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Add a database user, whitelist connection IPs (`0.0.0.0/0` for cloud deployment).
3.  Copy the connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/school_erp`).

### 2. Backend (Render / Railway / Heroku)
1.  Link your GitHub repo to **Render** or **Railway**.
2.  Configure a new Web Service pointing to the root or specifying base directory as `/backend`.
3.  Set the start command to: `node server.js` or `npm start`.
4.  Configure the environment variables:
    *   `MONGO_URI` = *Your MongoDB Atlas string*
    *   `JWT_SECRET` = *A strong random secret key*
    *   `JWT_EXPIRE` = `2h`
    *   `NODE_ENV` = `production`
5.  Deploy and copy the generated deployment URL (e.g., `https://school-erp-backend.onrender.com`).

### 3. Frontend (Vercel / Netlify)
1.  Configure the frontend environmental variable before building:
    *   Create a `.env.production` (or add in Vercel settings):
        `VITE_API_URL` = `https://school-erp-backend.onrender.com/api` (your backend URL)
2.  Link repo to **Vercel**, select the root directory (or root build).
3.  Set Build command to: `npm run build`.
4.  Set Output directory to: `dist`.
5.  Deploy and open your live SaaS School ERP platform!
