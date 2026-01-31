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
  tenants as initialTenants,
  leases,
  getUnitById,
  getPropertyById,
  type Tenant,
} from "@/lib/store";
import { Users, Plus, Search, Mail, Phone, Building2, Eye } from "lucide-react";

export function TenantsContent() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBusinessType, setFilterBusinessType] = useState<string>("all");
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Get unique business types
  const businessTypes = [...new Set(tenants.map((t) => t.businessType))];

  // Filter tenants
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || tenant.status === filterStatus;
    const matchesBusinessType =
      filterBusinessType === "all" || tenant.businessType === filterBusinessType;
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  // New tenant form state
  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
    businessType: "",
    contactPerson: "",
  });

  const handleAddTenant = () => {
    const tenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: newTenant.name,
      email: newTenant.email,
      phone: newTenant.phone,
      businessType: newTenant.businessType,
      contactPerson: newTenant.contactPerson,
      status: "active",
    };
    setTenants([...tenants, tenant]);
    setNewTenant({
      name: "",
      email: "",
      phone: "",
      businessType: "",
      contactPerson: "",
    });
    setIsAddTenantOpen(false);
  };

  const getTenantLeases = (tenantId: string) => {
    return leases.filter((l) => l.tenantId === tenantId);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Manage tenant profiles and contact information
          </p>
        </div>
        <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Add New Tenant</DialogTitle>
              <DialogDescription>
                Enter the tenant company details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Corporation"
                  value={newTenant.name}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, name: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@company.com"
                    value={newTenant.email}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, email: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="416-555-0100"
                    value={newTenant.phone}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, phone: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    placeholder="e.g., Technology"
                    value={newTenant.businessType}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, businessType: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="e.g., John Smith"
                    value={newTenant.contactPerson}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, contactPerson: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTenantOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTenant} className="bg-primary text-primary-foreground">
                Add Tenant
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
            placeholder="Search by name, email, or contact person..."
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
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBusinessType} onValueChange={setFilterBusinessType}>
          <SelectTrigger className="w-full sm:w-[180px] bg-input border-border">
            <SelectValue placeholder="Business Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Types</SelectItem>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Tenant Directory
          </CardTitle>
          <CardDescription>
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Company</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Business Type</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => {
                  const tenantLeases = getTenantLeases(tenant.id);
                  const activeLeases = tenantLeases.filter((l) => l.status === "active");
                  return (
                    <TableRow key={tenant.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">{tenant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.contactPerson}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {tenant.businessType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {tenant.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tenant.status === "active"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setIsViewDetailsOpen(true);
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

      {/* View Tenant Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Tenant Details</DialogTitle>
            <DialogDescription>
              Complete profile and lease information
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="py-4 space-y-6">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedTenant.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {selectedTenant.name}
                  </h3>
                  <Badge
                    className={
                      selectedTenant.status === "active"
                        ? "bg-primary/20 text-primary mt-1"
                        : "bg-muted text-muted-foreground mt-1"
                    }
                  >
                    {selectedTenant.status}
                  </Badge>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Person</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Business Type</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.businessType}</p>
                  </div>
                </div>
              </div>

              {/* Active Leases */}
              <div>
                <h4 className="text-sm font-semibold text-card-foreground mb-3">
                  Active Leases
                </h4>
                <div className="space-y-2">
                  {getTenantLeases(selectedTenant.id)
                    .filter((l) => l.status === "active")
                    .map((lease) => {
                      const unit = getUnitById(lease.unitId);
                      const property = getPropertyById(lease.propertyId);
                      return (
                        <div
                          key={lease.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-card-foreground">
                              Unit {unit?.unitNumber} - {property?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(lease.startDate).toLocaleDateString()} -{" "}
                              {new Date(lease.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            ${lease.monthlyRent.toLocaleString()}/mo
                          </p>
                        </div>
                      );
                    })}
                  {getTenantLeases(selectedTenant.id).filter((l) => l.status === "active")
                    .length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active leases
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
