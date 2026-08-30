# ServiceFlow — HVAC Service Management System

ServiceFlow is a full-stack service management platform for HVAC businesses, built with a Node.js/Express backend and a Next.js frontend. It handles the end-to-end lifecycle of a service business — from customer service requests and quotations, to job scheduling, invoicing, and maintenance contracts.

---

## 🏆 IBM TechXchange 2026 Pre-conference Dev Day Hackathon Submission

### Theme

**Build with purpose using IBM Bob 2.0**

### Problem Statement

In large, actively-developed codebases with multiple contributors, a developer picking up a new feature request or joining the project spends hours understanding the architecture, locating the relevant files across backend and frontend, and assessing risks — before writing a single line of code. This leads to wasted time, missed edge cases, and rework, especially in projects like ServiceFlow with many interconnected modules (auth, service requests, quotations, jobs, invoices, maintenance contracts).

### Our Solution: Bob Codebase Navigator

We used **IBM Bob 2.0** to build an agentic developer workflow that takes a high-level feature request and autonomously guides it from understanding to tested implementation, with a mandatory human approval gate before any code is changed.

**Workflow:**

```
Feature Request
      │
      ▼
Codebase & Document Understanding (Bob reads README, code, docs)
      │
      ▼
Parallel Subagent Analysis
      ├── Architecture Analyst
      ├── Code Analyst
      ├── Documentation Analyst
      └── Testing Analyst
      │
      ▼
Risk Assessment & Findings Synthesis
      │
      ▼
Implementation Plan (file-level, risk-classified, decision points flagged)
      │
      ▼
🛑 Developer Approval Gate
      │
      ▼
Implementation (Bob Agent mode, one sub-task at a time)
      │
      ▼
Automated Testing
```

### Demonstrated Bob 2.0 Capabilities

| Feature                    | How we used it                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document Understanding** | Bob read the project README and existing code to build a full context/onboarding summary before touching anything.                                                      |
| **Agent Mode & Subagents** | 4 specialized subagents (Architecture, Code, Documentation, Testing Analysts) independently investigated the codebase and returned structured, evidence-based findings. |
| **Parallel Tasks**         | Multiple backend files and modules were analyzed simultaneously during the investigation phase rather than sequentially.                                                |
| **Approval Gate**          | Bob produced a full implementation plan with a 10-item approval checklist and did **not** modify any code until it was explicitly approved by the developer.            |

### Case Study: Adding Google OAuth Authentication

As a real-world proof of concept, we asked Bob Codebase Navigator to handle the feature request: _"Add Google OAuth authentication to the application."_

**What Bob delivered:**

- A full architecture trace of the existing JWT-based auth system before proposing any change
- 4 parallel subagent reports covering architecture, exact files/functions, documentation impact, and testing gaps
- A written implementation plan (`google-oauth-plan.md`) with a Mermaid flow diagram, file-by-file change table, and 3 critical risks identified **before** implementation:
  - Helmet CSP would silently block Google's sign-in script
  - Missing `GOOGLE_CLIENT_ID` at startup should fail loudly, not silently
  - The `password` field's required validator needed to become conditional, or Google-only users could never save to MongoDB
- Explicit flags for decisions that needed a human call (e.g. automatic vs. explicit account linking for a Google email matching an existing password account)

**After approval, Bob implemented:**

|                         | Count      |
| ----------------------- | ---------- |
| Files modified          | 7          |
| Files created           | 9          |
| Automated tests written | 43         |
| Tests passing           | 43 / 43 ✅ |

Zero code was touched until the plan was reviewed and approved by the developer — the workflow always stopped at the approval gate.

### Impact

| Task                                      | Manual (estimate) | With Bob Codebase Navigator |
| ----------------------------------------- | ----------------- | --------------------------- |
| Understand existing auth architecture     | ~1 hr             | ~5 min                      |
| Map feature request to relevant files     | ~45 min           | ~3 min                      |
| Write implementation plan + risk analysis | ~1 hr             | ~5 min                      |
| Implement feature + write 43 tests        | ~4–5 hrs          | ~15–20 min                  |
| **Total**                                 | **~7 hrs**        | **~30 min**                 |

This reflects the core hackathon goal: reducing the time, effort, and errors involved in a real developer workflow — here, feature onboarding and implementation — using IBM Bob 2.0's Agent mode, subagents, parallel tasks, and document understanding.

### Evidence of Bob Usage

Bob task session summary screenshots (Task ID, Workspace, Context Length, Bobcoin consumption, and completion status) for every stage of this workflow are available in [`bob_sessions/`](bob_sessions/):

- Codebase & document understanding
- Parallel subagent analysis (architecture, code, docs, testing)
- Implementation plan generation
- Implementation & automated testing

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Frontend:** Next.js (React), Context API for auth state
- **Testing:** Jest, Supertest, mongodb-memory-server, React Testing Library
- **AI Development Tool:** IBM Bob 2.0 (IDE, Agent mode, Subagents)

## 📂 Project Structure

```
service-management-system/
├── backend/
│   ├── controllers/       # Request handlers (auth, quotations, jobs, invoices, etc.)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── __tests__/          # Backend test suites
│   └── server.js           # App entry point
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # Reusable UI components
│       ├── context/         # AuthContext and other React context providers
│       └── __tests__/       # Frontend test suites
├── bob_sessions/            # Evidence of IBM Bob task sessions (hackathon requirement)
└── google-oauth-plan.md     # Bob-generated implementation plan for the OAuth feature
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS)
- MongoDB instance (local or hosted)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_GOOGLE_CLIENT_ID and API base URL
npm run dev
```

### Google OAuth Setup

1. Create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/) (OAuth consent screen → Credentials → Create Credentials → OAuth Client ID → Web application).
2. Add your Client ID to both env files:

```bash
# backend/.env
GOOGLE_CLIENT_ID=<your-id>.apps.googleusercontent.com

# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same-id>.apps.googleusercontent.com
```

3. Start both servers — the "Sign in with Google" button will appear on `/login` below the password form.

### Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## ✨ Core Features

- Customer service request submission and tracking
- Quotation generation and approval workflow
- Job scheduling and status management
- Invoicing
- Maintenance contract management
- Role-based access control (RBAC)
- Local (email/password) and Google OAuth authentication

## 🔐 API Endpoints (Auth)

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| POST   | `/api/auth/register` | Register with email/password               |
| POST   | `/api/auth/login`    | Login with email/password                  |
| POST   | `/api/auth/google`   | Login/register via Google OAuth (ID token) |
| GET    | `/api/auth/me`       | Get current authenticated user             |

## 📄 License

This project was built for the IBM TechXchange 2026 Pre-conference Dev Day Hackathon.
