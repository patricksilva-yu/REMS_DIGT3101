import { PrismaClient } from "@prisma/client";
import {
  properties,
  units,
  tenants,
  leases,
  payments,
  maintenanceRequests,
} from "../lib/store";

const prisma = new PrismaClient();

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  await prisma.payment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();

  await prisma.property.createMany({
    data: properties.map((property) => ({
      ...property,
      createdAt: toDate(property.createdAt),
    })),
  });

  await prisma.unit.createMany({
    data: units,
  });

  await prisma.tenant.createMany({
    data: tenants,
  });

  await prisma.lease.createMany({
    data: leases.map((lease) => ({
      ...lease,
      startDate: toDate(lease.startDate),
      endDate: toDate(lease.endDate),
    })),
  });

  await prisma.payment.createMany({
    data: payments.map((payment) => ({
      ...payment,
      date: toDate(payment.date),
    })),
  });

  await prisma.maintenanceRequest.createMany({
    data: maintenanceRequests.map((request) => ({
      ...request,
      createdAt: toDate(request.createdAt),
      updatedAt: toDate(request.updatedAt),
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
