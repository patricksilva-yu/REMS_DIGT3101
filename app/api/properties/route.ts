import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const properties = await prisma.property.findMany({
    include: {
      units: true,
      leases: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(properties);
}
