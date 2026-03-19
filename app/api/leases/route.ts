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
