import { prisma } from "@/lib/prisma";

export async function getDashboardSnapshot() {
  const [
    propertyCount,
    unitCount,
    occupiedUnits,
    availableUnits,
    activeLeases,
    activeTenants,
    openMaintenance,
    highPriorityMaintenance,
    pendingPayments,
    totalMonthlyRentAggregate,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: "occupied" } }),
    prisma.unit.count({ where: { status: "available" } }),
    prisma.lease.count({ where: { status: "active" } }),
    prisma.tenant.count({ where: { status: "active" } }),
    prisma.maintenanceRequest.count({
      where: { status: { in: ["new", "in-progress"] } },
    }),
    prisma.maintenanceRequest.count({
      where: {
        status: { in: ["new", "in-progress"] },
        urgency: { in: ["critical", "high"] },
      },
    }),
    prisma.payment.findMany({
      where: { status: { in: ["pending", "overdue"] } },
      select: { amount: true },
    }),
    prisma.lease.aggregate({
      where: { status: "active" },
      _sum: { monthlyRent: true },
    }),
  ]);

  return {
    totalProperties: propertyCount,
    totalUnits: unitCount,
    occupiedUnits,
    occupancyRate: unitCount === 0 ? 0 : Math.round((occupiedUnits / unitCount) * 100),
    availableUnits,
    totalMonthlyRent: totalMonthlyRentAggregate._sum.monthlyRent ?? 0,
    overdueAmount: pendingPayments.reduce((sum, payment) => sum + payment.amount, 0),
    openMaintenance,
    highPriorityMaintenance,
    activeLeases,
    totalTenants: activeTenants,
  };
}

export async function getDashboardData() {
  const [metrics, properties, units, tenants, maintenanceRequests, leases, payments] =
    await Promise.all([
      getDashboardSnapshot(),
      prisma.property.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.unit.findMany({
        orderBy: [
          { propertyId: "asc" },
          { unitNumber: "asc" },
        ],
      }),
      prisma.tenant.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          status: {
            in: ["new", "in-progress"],
          },
        },
        orderBy: [
          { updatedAt: "desc" },
          { createdAt: "desc" },
        ],
        take: 4,
      }),
      prisma.lease.findMany({
        where: {
          status: "active",
        },
        orderBy: {
          startDate: "asc",
        },
        take: 4,
      }),
      prisma.payment.findMany({
        where: {
          status: "completed",
        },
        orderBy: {
          date: "asc",
        },
      }),
    ]);

  const occupancyData = properties.map((property) => {
    const propertyUnits = units.filter((unit) => unit.propertyId === property.id);
    const occupied = propertyUnits.filter((unit) => unit.status === "occupied").length;

    return {
      name: property.name.split(" ")[0],
      value: occupied,
      total: propertyUnits.length,
    };
  });

  const monthFormatter = new Intl.DateTimeFormat("en-CA", { month: "short" });
  const revenueMap = new Map<string, number>();
  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - index);
    revenueMap.set(monthFormatter.format(monthDate), 0);
  }

  for (const payment of payments) {
    const label = monthFormatter.format(payment.date);
    if (revenueMap.has(label)) {
      revenueMap.set(label, (revenueMap.get(label) ?? 0) + payment.amount);
    }
  }

  const revenueData = Array.from(revenueMap.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return {
    metrics,
    occupancyData,
    revenueData,
    recentMaintenance: maintenanceRequests.map((request) => ({
      ...request,
      createdAt: request.createdAt.toISOString().split("T")[0],
      updatedAt: request.updatedAt.toISOString().split("T")[0],
    })),
    recentLeases: leases.map((lease) => ({
      ...lease,
      startDate: lease.startDate.toISOString().split("T")[0],
      endDate: lease.endDate.toISOString().split("T")[0],
    })),
    tenants,
    properties: properties.map((property) => ({
      ...property,
      createdAt: property.createdAt.toISOString().split("T")[0],
    })),
    units,
  };
}
