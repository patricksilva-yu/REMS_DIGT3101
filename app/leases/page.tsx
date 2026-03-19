import { Sidebar } from "@/components/sidebar";
import { LeasesContent } from "@/components/leases-content";
import { prisma } from "@/lib/prisma";
import type { Lease, Payment, Property, Tenant, Unit } from "@/lib/store";

function toDateString(value: Date) {
  return value.toISOString().split("T")[0];
}

export default async function LeasesPage() {
  const [leases, tenants, units, properties, payments] = await Promise.all([
    prisma.lease.findMany({
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.tenant.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.unit.findMany({
      orderBy: [
        { propertyId: "asc" },
        { unitNumber: "asc" },
      ],
    }),
    prisma.property.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.payment.findMany({
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <LeasesContent
          initialLeases={leases.map((lease) => ({
            ...lease,
            status: lease.status as Lease["status"],
            startDate: toDateString(lease.startDate),
            endDate: toDateString(lease.endDate),
          }))}
          tenants={tenants.map((tenant) => ({
            ...tenant,
            status: tenant.status as Tenant["status"],
          }))}
          units={units.map((unit) => ({
            ...unit,
            status: unit.status as Unit["status"],
          }))}
          properties={properties.map((property) => ({
            ...property,
            status: property.status as Property["status"],
            createdAt: toDateString(property.createdAt),
          }))}
          payments={payments.map((payment) => ({
            ...payment,
            status: payment.status as Payment["status"],
            date: toDateString(payment.date),
          }))}
        />
      </main>
    </div>
  );
}
