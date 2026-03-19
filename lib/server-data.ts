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
    activeLeases,
    totalTenants: activeTenants,
  };
}
