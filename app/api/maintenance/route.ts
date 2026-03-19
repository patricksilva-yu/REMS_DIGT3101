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

export async function POST(request: Request) {
  const body = await request.json();
  const { tenantId, unitId, category, description, urgency } = body;

  if (!tenantId || !unitId || !category || !description || !urgency) {
    return NextResponse.json(
      { error: "Missing required maintenance request fields." },
      { status: 400 }
    );
  }

  const createdRequest = await prisma.maintenanceRequest.create({
    data: {
      id: `maint-${Date.now()}`,
      tenantId,
      unitId,
      category,
      description,
      urgency,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  return NextResponse.json(createdRequest, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, notes } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing maintenance request update fields." },
      { status: 400 }
    );
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status,
      notes: notes ?? undefined,
      updatedAt: new Date(),
    },
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  return NextResponse.json(updatedRequest);
}
