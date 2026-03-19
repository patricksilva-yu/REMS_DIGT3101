import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      lease: {
        include: {
          tenant: true,
          unit: true,
          property: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { leaseId, amount, date, reference } = body;

  if (!leaseId || amount === undefined || !date || !reference) {
    return NextResponse.json(
      { error: "Missing required payment fields." },
      { status: 400 }
    );
  }

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
  });

  if (!lease) {
    return NextResponse.json({ error: "Selected lease was not found." }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      id: `pay-${Date.now()}`,
      leaseId,
      amount: Number(amount),
      date: new Date(`${date}T00:00:00.000Z`),
      reference,
      status: "completed",
    },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: true,
          property: true,
        },
      },
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
