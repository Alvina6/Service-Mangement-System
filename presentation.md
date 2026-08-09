# ServiceFlow™ HVAC Service Management System
## ArcticAir HVAC Solutions Case Study & Presentation
---

### Slide 1: Project Overview
* **Product**: ServiceFlow™ HVAC Service Management System
* **Client**: ArcticAir HVAC Solutions (USA)
* **Goal**: Transition from manual spreadsheets, paperwork, and scattered messaging to a centralized, role-based, full-stack service management platform.
* **Duration**: 7-Day Agile Sprint
* **Deliverables**: Centralized dashboards, quotation constructor, invoice printing, payment processing, maintenance automation, and image uploads.

---

### Slide 2: Business Challenges Addressed
* **Scattered Requests**: Incoming orders from WhatsApp, Facebook, email consolidated into a single public Request Portal.
* **Overlapping Schedules**: Unassigned requests mapped in real-time to active, available technicians on the Dispatch Board.
* **Manual Estimations**: Automated Quotation builder with line-items, tax calculations, and discount percentages.
* **Slow Billing**: Direct Admin Invoice generation linked to accepted quotes with printable receipt layouts.
* **Missed Renewals**: Automation scanner checking maintenance expiration dates within 30 days and alerting customers.

---

### Slide 3: Functional Roles & Gatekeeping
* **Guest Visitor**: Browse services, check service coverage areas, sign up as a new customer, or submit inspection/repair requests.
* **Customer**: Track service schedules, accept/reject quotes, view printable invoices, make mock card payments, and renew expiring plans.
* **Technician**: View daily job routes, update status (Scheduled -> En Route -> In Progress -> Completed), leave work notes, upload before/after photos, and draw signatures.
* **Dispatcher**: Assign available technicians to pending requests, schedule appointments, and build quotation drafts.
* **Administrator**: Full system authority to configure customer plans, generate invoices, record payments, scan reminders, and view performance charts.

---

### Slide 4: Technology Stack
* **Frontend**: Next.js 14 (App Router) styled with Vanilla Tailwind CSS for mobile-first responsiveness. Data visualization via Recharts (bar/pie charts).
* **Backend**: Node.js & Express API with JSON Web Token (JWT) role-based guard middleware.
* **Database**: MongoDB Atlas using Mongoose ODM schemas for relationships.
* **File Uploads**: Local server storage using `multer` with express-static routing, providing standalone image and signature receipt support.

---

### Slide 5: Dispatch Board & Quotation Builder
* **Dynamic Dispatching**: Filter available technicians based on active skills and schedule times.
* **Line-Item Constructor**: Dispatchers & Admins can add multiple line-items (Labor, Equipment, Other) with quantities and prices.
* **Real-time Calculations**: Real-time frontend subtotal and total calculations including discount offsets and local tax margins.
* **One-Click Delivery**: Transition draft quotes to customers instantly, creating in-app approval notification cards.

---

### Slide 6: Technician Workflow & Evidence Capture
* **Job Progressions**: Structured flow (Scheduled -> En Route -> In Progress -> Completed) preventing out-of-order logs.
* **Visual Evidence**: Multer-backed upload endpoints letting technicians upload "before" state photos (upon arrival) and "after" state photos (upon fix completion).
* **Signature Capture**: HTML5 Canvas signature pad integrated directly within the completion prompt. Exports base64 graphics, uploads to static routes, and saves to database records.

---

### Slide 7: Invoicing & Checkout Flow
* **Direct Billing**: Invoice generation linked to accepted quotes or jobs, auto-calculating total amounts due.
* **Printable Invoices**: Fully styled, clean invoice receipt overlay for customers and admins with printing triggers (`window.print()`).
* **Mock Payments Portal**: Seamless Checkout modal for debit/credit cards. Validates input parameters (card structure, expiry format, CVV length) and executes payments to update outstanding balances.

---

### Slide 8: Maintenance Plans & Automation
* **Contract Configuration**: Admins configure custom plans (Basic, Standard, Premium) matching specific visits, prices, and date ranges.
* **Renewal Scanner**: Admin panel action that calls `/api/maintenance-contracts/check-reminders`, searching for contracts expiring < 30 days and alerting customers.
* **Customer Extensions**: Expired/expiring plans show a renewal trigger, allowing clients to extend contracts for 1 year instantly.

---

### Slide 9: Scalability & Future Roadmap
* **Google Maps API**: Ready-to-go maps integration using technician addresses for dispatch tracking.
* **Gateway Upgrades**: Ready to replace mock checkout forms with Stripe / PayPal SDK scripts.
* **Automated Alerts**: Webhooks prepared to wire email templates (SendGrid) and SMS alerts (Twilio) to the notification controller.
* **Inventory Control**: Models shapeable to link equipment records with live repair inventory levels.
