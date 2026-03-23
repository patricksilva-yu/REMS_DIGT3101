"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Lease, Property, RentalApplication, Tenant, Unit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export function LeasesContent() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [leaseList, applicationList, tenantList, unitList, propertyList] = await Promise.all([
          api.getLeases(),
          api.getApplications(),
          api.getTenants(),
          api.getUnits(),
          api.getProperties(),
        ]);
        setLeases(leaseList);
        setApplications(applicationList);
        setTenants(tenantList);
        setUnits(unitList);
        setProperties(propertyList);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load leases.");
      }
    }

    void load();
  }, []);

  const filteredLeases = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return leases;
    return leases.filter((lease) => {
      const tenant = tenants.find((item) => item.id === lease.tenantId);
      const unit = units.find((item) => item.id === lease.unitId);
      const property = properties.find((item) => item.id === lease.propertyId);
      return [tenant?.companyName, tenant?.fullName, unit?.unitNumber, property?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [leases, properties, searchQuery, tenants, units]);

  function tenantLabel(tenantId: string) {
    const tenant = tenants.find((item) => item.id === tenantId);
    return tenant?.companyName ?? tenant?.fullName ?? "Unknown tenant";
  }

  function unitLabel(unitId: string) {
    return units.find((unit) => unit.id === unitId)?.unitNumber ?? "Unknown unit";
  }

  function propertyLabel(propertyId: string) {
    return properties.find((property) => property.id === propertyId)?.name ?? "Unknown property";
  }

  const pendingApplications = applications.filter((application) => application.status === "SUBMITTED" || application.status === "UNDER_REVIEW");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leases</h1>
          <p className="text-muted-foreground mt-1">Active agreements, cycle pricing, and application handoff.</p>
        </div>
        <Button asChild>
          <Link href="/applications">Review Applications</Link>
        </Button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Lease Register
            </CardTitle>
            <CardDescription>{filteredLeases.length} active and seeded lease records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                placeholder="Search by tenant, unit, or property..."
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenantLabel(lease.tenantId)}</p>
                        <p className="text-xs text-muted-foreground">{lease.startDate} to {lease.endDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p>Unit {unitLabel(lease.unitId)}</p>
                      <p className="text-xs text-muted-foreground">{propertyLabel(lease.propertyId)}</p>
                    </TableCell>
                    <TableCell>{lease.paymentCycle}</TableCell>
                    <TableCell>
                      <div>
                        <p>{currency.format(lease.effectiveRent)}</p>
                        <p className="text-xs text-muted-foreground">{lease.discountPercent}% discount</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{lease.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Application Pipeline</CardTitle>
            <CardDescription>Pending applications waiting for lease review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications need attention.</p>
            ) : (
              pendingApplications.map((application) => (
                <div key={application.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">{application.applicantName}</p>
                      <p className="text-sm text-muted-foreground">Unit {unitLabel(application.unitId)}</p>
                    </div>
                    <Badge>{application.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{application.createdAt.slice(0, 10)}</span>
                    <span>{application.requestedCycle}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
