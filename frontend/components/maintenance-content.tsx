"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, Plus, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import type { Lease, MaintenanceRequest, Tenant, Unit } from "@/lib/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export function MaintenanceContent() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [newRequest, setNewRequest] = useState({
    tenantId: "",
    unitId: "",
    leaseId: "",
    category: "HVAC",
    description: "",
    urgency: "MEDIUM",
    misuseCaused: false,
    misuseChargeAmount: "",
  });

  async function load() {
    try {
      const [requestList, tenantList, unitList, leaseList] = await Promise.all([
        api.getMaintenanceRequests(),
        api.getTenants(),
        api.getUnits(),
        api.getLeases(),
      ]);
      setRequests(requestList);
      setTenants(tenantList);
      setUnits(unitList);
      setLeases(leaseList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load maintenance data.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return rank[a.urgency] - rank[b.urgency];
    });
  }, [requests]);

  async function handleCreate() {
    try {
      await api.createMaintenanceRequest({
        tenantId: newRequest.tenantId,
        unitId: newRequest.unitId,
        leaseId: newRequest.leaseId || undefined,
        category: newRequest.category,
        description: newRequest.description,
        urgency: newRequest.urgency,
        misuseCaused: newRequest.misuseCaused,
        misuseChargeAmount: newRequest.misuseCaused ? Number(newRequest.misuseChargeAmount || 0) : 0,
      });
      setIsCreateOpen(false);
      setNewRequest({
        tenantId: "",
        unitId: "",
        leaseId: "",
        category: "HVAC",
        description: "",
        urgency: "MEDIUM",
        misuseCaused: false,
        misuseChargeAmount: "",
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create maintenance request.");
    }
  }

  async function updateStatus(requestId: string, status: "IN_PROGRESS" | "COMPLETED") {
    try {
      await api.updateMaintenanceStatus(requestId, {
        status,
        notes: status === "COMPLETED" ? "Closed from staff dashboard." : "Work order is now active.",
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update maintenance status.");
    }
  }

  function tenantLabel(tenantId: string) {
    const tenant = tenants.find((item) => item.id === tenantId);
    return tenant?.companyName ?? tenant?.fullName ?? "Unknown tenant";
  }

  function unitLabel(unitId: string) {
    return units.find((unit) => unit.id === unitId)?.unitNumber ?? "Unknown unit";
  }

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Escalation, misuse charging, and work order tracking.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>Submit a new work order as staff or on behalf of a tenant.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <Select value={newRequest.tenantId} onValueChange={(value) => setNewRequest({ ...newRequest, tenantId: value })}>
                    <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.companyName ?? tenant.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={newRequest.unitId} onValueChange={(value) => {
                    const lease = leases.find((item) => item.unitId === value && item.status === "ACTIVE");
                    setNewRequest({ ...newRequest, unitId: value, leaseId: lease?.id ?? "" });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>Unit {unit.unitNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newRequest.category} onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["ELECTRICAL", "PLUMBING", "HVAC", "STRUCTURAL", "OTHER"].map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((urgency) => (
                        <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newRequest.description} onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Misuse Charge</Label>
                  <Input
                    type="number"
                    value={newRequest.misuseChargeAmount}
                    onChange={(e) => setNewRequest({ ...newRequest, misuseChargeAmount: e.target.value, misuseCaused: true })}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant={newRequest.misuseCaused ? "default" : "outline"} onClick={() => setNewRequest({
                    ...newRequest,
                    misuseCaused: !newRequest.misuseCaused,
                    misuseChargeAmount: !newRequest.misuseCaused ? newRequest.misuseChargeAmount : "",
                  })}>
                    {newRequest.misuseCaused ? "Misuse Enabled" : "Routine Maintenance"}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleCreate()}>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {sortedRequests.map((request) => (
            <Card key={request.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      {request.category} for Unit {unitLabel(request.unitId)}
                    </CardTitle>
                    <CardDescription>{tenantLabel(request.tenantId)}</CardDescription>
                  </div>
                  <Badge variant={request.escalated ? "destructive" : "secondary"}>{request.urgency}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{request.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{request.updatedAt.slice(0, 10)}</span>
                  <span>Status: {request.status}</span>
                  {request.misuseCaused ? <span>Charge: {currency.format(request.misuseChargeAmount)}</span> : <span>Routine maintenance</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "NEW" ? <Button variant="outline" onClick={() => void updateStatus(request.id, "IN_PROGRESS")}>Start Work</Button> : null}
                  {request.status !== "COMPLETED" ? <Button onClick={() => void updateStatus(request.id, "COMPLETED")}>Mark Complete</Button> : null}
                  <Button variant="ghost" onClick={() => setSelectedRequestId(request.id)}>Inspect</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Request Detail</CardTitle>
            <CardDescription>{selectedRequest ? "Selected request summary and billing impact." : "Select a request to inspect it."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedRequest ? (
              <p className="text-sm text-muted-foreground">No request selected.</p>
            ) : (
              <>
                <div className="rounded-lg border border-border p-4">
                  <p className="font-medium text-card-foreground">{selectedRequest.category}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedRequest.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{selectedRequest.status}</Badge>
                    <Badge variant={selectedRequest.escalated ? "destructive" : "secondary"}>{selectedRequest.urgency}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  {selectedRequest.misuseCaused
                    ? `Misuse charge will flow into billing: ${currency.format(selectedRequest.misuseChargeAmount)}`
                    : "Routine maintenance, no tenant charge applied."}
                </p>
                <p className="text-sm text-muted-foreground">Tenant: {tenantLabel(selectedRequest.tenantId)}</p>
                <p className="text-sm text-muted-foreground">Unit: {unitLabel(selectedRequest.unitId)}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
