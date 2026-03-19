# REMS Presentation Evidence

## 1. Requirements, Features, and Design Decisions

### Problem
The project aims to support day-to-day real estate operations in one system instead of tracking properties, tenants, leases, payments, and maintenance separately.

### Core users
- Property managers
- Leasing staff
- Maintenance staff
- Tenants

### Core implemented workflows
- Create and manage properties and units
- Create and manage tenants
- Create a lease for an available unit
- Record a payment for an active lease
- Submit and update a maintenance request
- View a backend-driven dashboard summary

### Key design decisions
- `Next.js` for the application framework and UI
- `Prisma + SQLite` for a simple local backend and demo-ready persistence
- Seeded dummy data so the demo can be reset and repeated reliably
- Backend API routes for the main business entities instead of frontend-only local state
- Dashboard wired to live backend data so the home screen reflects actual records

## 2. Testing and Software Quality Evidence

### Automated smoke tests
The project now includes backend smoke tests that verify:
- seeded dashboard metrics match the baseline data
- lease creation persists and marks the selected unit as occupied
- payment recording persists a completed payment
- maintenance creation and status updates persist correctly

Run with:

```bash
npm run test
```

### Manual verification used
- `npx next build --webpack` passes
- Core create/update flows were tested against the running app
- `/api` routes can be checked directly against the UI
- `npm run db:seed` restores the known demo baseline

## 3. Presentation-Safe Limitations

These areas should be described as future work, not fully complete features:
- Authentication and login
- Role-based authorization enforcement
- Settings persistence
- Broader automated test coverage
- Production deployment and multi-user hosting

## 4. Recommended Live Demo Order

1. Dashboard
2. Properties and units
3. Tenants
4. Leases
5. Payments
6. Maintenance

This order works well because each step builds on the previous one and keeps the story easy to follow.
