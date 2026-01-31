"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  leases as initialLeases,
  tenants,
  units,
  properties,
  payments,
  getTenantById,
  getUnitById,
  getPropertyById,
  getPaymentsByLease,
  type Lease,
} from "@/lib/store";
import { FileText, Plus, Search, Calendar, DollarSign, Eye, AlertTriangle } from "lucide-react";

export function LeasesContent() {
  const [leasesList, setLeasesList] = useState<Lease[]>(initialLeases);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isViewLeaseOpen, setIsViewLeaseOpen] = useState(false);

  // Filter leases
  const filteredLeases = leasesList.filter((lease) => {
    const tenant = getTenantById(lease.tenantId);
    const matchesSearch = tenant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || lease.status === filterStatus;
    const matchesProperty = filterProperty === "all" || lease.propertyId === filterProperty;
    return matchesSearch && matchesStatus && matchesProperty;
  });

  // New lease form state
  const [newLease, setNewLease] = useState({
    tenantId: "",
    unitId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    depositAmount: "",
  });

  // Available units for lease (only available or reserved units)
  const availableUnits = units.filter(
    (u) => u.status === "available" || u.status === "reserved"
  );

  const handleCreateLease = () => {
    const selectedUnit = units.find((u) => u.id === newLease.unitId);
    if (!selectedUnit) return;

    const lease: Lease = {
      id: `lease-${Date.now()}`,
      tenantId: newLease.tenantId,
      unitId: newLease.unitId,
      propertyId: selectedUnit.propertyId,
      startDate: newLease.startDate,
      endDate: newLease.endDate,
      monthlyRent: parseInt(newLease.monthlyRent),
      depositAmount: parseInt(newLease.depositAmount),
      status: "active",
    };
    setLeasesList([...leasesList, lease]);
    setNewLease({
      tenantId: "",
      unitId: "",
      startDate: "",
      endDate: "",
      monthlyRent: "",
      depositAmount: "",
    });
    setIsCreateLeaseOpen(false);
  };

  const getStatusColor = (status: Lease["status"]) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary";
      case "terminated":
        return "bg-destructive/20 text-destructive";
      case "expired":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const calculateTotalPaid = (leaseId: string) => {
    const leasePayments = getPaymentsByLease(leaseId);
    return leasePayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateMonthsRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  };

  // Generate rent schedule for display
  const generateRentSchedule = (lease: Lease) => {
    const schedule = [];
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const leasePayments = getPaymentsByLease(lease.id);

    let current = new Date(start);
    while (current <= end) {
      const dueDate = new Date(current);
      const isPaid = leasePayments.some((p) => {
        const paymentDate = new Date(p.date);
        return (
          paymentDate.getMonth() === dueDate.getMonth() &&
          paymentDate.getFullYear() === dueDate.getFullYear() &&
          p.status === "completed"
        );
      });
      const isOverdue = dueDate < new Date() && !isPaid;

      schedule.push({
        dueDate: dueDate.toISOString().split("T")[0],
        amount: lease.monthlyRent,
        status: isPaid ? "paid" : isOverdue ? "overdue" : "pending",
      });

      current.setMonth(current.getMonth() + 1);
    }
    return schedule.slice(0, 12); // Show first 12 months
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leases</h1>
          <p className="text-muted-foreground mt-1">
            Manage lease agreements and rent schedules
          </p>
        </div>
        <Dialog open={isCreateLeaseOpen} onOpenChange={setIsCreateLeaseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Lease
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Create New Lease</DialogTitle>
              <DialogDescription>
                Set up a new lease agreement for a tenant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
                <Select
                  value={newLease.tenantId}
                  onValueChange={(value) =>
                    setNewLease({ ...newLease, tenantId: value })
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {tenants
                      .filter((t) => t.status === "active")
                      .map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={newLease.unitId}
                  onValueChange={(value) => {
                    const unit = units.find((u) => u.id === value);
                    setNewLease({
                      ...newLease,
                      unitId: value,
                      monthlyRent: unit?.baseRent.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableUnits.map((unit) => {
                      const property = getPropertyById(unit.propertyId);
                      return (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.unitNumber} - {property?.name} (${unit.baseRent}/mo)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newLease.startDate}
                    onChange={(e) =>
                      setNewLease({ ...newLease, startDate: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newLease.endDate}
                    onChange={(e) =>
                      setNewLease({ ...newLease, endDate: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={newLease.monthlyRent}
                    onChange={(e) =>
                      setNewLease({ ...newLease, monthlyRent: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={newLease.depositAmount}
                    onChange={(e) =>
                      setNewLease({ ...newLease, depositAmount: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateLeaseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLease} className="bg-primary text-primary-foreground">
                Create Lease
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tenant name..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProperty} onValueChange={setFilterProperty}>
          <SelectTrigger className="w-full sm:w-[200px] bg-input border-border">
            <SelectValue placeholder="Property" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leases Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Lease Agreements
          </CardTitle>
          <CardDescription>
            {filteredLeases.length} lease{filteredLeases.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Tenant</TableHead>
                  <TableHead className="text-muted-foreground">Unit</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Term</TableHead>
                  <TableHead className="text-muted-foreground">Rent</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Remaining</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => {
                  const tenant = getTenantById(lease.tenantId);
                  const unit = getUnitById(lease.unitId);
                  const property = getPropertyById(lease.propertyId);
                  const monthsRemaining = calculateMonthsRemaining(lease.endDate);
                  const isExpiringSoon = monthsRemaining <= 3 && lease.status === "active";

                  return (
                    <TableRow key={lease.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">{tenant?.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">Unit {unit?.unitNumber}</p>
                          <p className="text-xs text-muted-foreground">{property?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {new Date(lease.startDate).toLocaleDateString()} -{" "}
                            {new Date(lease.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-card-foreground">
                            {lease.monthlyRent.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{monthsRemaining} months</span>
                          {isExpiringSoon && (
                            <AlertTriangle className="h-4 w-4 text-chart-3" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lease.status)}>
                          {lease.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLease(lease);
                            setIsViewLeaseOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Lease Details Dialog */}
      <Dialog open={isViewLeaseOpen} onOpenChange={setIsViewLeaseOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Lease Details</DialogTitle>
            <DialogDescription>
              Complete lease information and payment schedule
            </DialogDescription>
          </DialogHeader>
          {selectedLease && (
            <div className="py-4 space-y-6">
              {/* Lease Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Monthly Rent</p>
                  <p className="text-xl font-bold text-primary">
                    ${selectedLease.monthlyRent.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Deposit</p>
                  <p className="text-xl font-bold text-card-foreground">
                    ${selectedLease.depositAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-xl font-bold text-card-foreground">
                    ${calculateTotalPaid(selectedLease.id).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(selectedLease.status)} mt-1`}>
                    {selectedLease.status}
                  </Badge>
                </div>
              </div>

              {/* Tenant & Unit Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Tenant</h4>
                  <p className="text-sm text-card-foreground">
                    {getTenantById(selectedLease.tenantId)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTenantById(selectedLease.tenantId)?.email}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Unit</h4>
                  <p className="text-sm text-card-foreground">
                    Unit {getUnitById(selectedLease.unitId)?.unitNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getPropertyById(selectedLease.propertyId)?.name}
                  </p>
                </div>
              </div>

              {/* Rent Schedule */}
              <div>
                <h4 className="text-sm font-semibold text-card-foreground mb-3">
                  Rent Schedule (First 12 Months)
                </h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Due Date</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateRentSchedule(selectedLease).map((item, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell className="text-muted-foreground">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-card-foreground">
                            ${item.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "paid"
                                  ? "bg-primary/20 text-primary"
                                  : item.status === "overdue"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
