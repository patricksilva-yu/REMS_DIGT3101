# Deliverable 3 Repository Artifacts

This folder collects the repository-side evidence required by the DIGT3101 Deliverable 3 instructions.

## Contents

- `source-code-reference.md`: where the implemented frontend, backend, and infra live
- `traceability-matrix.md`: requirement-to-feature mapping based on the project description
- `backlog-and-schedule.md`: final delivery order and backlog notes
- `meeting-logs.md`: implementation/testing discussion log
- `tests/README.md`: test evidence inventory and current verification references
- `coverage/README.md`: JaCoCo references and current coverage summary

## Evidence Workflow

1. Run `docker compose up --build`.
2. Run backend tests with `cd backend && ./mvnw test`.
3. Save the generated JaCoCo HTML report or screenshot under `coverage/`.
4. Save any UI/API test screenshots or terminal captures under `tests/`.
5. Reference the files from the final PDF report.

## Current Verification

Verified on `2026-03-19`:

- `backend`: `./mvnw test` passed, including the Testcontainers-backed integration test
- `frontend`: `npm run build` passed with the production webpack build
- `compose`: `docker compose up -d --force-recreate` started all three services successfully
- Runtime check: the `frontend` container successfully fetched `http://backend:8080/api/dashboard` and received seeded metrics
