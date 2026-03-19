import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const units = await prisma.unit.findMany({
    include: {
      property: true,
      leases: true,
    },
    orderBy: [
      { propertyId: "asc" },
      { unitNumber: "asc" },
    ],
  });

  return NextResponse.json(units);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { propertyId, unitNumber, floor, size, baseRent, status } = body;

  if (
    !propertyId ||
    !unitNumber ||
    floor === undefined ||
    size === undefined ||
    baseRent === undefined ||
    !status
  ) {
    return NextResponse.json(
      { error: "Missing required unit fields." },
      { status: 400 }
    );
  }

  const unit = await prisma.$transaction(async (tx) => {
    const createdUnit = await tx.unit.create({
      data: {
        id: `unit-${Date.now()}`,
        propertyId,
        unitNumber,
        floor: Number(floor),
        size: Number(size),
        baseRent: Number(baseRent),
        status,
      },
    });

    await tx.property.update({
      where: { id: propertyId },
      data: {
        totalUnits: {
          increment: 1,
        },
      },
    });

    return createdUnit;
  });

  return NextResponse.json(unit, { status: 201 });
}
