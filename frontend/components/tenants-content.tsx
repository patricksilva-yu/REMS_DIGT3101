"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Mail, Phone, Plus, Search, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { Lease, Property, Tenant, Unit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TenantsContent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);

  const [newTenant, setNewTenant] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    contactPerson: "",
    companyName: "",
    password: "demo123",
  });

  async function load() {
    try {
      const [tenantList, leaseList, unitList, propertyList] = await Promise.all([
        api.getTenants(),
        api.getLeases(),
        api.getUnits(),
        api.getProperties(),
      ]);
      setTenants(tenantList);
      setLeases(leaseList);
      setUnits(unitList);
      setProperties(propertyList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tenants.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredTenants = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tenants.filter((tenant) => {
      const haystack = [tenant.companyName, tenant.fullName, tenant.email, tenant.contactPerson]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, tenants]);

  async function handleCreateTenant() {
    try {
      await api.createTenant(newTenant);
      setIsAddTenantOpen(false);
      setNewTenant({
        fullName: "",
        email: "",
        phone: "",
        businessType: "",
        contactPerson: "",
        companyName: "",
        password: "demo123",
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create tenant.");
    }
  }

  function tenantLeases(tenantId: string) {
    return leases.filter((lease) => lease.tenantId === tenantId);
  }

  function unitLabel(unitId: string) {
    return units.find((unit) => unit.id === unitId)?.unitNumber ?? "Unknown unit";
  }

  function propertyLabel(propertyId: string) {
    return properties.find((property) => property.id === propertyId)?.name ?? "Unknown property";
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">Directory of active tenants, their units, and contact owners.</p>
        </div>

        <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tenant</DialogTitle>
              <DialogDescription>Create a seeded tenant account for demo workflows.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={newTenant.companyName} onChange={(e) => setNewTenant({ ...newTenant, companyName: e.target.value, fullName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={newTenant.email} onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newTenant.phone} onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Input value={newTenant.businessType} onChange={(e) => setNewTenant({ ...newTenant, businessType: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={newTenant.contactPerson} onChange={(e) => setNewTenant({ ...newTenant, contactPerson: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTenantOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleCreateTenant()}>Create Tenant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search tenants..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Tenant Directory
            </CardTitle>
            <CardDescription>{filteredTenants.length} tenant accounts currently available.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Leases</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenant.companyName ?? tenant.fullName}</p>
                        <p className="text-xs text-muted-foreground">{tenant.businessType ?? "Unspecified"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{tenant.email}</p>
                        <p className="flex items-center gap-2 mt-1"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{tenant.phone ?? "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{tenantLeases(tenant.id).length}</TableCell>
                    <TableCell><Badge variant="outline">{tenant.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => setSelectedTenant(tenant)}>Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tenant Detail</CardTitle>
            <CardDescription>{selectedTenant ? "Selected tenant lease footprint." : "Select a tenant to inspect active leases."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedTenant ? (
              <p className="text-sm text-muted-foreground">No tenant selected.</p>
            ) : (
              <>
                <div className="rounded-lg border border-border p-4">
                  <p className="font-medium text-card-foreground">{selectedTenant.companyName ?? selectedTenant.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTenant.contactPerson}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedTenant.email}</p>
                </div>
                {tenantLeases(selectedTenant.id).map((lease) => (
                  <div key={lease.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">Unit {unitLabel(lease.unitId)}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5" />
                          {propertyLabel(lease.propertyId)}
                        </p>
                      </div>
                      <Badge>{lease.paymentCycle}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{lease.startDate} to {lease.endDate}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
