# Entity-Relationship (ER) Diagram

Below is the entity-relationship schema for the ServiceFlow™ HVAC Service Management System, showing database entities, fields, data types, and primary/foreign key connections.

```mermaid
erDiagram
    USER ||--o{ SERVICE_REQUEST : submits
    USER ||--o{ QUOTATION : customer_ref
    USER ||--o{ QUOTATION : created_by
    USER ||--o{ JOB : customer_ref
    USER ||--o{ JOB : technician_ref
    USER ||--o{ JOB : dispatcher_ref
    USER ||--o{ MAINTENANCE_CONTRACT : customer_ref
    USER ||--o{ INVOICE : customer_ref
    USER ||--o{ PAYMENT : customer_ref
    USER ||--o{ NOTIFICATION : receives

    SERVICE_REQUEST ||--o{ QUOTATION : results_in
    SERVICE_REQUEST ||--o| JOB : schedules

    QUOTATION ||--o| INVOICE : bills

    JOB ||--o| INVOICE : invoices

    INVOICE ||--o{ PAYMENT : has_payments

    USER {
        ObjectId id PK
        string name
        string email
        string password
        string role "admin | dispatcher | technician | customer"
        string phone
        string address
        string city
        string[] skills "technician only"
        boolean isAvailable "technician only"
        boolean isActive
        date createdAt
        date updatedAt
    }

    SERVICE_REQUEST {
        ObjectId id PK
        ObjectId customer FK
        string requestType "installation | repair | inspection | maintenance | emergency"
        string description
        string[] images
        date preferredDate
        string address
        string city
        boolean isEmergency
        string status "pending | assigned | in_progress | completed | cancelled"
        ObjectId assignedTechnician FK
        ObjectId assignedDispatcher FK
        date scheduledDate
        date createdAt
        date updatedAt
    }

    QUOTATION {
        ObjectId id PK
        ObjectId serviceRequest FK
        ObjectId customer FK
        ObjectId createdBy FK
        LineItem[] lineItems
        number taxPercent
        number discountPercent
        number subtotal
        number total
        string status "draft | sent | accepted | rejected | expired"
        date validUntil
        string notes
        date createdAt
        date updatedAt
    }

    JOB {
        ObjectId id PK
        ObjectId serviceRequest FK
        ObjectId customer FK
        ObjectId technician FK
        ObjectId dispatcher FK
        date scheduledDate
        string status "scheduled | en_route | in_progress | completed | cancelled"
        string serviceNotes
        string[] beforePhotos
        string[] afterPhotos
        string customerSignatureUrl
        date completedAt
        date createdAt
        date updatedAt
    }

    MAINTENANCE_CONTRACT {
        ObjectId id PK
        ObjectId customer FK
        string planName "Basic | Standard | Premium"
        number visitsPerYear
        number visitsCompleted
        number price
        date startDate
        date endDate
        date nextVisitDate
        string status "active | expiring_soon | expired | cancelled"
        boolean autoRenew
        boolean reminderSent
        date createdAt
        date updatedAt
    }

    INVOICE {
        ObjectId id PK
        string invoiceNumber "unique"
        ObjectId customer FK
        ObjectId quotation FK
        ObjectId job FK
        number amount
        number amountPaid
        date dueDate
        string status "unpaid | partially_paid | paid | overdue"
        date issuedAt
        date createdAt
        date updatedAt
    }

    PAYMENT {
        ObjectId id PK
        ObjectId invoice FK
        ObjectId customer FK
        number amount
        string method "credit_card | ach | cash | check"
        string reference
        date createdAt
        date updatedAt
    }

    EQUIPMENT {
        ObjectId id PK
        ObjectId customer FK
        string name
        string modelNumber
        string serialNumber
        date installDate
        date lastServiceDate
        string notes
        date createdAt
        date updatedAt
    }

    NOTIFICATION {
        ObjectId id PK
        ObjectId user FK
        string type "service_request_confirmation | technician_assignment | appointment_reminder | quotation_approval | invoice_generated | maintenance_due_reminder | general"
        string title
        string message
        boolean isRead
        ObjectId relatedId
        date createdAt
        date updatedAt
    }
```
