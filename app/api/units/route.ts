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
