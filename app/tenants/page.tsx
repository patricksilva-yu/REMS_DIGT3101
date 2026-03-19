import { Sidebar } from "@/components/sidebar";
import { TenantsContent } from "@/components/tenants-content";
import { prisma } from "@/lib/prisma";
import type { Lease, Property, Tenant, Unit } from "@/lib/store";

function toDateString(value: Date) {
  return value.toISOString().split("T")[0];
}

export default async function TenantsPage() {
  const [tenants, leases, units, properties] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.lease.findMany({
      orderBy: {
        startDate: "asc",
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
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <TenantsContent
          initialTenants={tenants.map((tenant) => ({
            ...tenant,
            status: tenant.status as Tenant["status"],
          }))}
          leases={leases.map((lease) => ({
            ...lease,
            status: lease.status as Lease["status"],
            startDate: toDateString(lease.startDate),
            endDate: toDateString(lease.endDate),
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
        />
      </main>
    </div>
  );
}
