import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import { POST as createLease } from "@/app/api/leases/route";
import { POST as createPayment } from "@/app/api/payments/route";
import {
  PATCH as updateMaintenanceRequest,
  POST as createMaintenanceRequest,
} from "@/app/api/maintenance/route";
import { prisma } from "@/lib/prisma";
import { getDashboardSnapshot } from "@/lib/server-data";
import { seedDatabase } from "@/prisma/seed";

beforeEach(async () => {
  await seedDatabase();
});

test("dashboard snapshot matches the seeded baseline", async () => {
  const snapshot = await getDashboardSnapshot();

  assert.equal(snapshot.totalProperties, 3);
  assert.equal(snapshot.totalUnits, 10);
  assert.equal(snapshot.occupiedUnits, 5);
  assert.equal(snapshot.availableUnits, 3);
  assert.equal(snapshot.occupancyRate, 50);
  assert.equal(snapshot.activeLeases, 5);
  assert.equal(snapshot.totalTenants, 5);
  assert.equal(snapshot.totalMonthlyRent, 16400);
  assert.equal(snapshot.overdueAmount, 1200);
  assert.equal(snapshot.openMaintenance, 3);
  assert.equal(snapshot.highPriorityMaintenance, 2);
});

test("creating a lease persists the lease and updates the unit to occupied", async () => {
  const response = await createLease(
    new Request("http://localhost/api/leases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-4",
        unitId: "unit-2",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        monthlyRent: 1900,
        depositAmount: 3800,
      }),
    })
  );

  assert.equal(response.status, 201);
  const lease = await response.json();

  assert.equal(lease.tenantId, "tenant-4");
  assert.equal(lease.unitId, "unit-2");
  assert.equal(lease.status, "active");

  const updatedUnit = await prisma.unit.findUnique({ where: { id: "unit-2" } });
  assert.ok(updatedUnit);
  assert.equal(updatedUnit.status, "occupied");
});

test("recording a payment persists a completed payment for the selected lease", async () => {
  const response = await createPayment(
    new Request("http://localhost/api/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leaseId: "lease-1",
        amount: 2500,
        date: "2026-03-01",
        reference: "TEST-PAY-001",
      }),
    })
  );

  assert.equal(response.status, 201);
  const payment = await response.json();

  assert.equal(payment.leaseId, "lease-1");
  assert.equal(payment.reference, "TEST-PAY-001");
  assert.equal(payment.status, "completed");

  const storedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
  assert.ok(storedPayment);
  assert.equal(storedPayment.amount, 2500);
  assert.equal(storedPayment.status, "completed");
});

test("creating and updating maintenance persists the status change", async () => {
  const createResponse = await createMaintenanceRequest(
    new Request("http://localhost/api/maintenance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantId: "tenant-2",
        unitId: "unit-5",
        category: "hvac",
        description: "Airflow is weak in the front retail area",
        urgency: "high",
      }),
    })
  );

  assert.equal(createResponse.status, 201);
  const createdRequest = await createResponse.json();
  assert.equal(createdRequest.status, "new");

  const updateResponse = await updateMaintenanceRequest(
    new Request("http://localhost/api/maintenance", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: createdRequest.id,
        status: "completed",
        notes: "Filter replaced and airflow restored",
      }),
    })
  );

  assert.equal(updateResponse.status, 200);
  const updatedRequest = await updateResponse.json();

  assert.equal(updatedRequest.id, createdRequest.id);
  assert.equal(updatedRequest.status, "completed");
  assert.equal(updatedRequest.notes, "Filter replaced and airflow restored");

  const storedRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: createdRequest.id },
  });
  assert.ok(storedRequest);
  assert.equal(storedRequest.status, "completed");
});
