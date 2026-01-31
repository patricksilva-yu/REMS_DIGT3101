"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  maintenanceRequests as initialRequests,
  tenants,
  units,
  leases,
  getTenantById,
  getUnitById,
  getPropertyById,
  type MaintenanceRequest,
} from "@/lib/store";
import { Wrench, Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

export function MaintenanceContent() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [isSubmitRequestOpen, setIsSubmitRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const tenant = getTenantById(request.tenantId);
    const matchesSearch =
      tenant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesUrgency = filterUrgency === "all" || request.urgency === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Sort by urgency and date
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { new: 0, "in-progress": 1, completed: 2, cancelled: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get active tenant units for submission
  const activeLeaseUnits = leases
    .filter((l) => l.status === "active")
    .map((l) => ({
      lease: l,
      tenant: getTenantById(l.tenantId),
      unit: getUnitById(l.unitId),
      property: getPropertyById(l.propertyId),
    }));

  // New request form state
  const [newRequest, setNewRequest] = useState({
    tenantId: "",
    unitId: "",
    category: "" as MaintenanceRequest["category"],
    description: "",
    urgency: "medium" as MaintenanceRequest["urgency"],
  });

  const handleSubmitRequest = () => {
    const request: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      tenantId: newRequest.tenantId,
      unitId: newRequest.unitId,
      category: newRequest.category,
      description: newRequest.description,
      urgency: newRequest.urgency,
      status: "new",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setRequests([request, ...requests]);
    setNewRequest({
      tenantId: "",
      unitId: "",
      category: "" as MaintenanceRequest["category"],
      description: "",
      urgency: "medium",
    });
    setIsSubmitRequestOpen(false);
  };

  const handleUpdateStatus = (requestId: string, newStatus: MaintenanceRequest["status"], notes?: string) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: newStatus,
              updatedAt: new Date().toISOString().split("T")[0],
              notes: notes || r.notes,
            }
          : r
      )
    );
    setIsViewRequestOpen(false);
  };

  const getStatusIcon = (status: MaintenanceRequest["status"]) => {
    switch (status) {
      case "new":
        return <AlertTriangle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: MaintenanceRequest["status"]) => {
    switch (status) {
      case "new":
        return "bg-chart-3/20 text-chart-3";
      case "in-progress":
        return "bg-chart-2/20 text-chart-2";
      case "completed":
        return "bg-primary/20 text-primary";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const getUrgencyColor = (urgency: MaintenanceRequest["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/20 text-destructive";
      case "high":
        return "bg-chart-4/20 text-chart-4";
      case "medium":
        return "bg-chart-3/20 text-chart-3";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const getCategoryLabel = (category: MaintenanceRequest["category"]) => {
    const labels: Record<MaintenanceRequest["category"], string> = {
      electrical: "Electrical",
      plumbing: "Plumbing",
      hvac: "HVAC",
      structural: "Structural",
      other: "Other",
    };
    return labels[category];
  };

  // Summary counts
  const newCount = requests.filter((r) => r.status === "new").length;
  const inProgressCount = requests.filter((r) => r.status === "in-progress").length;
  const criticalCount = requests.filter(
    (r) => (r.urgency === "critical" || r.urgency === "high") && r.status !== "completed" && r.status !== "cancelled"
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Manage maintenance requests and work orders
          </p>
        </div>
        <Dialog open={isSubmitRequestOpen} onOpenChange={setIsSubmitRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Submit Maintenance Request</DialogTitle>
              <DialogDescription>
                Report an issue that needs attention
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant / Unit</Label>
                <Select
                  value={`${newRequest.tenantId}|${newRequest.unitId}`}
                  onValueChange={(value) => {
                    const [tenantId, unitId] = value.split("|");
                    setNewRequest({ ...newRequest, tenantId, unitId });
                  }}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select tenant and unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {activeLeaseUnits.map((item) => (
                      <SelectItem
                        key={item.lease.id}
                        value={`${item.tenant?.id}|${item.unit?.id}`}
                      >
                        {item.tenant?.name} - Unit {item.unit?.unitNumber} ({item.property?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newRequest.category}
                    onValueChange={(value: MaintenanceRequest["category"]) =>
                      setNewRequest({ ...newRequest, category: value })
                    }
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={newRequest.urgency}
                    onValueChange={(value: MaintenanceRequest["urgency"]) =>
                      setNewRequest({ ...newRequest, urgency: value })
                    }
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, description: e.target.value })
                  }
                  className="bg-input border-border min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest} className="bg-primary text-primary-foreground">
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Requests
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{newCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Critical or high urgency</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tenant or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px] bg-input border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterUrgency} onValueChange={setFilterUrgency}>
          <SelectTrigger className="w-full sm:w-[150px] bg-input border-border">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Maintenance Requests
          </CardTitle>
          <CardDescription>
            {sortedRequests.length} request{sortedRequests.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedRequests.map((request) => {
              const tenant = getTenantById(request.tenantId);
              const unit = getUnitById(request.unitId);
              const property = unit ? getPropertyById(units.find((u) => u.id === unit.id)?.propertyId || "") : null;

              return (
                <div
                  key={request.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge variant="outline">{getCategoryLabel(request.category)}</Badge>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-card-foreground line-clamp-2">
                      {request.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{tenant?.name}</span>
                      <span>Unit {unit?.unitNumber}</span>
                      {property && <span>{property.name}</span>}
                      <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsViewRequestOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              );
            })}

            {sortedRequests.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No maintenance requests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={isViewRequestOpen} onOpenChange={setIsViewRequestOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Maintenance Request Details</DialogTitle>
            <DialogDescription>
              View and update request status
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-6">
              {/* Status and Urgency */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                  {selectedRequest.urgency} urgency
                </Badge>
                <Badge variant="outline">{getCategoryLabel(selectedRequest.category)}</Badge>
                <div className="flex items-center gap-1">
                  {getStatusIcon(selectedRequest.status)}
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Request Info */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="text-sm font-semibold text-card-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
              </div>

              {/* Tenant & Unit Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Tenant</h4>
                  <p className="text-sm text-card-foreground">
                    {getTenantById(selectedRequest.tenantId)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTenantById(selectedRequest.tenantId)?.phone}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Unit</h4>
                  <p className="text-sm text-card-foreground">
                    Unit {getUnitById(selectedRequest.unitId)?.unitNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Floor {getUnitById(selectedRequest.unitId)?.floor}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="text-sm font-semibold text-card-foreground mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-card-foreground">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-card-foreground">
                      {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status !== "completed" && selectedRequest.status !== "cancelled" && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selectedRequest.status === "new" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedRequest.id, "in-progress")}
                      className="bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Start Work
                    </Button>
                  )}
                  {selectedRequest.status === "in-progress" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedRequest.id, "completed")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedRequest.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
