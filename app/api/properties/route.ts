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

export async function POST(request: Request) {
  const body = await request.json();
  const { name, address, description } = body;

  if (!name || !address || !description) {
    return NextResponse.json(
      { error: "Missing required property fields." },
      { status: 400 }
    );
  }

  const createdProperty = await prisma.property.create({
    data: {
      id: `prop-${Date.now()}`,
      name,
      address,
      description,
      totalUnits: 0,
      status: "active",
      createdAt: new Date(),
    },
  });

  return NextResponse.json(createdProperty, { status: 201 });
}
