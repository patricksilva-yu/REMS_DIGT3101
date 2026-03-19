import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.maintenanceRequest.findMany({
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  });

  return NextResponse.json(requests);
}
