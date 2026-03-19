import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    include: {
      leases: true,
      maintenanceItems: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(tenants);
}
