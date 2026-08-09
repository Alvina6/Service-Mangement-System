# ServiceFlow™ — HVAC Service Management System

ArcticAir HVAC Solutions is a centralized, web-based operations and service platform designed to manage customer requests, dispatch technicians, construct quotations, generate printable invoices, manage card payments, and automate annual maintenance contracts.

This full-stack application is built with **Next.js 14 + Tailwind CSS** (frontend) and **Express + MongoDB + JWT** (backend).

---

## Project Structure

```
serviceflow-scaffold/
├── backend/          # Express REST API (JWT auth, role middleware, MongoDB Models)
│   ├── config/       # DB connectivity config
│   ├── controllers/  # Operations and business logic
│   ├── middleware/   # JWT verification and error handlers
│   ├── models/       # Mongoose Schemas (11 Collections)
│   ├── routes/       # API endpoints definitions
│   ├── uploads/      # Static directory storing uploaded images/signatures
│   ├── seed.js       # Admin/Staff/Customer database seeder
│   └── server.js     # API Entry point
└── frontend/         # Next.js App Router Client Portal
    ├── src/
    │   ├── app/      # Page routing components and dashboards
    │   ├── components/# Reusable UI elements (Navbar, Footer, Shells, Gauges)
    │   ├── context/  # React AuthContext wrapping login/register
    │   └── lib/      # Axios API client config
```

---

## Technical Features Implemented

1. **Role-Based Security Gates**: Gated dashboards for Customers, Technicians, Dispatchers, and Administrators using JSON Web Tokens (JWT) stored in LocalStorage.
2. **In-App Notification Panel**: A poll-based header bell dropdown displaying events like Technician Assignment, Quotation Approvals, Maintenance reminders, and Invoice issues.
3. **Quotation line-item Builder**: Full line-item constructors with live pre-calculations of subtotals, tax margins, and discounts.
4. **Interactive Dispatch Desk**: Schedule assignments, dispatch field technicians, and review unassigned incoming work logs.
5. **Technician Evidence & Signature Pad**: Job tracking (Scheduled -> En Route -> In Progress -> Completed) with before/after photo evidence uploads, work note logging, and an HTML5 Canvas signature pad.
6. **Printable Invoices**: Fully branded receipt receipt layouts with direct browser printing triggers (`window.print()`).
7. **Mock Credit Card Checkout**: Front-end checkout form validating card formatting, expiry calendar checks, and security codes to settle balances.
8. **Maintenance Plan Automation**: Admin dashboard contract builders and a automated renewal checking engine scanning for contracts expiring in < 30 days.

---

## Getting Started

### 1. Prerequisite
Ensure a running MongoDB instance (local server or Atlas cluster string). The workspace contains a pre-configured MongoDB Atlas connection inside the backend `.env` file for plug-and-play testing.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed                # Creates demo credentials
npm run dev                 # Starts Express server on http://localhost:5000
```

**Seeded Accounts (Password for all: `password123`):**
* **Admin**: `admin@arcticair.com`
* **Dispatcher**: `dispatcher@arcticair.com`
* **Technician**: `technician@arcticair.com`
* **Customer**: `customer@arcticair.com`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Starts Next.js app on http://localhost:3000
```

---

## Core API Endpoints

### Authentication
* `POST /api/auth/register` — Create new accounts.
* `POST /api/auth/login` — Sign in and receive token.
* `GET /api/auth/me` — Retrieve active profile.

### Service Requests
* `POST /api/service-requests` — Customers submit a request (supports images).
* `GET /api/service-requests` — Scoped directory of requests.
* `PUT /api/service-requests/:id/assign` — Assign technician and date.

### Uploads & File Management
* `POST /api/upload` — Uploads an image/signature to local `backend/uploads/` and returns URL.

### Quotations
* `POST /api/quotations` — Create line-item quotes (Admin/Dispatcher).
* `PUT /api/quotations/:id/send` — Send quotation to client.
* `PUT /api/quotations/:id/respond` — Accept/decline quotation (Customer).

### Job Tracking
* `PUT /api/jobs/:id` — Tech updates job (Scheduled -> En Route -> In Progress -> Completed), submits notes, before/after photos, and signature url.

### Invoices & Payments
* `POST /api/invoices` — Generate invoice.
* `POST /api/invoices/:id/payments` — Record card/manual payment against invoice.

### Maintenance Contracts
* `POST /api/maintenance-contracts` — Configure service plans.
* `POST /api/maintenance-contracts/check-reminders` — Scan expiring agreements and email/notify users.
* `PUT /api/maintenance-contracts/:id/renew` — Extend contract for 1 year.
