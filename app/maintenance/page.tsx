import { Sidebar } from "@/components/sidebar";
import { MaintenanceContent } from "@/components/maintenance-content";
import { prisma } from "@/lib/prisma";
import type { Lease, MaintenanceRequest, Property, Tenant, Unit } from "@/lib/store";

function toDateString(value: Date) {
  return value.toISOString().split("T")[0];
}

export default async function MaintenancePage() {
  const [requests, tenants, units, leases, properties] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      orderBy: [
        { status: "asc" },
        { updatedAt: "desc" },
      ],
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
    prisma.lease.findMany({
      orderBy: {
        startDate: "asc",
      },
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
        <MaintenanceContent
          initialRequests={requests.map((request) => ({
            ...request,
            category: request.category as MaintenanceRequest["category"],
            urgency: request.urgency as MaintenanceRequest["urgency"],
            status: request.status as MaintenanceRequest["status"],
            createdAt: toDateString(request.createdAt),
            updatedAt: toDateString(request.updatedAt),
            notes: request.notes ?? undefined,
          }))}
          tenants={tenants.map((tenant) => ({
            ...tenant,
            status: tenant.status as Tenant["status"],
          }))}
          units={units.map((unit) => ({
            ...unit,
            status: unit.status as Unit["status"],
          }))}
          leases={leases.map((lease) => ({
            ...lease,
            status: lease.status as Lease["status"],
            startDate: toDateString(lease.startDate),
            endDate: toDateString(lease.endDate),
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
