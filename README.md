# SmartHire — Intelligent Job Portal & Application Tracking System

A full-stack, responsive web application connecting job seekers, recruiters, and platform administrators through a centralized digital platform with **authentic real-time recruiter view tracking**, **interactive visual ATS timelines**, and **live interview scheduling**.

---

## 🚀 Key Features

1. **Candidate Portal (`/candidate`)**:
   - Job Discovery with keyword search, location, work mode (Remote/Hybrid/On-site), salary, and closing deadline countdown.
   - 1-Click Application with resume attachment and custom cover note.
   - **Authentic Recruiter View Tracking**: See the exact date & time when the recruiter opens your application and resume.
   - **Interactive ATS Timeline**: Visual milestone tracker (Submitted ➔ Viewed ➔ Under Review ➔ Shortlisted ➔ Interview Scheduled ➔ Offer Extended ➔ Hired).
   - **Interview Management**: View date, time, mode (Online/In-person/Phone), Google Meet link or office address, and confirm attendance or request reschedule.
   - PDF Resume Manager and saved jobs shortlist.

2. **Recruiter Portal (`/recruiter`)**:
   - Company Dashboard with recruitment statistics (Active Jobs, Applications, Shortlisted, Interviews, Hired).
   - Job vacancy management and publishing.
   - **Applicant Review & Genuine View Tracking**: Access candidate profile and PDF resume (automatically records view events and timestamps).
   - **Candidate Shortlisting**: 1-click status change to `SHORTLISTED` which updates the candidate's visual ATS timeline and triggers real-time in-app notification.
   - **Interview Scheduling Modal**: Pick interview date, time, mode, meeting URL/location, and interviewer instructions.

3. **Administrator Portal (`/admin`)**:
   - System-wide metrics (candidates, recruiters, companies, active jobs, applications, completed hires).
   - User account moderation (suspend/reactivate accounts with audit logs).
   - Employer company verification (verify/reject company profiles).

4. **Real-time Notifications**:
   - Powered by Socket.IO with sound/visual toast popups and badge count dropdown.

---

## 🔑 Quick Demo Accounts

SmartHire includes a **1-Click Role Switcher** in the top navigation bar. You can also sign in with the following seeded accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Candidate** | `alex.dev@gmail.com` | `Candidate@123` | Senior Full Stack Engineer |
| **Recruiter** | `recruiter@technova.com` | `Recruiter@123` | TechNova Solutions |
| **Admin** | `admin@smarthire.com` | `Admin@123` | Chief Administrator |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Socket.IO Client, React Router v6.
- **Backend:** Node.js, Express.js, Prisma ORM, SQLite (`dev.db`), Socket.IO, Multer, JWT, bcryptjs, Zod.
- **Testing:** Vitest + Supertest integration tests.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install
npx prisma db push
node prisma/seed.js

# Frontend
cd ../frontend
npm install
```

### 2. Run the Application Locally
In two separate terminals:

```bash
# Terminal 1: Backend Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests
```bash
cd backend
npm test
```
All 6 end-to-end integration tests verify:
1. Candidate applies ➔ saved in database with `SUBMITTED` timeline event
2. Duplicate application prevention
3. Recruiter views application ➔ authentic view event and timestamp recorded
4. Recruiter shortlists candidate ➔ timeline updated and candidate notified
5. Interview scheduled ➔ candidate receives date, time, mode, and location/meeting link
6. Candidate confirms interview attendance
