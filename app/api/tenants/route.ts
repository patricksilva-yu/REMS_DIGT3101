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

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, businessType, contactPerson } = body;

  if (!name || !email || !phone || !businessType || !contactPerson) {
    return NextResponse.json(
      { error: "Missing required tenant fields." },
      { status: 400 }
    );
  }

  const createdTenant = await prisma.tenant.create({
    data: {
      id: `tenant-${Date.now()}`,
      name,
      email,
      phone,
      businessType,
      contactPerson,
      status: "active",
    },
  });

  return NextResponse.json(createdTenant, { status: 201 });
}
