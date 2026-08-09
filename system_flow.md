# System Operational Flow Diagram

Below is the operational system flow for the ServiceFlow™ HVAC Service Management System, outlining the lifecycle of customer service requests, quotations, dispatch scheduling, job completion, and invoicing/payments.

```mermaid
flowchart TD
    subgraph Customer Portal
        A[Guest Visitor] -->|Registers / Logs in| B[Customer User]
        B -->|Submits Service Request with Photos| C{Request Submitted}
        C -->|Creates Notification| D[Notification: Request Confirmed]
    end

    subgraph Dispatch Board
        E[Dispatcher / Admin] -->|Views Pending Requests| F{Assign Tech & Schedule}
        F -->|Creates Job| G[Job: Scheduled]
        G -->|Creates Notification| H[Notification: Tech Assigned]
        
        E -->|Builds Quotation with Line Items| I[Quotation: Draft]
        I -->|Sends to Customer| J[Quotation: Sent]
        J -->|Creates Notification| K[Notification: Quote Ready]
    end

    subgraph Customer Portal (Decision)
        B -->|Views Quotation| L{Accept or Reject?}
        L -->|Reject| M[Quotation: Rejected]
        L -->|Accept| N[Quotation: Accepted]
    end

    subgraph Technician Mobile App
        O[Technician User] -->|Views Daily Jobs| P{Start Job}
        P -->|Arrives & Uploads Before Photo| Q[Job: In Progress]
        Q -->|Completes Work & Uploads After Photo| R[Work Completed]
        R -->|Draws Customer Signature on Canvas| S{Mark Completed}
        S -->|Updates Request & Job| T[Job & Request: Completed]
        T -->|Creates Notification| U[Notification: Service Complete]
    end

    subgraph Admin Billing & Maintenance
        V[Administrator] -->|Generates Invoice for Accepted Quote| W[Invoice: Unpaid]
        W -->|Creates Notification| X[Notification: Invoice Ready]
        
        B -->|View Invoice & Print Receipt| Y[Print Layout]
        B -->|Enters Mock Card & Pays Balance| Z[Payment Created]
        Z -->|Updates Invoice Status| AA[Invoice: Paid]
        
        V -->|Sets up Customer Maintenance Contract| AB[Contract Active]
        V -->|Triggers Renewal Scan| AC{Contract Expiring < 30 Days?}
        AC -->|Yes| AD[Contract Status: Expiring Soon]
        AD -->|Creates Notification| AE[Notification: Renewal Reminder]
        AC -->|No| AF[Remain Active]
    end

    C -.-> E
    K -.-> B
    N -.-> O
    T -.-> V
    X -.-> B
```
