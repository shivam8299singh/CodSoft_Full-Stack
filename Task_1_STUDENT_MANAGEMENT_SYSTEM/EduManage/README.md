# EduManage — Modern Student Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)](https://www.postgresql.org/)

**EduManage** is a modern, enterprise-ready full-stack Student Management System engineered for colleges, universities, and academic institutions. It centralizes and streamlines student enrollment, faculty management, attendance logging, examinations, grading, tuition fee tracking, and academic transcripts through role-based access control (RBAC).

---

## 1. Project Overview

EduManage provides institutional stakeholders with designated, secure portals:
- **Administrator Portal**: Comprehensive oversight of university admissions, academic departments, degree courses, teacher allocations, fee ledger audits, attendance trends, and systemic settings.
- **Teacher (Faculty) Portal**: Daily classroom roll call, subject syllabi oversight, student roster reviews, examination creation, and mark assessments with automated letter grade calculation.
- **Student Portal**: Self-service student dashboard featuring attendance percentages, GPA progressions, fee invoice status, examination timetables, and official transcripts.

---

## 2. Key Features

- **Role-Based Access Control (RBAC)**: Distinct permissions and views for Administrators, Faculty, and Students.
- **One-Click Demo Credentials**: Instant login buttons on the login screen for testing each role without typing credentials.
- **Interactive Dashboards**: Powered by **Recharts** for enrollment metrics, 7-day attendance trends, fee collection status, and grade distribution.
- **Student Dossiers**: Detailed student profiles with dedicated tabs for bio, attendance history, examination marks, fee ledger, and official transcript.
- **Classroom Roll Call**: Bulk attendance interface with single-click "Mark All Present", "Late", or "Absent" and real-time status counters.
- **Examination & Grading Engine**: Built-in grade calculation (A+, A, B+, B, C, D, F) and passing score validations.
- **Tuition Fee Tracking**: Real-time balance calculations, payment recording modal, and downloadable invoice views.
- **Academic Transcripts**: Clean, verifiable transcript format with semester GPA and cumulative CGPA.
- **Responsive SaaS UI**: Engineered with Tailwind CSS, supporting mobile drawers, tablet collapsible navigation, and desktop viewports.

---

## 3. Technology Stack

### Frontend (`/client`)
- **React 18** with **Vite 6**
- **React Router DOM 6** (Dynamic nested routes & ProtectedRoute guards)
- **Tailwind CSS 3.4** (Custom design tokens & responsive components)
- **Lucide React** (Consistent iconography)
- **Recharts** (Interactive data visualization)
- **Axios** (Centralized API client with JWT interceptors)

### Backend (`/server`)
- **Node.js** & **Express.js** (RESTful API architecture)
- **Prisma ORM 5.22** (Relational models & migrations)
- **PostgreSQL** (Primary production database)
- **JWT (JSON Web Tokens)** & **bcryptjs** (Secure authentication & password hashing)
- **In-Memory Fallback Store** (Zero-friction local dev fallback pre-seeded with all demo data if PostgreSQL is not active)

---

## 4. Folder Structure

```
Codsoft/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable Button, Input, Modal, Table, etc.
│   │   │   └── dashboard/       # StatCard, KPI cards
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── layouts/             # DashboardLayout, Sidebar, Navbar
│   │   ├── pages/
│   │   │   ├── auth/            # LoginPage with demo account buttons
│   │   │   ├── admin/           # AdminDashboard, Students, Teachers, Fees, etc.
│   │   │   ├── teacher/         # TeacherDashboard, Attendance, Exams, etc.
│   │   │   └── student/         # StudentDashboard, Results, Transcript, Fees
│   │   ├── routes/              # AppRoutes, ProtectedRoute
│   │   ├── services/            # Axios API singleton
│   │   ├── utils/               # Formatters for dates, currency, grades
│   │   ├── App.jsx              # Main App wrapper
│   │   ├── index.css            # Tailwind directives & styles
│   │   └── main.jsx             # React entrypoint
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js + Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL relational schema
│   │   └── seed.js              # Database seeder (30 students, 5 teachers, etc.)
│   ├── src/
│   │   ├── config/              # db.js, demoData.js
│   │   ├── controllers/         # auth, student, teacher, course, attendance, exam, fee
│   │   ├── middleware/          # auth.js (JWT & RBAC), validation
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # dataStore.js (In-memory fallback & mock engine)
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entrypoint
│   ├── .env                     # Server environment variables
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 5. Prerequisites

- **Node.js**: `v18.0.0` or higher (verified on `v24.18.0`)
- **npm**: `v9.0.0` or higher (verified on `v11.16.0`)
- **PostgreSQL**: Optional for immediate testing (pre-seeded in-memory store activates automatically if PostgreSQL is not running locally).

---

## 6. Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edumanage?schema=public"
JWT_SECRET="edumanage_jwt_super_secret_key_2026_educational_system"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. PostgreSQL & Prisma Setup

To persist data to your local or cloud PostgreSQL database (e.g. Neon, Supabase, or local Postgres):

1. **Configure `DATABASE_URL`** in `server/.env` with your PostgreSQL credentials.
2. **Push Schema to Database**:
   ```bash
   cd server
   npx prisma db push
   ```
3. **Seed Database with Demo Data**:
   ```bash
   npm run prisma:seed
   ```
   Or run the all-in-one setup command:
   ```bash
   npm run db:setup
   ```

*(Note: If you run without PostgreSQL active, the server automatically starts in resilient demo mode pre-seeded with 1 Admin, 5 Teachers, and 30 Students across all modules).*

---

## 8. Installation & Running the Application

### Option A: Running Backend
Open a terminal in the project directory:
```bash
cd server
npm install
npm run dev
```
Backend API will be running at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### Option B: Running Frontend
Open a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 9. Demo Credentials

The login page includes **one-click buttons** to test any role:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@edumanage.com` | `admin123` |
| **Teacher (Faculty)** | `teacher@edumanage.com` | `teacher123` |
| **Student** | `student@edumanage.com` | `student123` |

