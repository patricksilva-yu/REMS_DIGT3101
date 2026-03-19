"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Building2, CreditCard, FileText, Home, Users, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardMetrics, Lease, MaintenanceRequest, Property, Unit } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, propertyList, unitList, leaseList, maintenanceList] = await Promise.all([
          api.getDashboard(),
          api.getProperties(),
          api.getUnits(),
          api.getLeases(),
          api.getMaintenanceRequests(),
        ]);
        setMetrics(dashboard);
        setProperties(propertyList);
        setUnits(unitList);
        setLeases(leaseList);
        setMaintenance(maintenanceList);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
      }
    }

    void load();
  }, []);

  const occupancyByProperty = properties.map((property) => {
    const propertyUnits = units.filter((unit) => unit.propertyId === property.id);
    const occupied = propertyUnits.filter((unit) => unit.status === "OCCUPIED").length;
    const occupancyRate = propertyUnits.length === 0 ? 0 : Math.round((occupied / propertyUnits.length) * 100);

    return {
      property,
      occupied,
      total: propertyUnits.length,
      occupancyRate,
    };
  });

  const recentMaintenance = maintenance.slice(0, 4);
  const recentLeases = leases.slice(0, 4);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Live portfolio, billing, and maintenance overview.</p>
      </div>

      {error ? (
        <Card className="bg-destructive/10 border-destructive/30 mb-6">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={Building2}
          title="Properties"
          value={metrics ? String(metrics.totalProperties) : "--"}
          meta={metrics ? `${metrics.totalUnits} total units` : "Loading"}
        />
        <SummaryCard
          icon={Home}
          title="Occupancy"
          value={metrics ? `${metrics.occupancyRate}%` : "--"}
          meta={metrics ? `${metrics.occupiedUnits} occupied / ${metrics.availableUnits} available` : "Loading"}
        />
        <SummaryCard
          icon={CreditCard}
          title="Monthly Rent"
          value={metrics ? currency.format(metrics.totalMonthlyRent) : "--"}
          meta={metrics ? `${currency.format(metrics.overdueAmount)} overdue` : "Loading"}
        />
        <SummaryCard
          icon={Wrench}
          title="Open Maintenance"
          value={metrics ? String(metrics.openMaintenance) : "--"}
          meta={metrics ? `${metrics.activeLeases} active leases` : "Loading"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Occupancy by Property</CardTitle>
            <CardDescription>How each property is performing right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {occupancyByProperty.map(({ property, occupied, total, occupancyRate }) => (
              <div key={property.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-card-foreground">{property.name}</p>
                    <p className="text-muted-foreground">{property.address}</p>
                  </div>
                  <Badge variant="outline">{occupancyRate}%</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${occupancyRate}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{occupied} occupied of {total} units</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Active Lease Snapshot</CardTitle>
            <CardDescription>Recent lease starts and payment cycles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeases.map((lease) => (
              <div key={lease.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-card-foreground">Lease {lease.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {lease.startDate} to {lease.endDate}
                    </p>
                  </div>
                  <Badge>{lease.paymentCycle}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{currency.format(lease.effectiveRent)}/month</span>
                  <span>{lease.discountPercent}% discount</span>
                  <span>{lease.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Maintenance Queue</CardTitle>
            <CardDescription>Urgent and recently updated work orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMaintenance.map((request) => (
              <div key={request.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-medium text-card-foreground">{request.category}</p>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </div>
                  </div>
                  <Badge variant={request.escalated ? "destructive" : "secondary"}>{request.urgency}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{request.status}</span>
                  <span>{request.updatedAt.slice(0, 10)}</span>
                  {request.misuseCaused ? <span>Charge: {currency.format(request.misuseChargeAmount)}</span> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Delivery Focus</CardTitle>
            <CardDescription>What this stack now covers for Deliverable 3.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-primary" /> Tenant onboarding via applications and lease approvals.</p>
            <p className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-primary" /> Invoice, payment, utility, and overdue tracking backed by PostgreSQL.</p>
            <p className="flex items-start gap-2"><Wrench className="mt-0.5 h-4 w-4 text-primary" /> Maintenance escalation and misuse-charge routing into billing.</p>
            <p className="flex items-start gap-2"><Home className="mt-0.5 h-4 w-4 text-primary" /> Public unit search and appointment scheduling available from the portal page.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  meta,
}: {
  icon: typeof Building2;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{meta}</p>
      </CardContent>
    </Card>
  );
}
