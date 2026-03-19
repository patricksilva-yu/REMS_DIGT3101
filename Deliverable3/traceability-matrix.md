# Traceability Matrix

| Project Description Requirement | Implemented In |
| --- | --- |
| Property and store unit management | Staff property pages, `/api/properties`, `/api/units` |
| Tenant search and viewing appointment scheduling | Public portal `/spaces`, `/api/public/units/search`, `/api/public/appointments`, overlap checks in backend |
| Rental application processing and lease management | Public application flow, `/api/public/applications`, `/api/applications/{id}/review`, `/api/leases` |
| Rent and utility charge calculation | `/api/invoices`, `/api/payments`, `/api/utilities/*`, `BillingService` |
| Maintenance request handling and escalation | `/api/maintenance`, escalation rules in `MaintenanceService`, misuse charges attached through `BillingService` |
| Repository build/run instructions | Root `README.md`, `compose.yaml`, backend `mvnw` |
| Automated coverage artifact | `backend` JaCoCo plugin output, `Deliverable3/coverage/` |
