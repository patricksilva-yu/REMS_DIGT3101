# REMS Deliverable 3

REMS is a full-stack Real Estate Management System built for DIGT3101 Deliverable 3. The repo is now a monorepo with a React/Next frontend, a Spring Boot backend, PostgreSQL persistence, and a one-command Docker Compose runtime.

## Repo Layout

- `frontend/`: Next.js 16 App Router UI for staff dashboards, public unit search, appointments, and rental applications
- `backend/`: Spring Boot 4 API with Flyway migrations, JPA persistence, billing logic, maintenance workflows, and scheduled lifecycle tasks
- `Deliverable3/`: report-support artifacts including traceability, schedule notes, meeting logs, and test/coverage placeholders
- `compose.yaml`: local stack for frontend, backend, and PostgreSQL

## Run the Stack

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080](http://localhost:8080)
- OpenAPI docs: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- PostgreSQL: `localhost:55432`

If those host ports are already in use, override them before starting Compose:

```bash
REMS_FRONTEND_PORT=3001 REMS_BACKEND_PORT=8081 REMS_DB_PORT=55433 docker compose up --build
```

Demo accounts seeded by Flyway:

- `admin@rems.com` / `demo123`
- `manager@rems.com` / `demo123`
- `leah.agent@rems.com` / `demo123`

## Local Commands

Backend compile and tests use the containerized Maven wrapper, so Maven is not required on the host:

```bash
cd backend
./mvnw test
```

Frontend commands:

```bash
cd frontend
npm ci
npm run build
```

## Core Features

- Property and unit management
- Public unit search with configurable filters
- Viewing appointment scheduling with availability and overlap checks
- Rental application intake and staff review
- Lease creation, payment-cycle pricing, utilities, invoices, and payment recording
- Maintenance request submission, escalation, and misuse-charge billing

## Deliverable Artifacts

See [Deliverable3/README.md](/Users/patrick/Developer/REMS_DIGT3101/Deliverable3/README.md) for the repo-side deliverable structure and evidence checklist.