Additional faculty accounts:
- `sarah.jenkins@edumanage.com` / `teacher123`
- `david.ross@edumanage.com` / `teacher123`
- `emily.clark@edumanage.com` / `teacher123`

---

## 10. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate and receive JWT token + user profile.
- `GET  /api/auth/me` — Retrieve current authenticated user session.
- `POST /api/auth/forgot-password` — Password reset notification.

### Dashboards (`/api/dashboard`)
- `GET  /api/dashboard/admin` — Institutional KPI summaries, Recharts datasets, and recent enrollments.
- `GET  /api/dashboard/teacher` — Teaching schedule, assigned subjects, and student counts.
- `GET  /api/dashboard/student` — Attendance percentage, CGPA, fee status, and exam schedule.

### Student Management (`/api/students`)
- `GET    /api/students` — Filterable student directory (search, department, semester, pagination).
- `GET    /api/students/:id` — Complete student dossier with attendance, marks, and fees.
- `POST   /api/students` — Enroll a new student (Admin only).
- `PUT    /api/students/:id` — Update student details (Admin only).
- `DELETE /api/students/:id` — Remove student from directory (Admin only).

### Teacher Management (`/api/teachers`)
- `GET    /api/teachers` — Faculty directory with assigned subjects.
- `GET    /api/teachers/:id` — Faculty member profile.
- `POST   /api/teachers` — Register new faculty member (Admin only).
- `PUT    /api/teachers/:id` — Update faculty profile.
- `DELETE /api/teachers/:id` — Delete faculty member.
- `POST   /api/teachers/:id/assign-subjects` — Assign subjects/modules to instructor.

### Curriculum (`/api`)
- `GET  /api/departments` & `POST /api/departments` — Department management.
- `GET  /api/courses` & `POST /api/courses` — Degree courses management.
- `GET  /api/subjects` & `POST /api/subjects` — Subject modules and credit allocations.

### Attendance (`/api/attendance`)
- `GET  /api/attendance` — Filter attendance by course, subject, or date.
- `POST /api/attendance` — Batch submit daily classroom roll call.
- `GET  /api/attendance/student/:studentId` — Student attendance history and percentage.

### Examinations & Grading (`/api/exams`)
- `GET  /api/exams` — List scheduled examinations.
- `POST /api/exams` — Schedule new examination.
- `POST /api/exams/:examId/results` — Submit evaluated marks for students.
- `GET  /api/exams/student/:studentId` — Retrieve student results.

### Fees (`/api/fees`)
- `GET  /api/fees` — Fee records ledger with status filters (PAID, PARTIAL, PENDING).
- `POST /api/fees` — Generate new fee invoice.
- `PUT  /api/fees/:id/pay` — Record incoming fee payment.
- `GET  /api/fees/student/:studentId` — Student fee balance and receipt history.

### Academic Transcripts (`/api/academic`)
- `GET  /api/academic/student/:studentId` — Official transcript breakdown with term GPA and CGPA.
- `POST /api/academic` — Update student semester academic standing.

---

## 11. Screenshots Section Placeholder

| Screen | Description |
|---|---|
| **Login Portal** | Split-screen authentication with one-click demo role buttons |
| **Admin Dashboard** | Recharts analytics for enrollment, attendance trends, and fee collection |
| **Student Directory** | Searchable data table with department filters, pagination, and dossier modal |
| **Teacher Roll Call** | Interactive roll call with Present/Late/Absent toggles |
| **Marks Grading** | Inline mark entry sheet with live letter grade calculation |
| **Student Portal** | Visual attendance gauge, GPA trend, and fee statement |

---

## 12. Future Enhancements

- PDF generation for official semester report cards and fee receipts.
- Direct LMS integration for assignment file uploads.
- Real-time notifications via WebSockets or email triggers for fee due dates.
- Biometric attendance reader hardware integration via REST webhooks.