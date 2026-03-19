import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leases = await prisma.lease.findMany({
    include: {
      tenant: true,
      unit: true,
      property: true,
      payments: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return NextResponse.json(leases);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    tenantId,
    unitId,
    startDate,
    endDate,
    monthlyRent,
    depositAmount,
  } = body;

  if (
    !tenantId ||
    !unitId ||
    !startDate ||
    !endDate ||
    monthlyRent === undefined ||
    depositAmount === undefined
  ) {
    return NextResponse.json(
      { error: "Missing required lease fields." },
      { status: 400 }
    );
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
  });

  if (!unit) {
    return NextResponse.json({ error: "Selected unit was not found." }, { status: 404 });
  }

  if (!["available", "reserved"].includes(unit.status)) {
    return NextResponse.json(
      { error: "Selected unit is no longer available for leasing." },
      { status: 409 }
    );
  }

  const lease = await prisma.$transaction(async (tx) => {
    const createdLease = await tx.lease.create({
      data: {
        id: `lease-${Date.now()}`,
        tenantId,
        unitId,
        propertyId: unit.propertyId,
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        endDate: new Date(`${endDate}T00:00:00.000Z`),
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
        status: "active",
      },
      include: {
        tenant: true,
        unit: true,
        property: true,
        payments: true,
      },
    });

    await tx.unit.update({
      where: { id: unitId },
      data: { status: "occupied" },
    });

    return createdLease;
  });

  return NextResponse.json(lease, { status: 201 });
}
