import { Sidebar } from "@/components/sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import { getDashboardData } from "@/lib/server-data";
import type { Lease, MaintenanceRequest, Property, Tenant, Unit } from "@/lib/store";

export default async function Home() {
  const dashboardData = await getDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <DashboardContent
          metrics={dashboardData.metrics}
          revenueData={dashboardData.revenueData}
          occupancyData={dashboardData.occupancyData}
          recentMaintenance={dashboardData.recentMaintenance.map((request) => ({
            ...request,
            category: request.category as MaintenanceRequest["category"],
            urgency: request.urgency as MaintenanceRequest["urgency"],
            status: request.status as MaintenanceRequest["status"],
            notes: request.notes ?? undefined,
          }))}
          recentLeases={dashboardData.recentLeases.map((lease) => ({
            ...lease,
            status: lease.status as Lease["status"],
          }))}
          tenants={dashboardData.tenants.map((tenant) => ({
            ...tenant,
            status: tenant.status as Tenant["status"],
          }))}
          properties={dashboardData.properties.map((property) => ({
            ...property,
            status: property.status as Property["status"],
          }))}
          units={dashboardData.units.map((unit) => ({
            ...unit,
            status: unit.status as Unit["status"],
          }))}
        />
      </main>
    </div>
  );
}
