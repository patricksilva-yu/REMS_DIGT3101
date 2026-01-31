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
  payments as initialPayments,
  leases,
  getTenantById,
  getUnitById,
  getPropertyById,
  getLeaseById,
  type Payment,
} from "@/lib/store";
import { CreditCard, Plus, Search, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function PaymentsContent() {
  const [paymentsList, setPaymentsList] = useState<Payment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Filter payments
  const filteredPayments = paymentsList.filter((payment) => {
    const lease = getLeaseById(payment.leaseId);
    const tenant = lease ? getTenantById(lease.tenantId) : null;
    const matchesSearch =
      tenant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort by date (most recent first)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    leaseId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  // Active leases for payment
  const activeLeases = leases.filter((l) => l.status === "active");

  const handleRecordPayment = () => {
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      leaseId: newPayment.leaseId,
      amount: parseInt(newPayment.amount),
      date: newPayment.date,
      reference: newPayment.reference,
      status: "completed",
    };
    setPaymentsList([...paymentsList, payment]);
    setNewPayment({
      leaseId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
    });
    setIsRecordPaymentOpen(false);
  };

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-chart-3" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-primary/20 text-primary";
      case "pending":
        return "bg-chart-3/20 text-chart-3";
      case "overdue":
        return "bg-destructive/20 text-destructive";
      default:
        return "";
    }
  };

  // Calculate totals
  const totalReceived = paymentsList
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentsList
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = paymentsList
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Record and track rent payments
          </p>
        </div>
        <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Record Payment</DialogTitle>
              <DialogDescription>
                Record a rent payment for a lease
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lease">Lease / Tenant</Label>
                <Select
                  value={newPayment.leaseId}
                  onValueChange={(value) => {
                    const lease = getLeaseById(value);
                    setNewPayment({
                      ...newPayment,
                      leaseId: value,
                      amount: lease?.monthlyRent.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select lease" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {activeLeases.map((lease) => {
                      const tenant = getTenantById(lease.tenantId);
                      const unit = getUnitById(lease.unitId);
                      return (
                        <SelectItem key={lease.id} value={lease.id}>
                          {tenant?.name} - Unit {unit?.unitNumber} (${lease.monthlyRent}/mo)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newPayment.date}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, date: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="e.g., CHQ-12345 or EFT-98765"
                  value={newPayment.reference}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, reference: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} className="bg-primary text-primary-foreground">
                Record Payment
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
              Total Received
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentsList.filter((p) => p.status === "completed").length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              ${totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentsList.filter((p) => p.status === "pending").length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentsList.filter((p) => p.status === "overdue").length} overdue payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tenant name or reference..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>
            {sortedPayments.length} payment{sortedPayments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Tenant</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Unit</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Reference</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => {
                  const lease = getLeaseById(payment.leaseId);
                  const tenant = lease ? getTenantById(lease.tenantId) : null;
                  const unit = lease ? getUnitById(lease.unitId) : null;
                  const property = lease ? getPropertyById(lease.propertyId) : null;

                  return (
                    <TableRow key={payment.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-card-foreground">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">{tenant?.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            Unit {unit?.unitNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-card-foreground">Unit {unit?.unitNumber}</p>
                          <p className="text-xs text-muted-foreground">{property?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-card-foreground">
                            {payment.amount.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <code className="text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground">
                          {payment.reference}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
