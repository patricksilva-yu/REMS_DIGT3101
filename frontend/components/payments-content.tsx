"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Invoice, Lease, Payment, Tenant, Unit } from "@/lib/types";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export function PaymentsContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const [newPayment, setNewPayment] = useState({
    invoiceId: "",
    amount: "",
    paidAt: new Date().toISOString().slice(0, 10),
    reference: "",
  });

  async function load() {
    try {
      const [invoiceList, paymentList, leaseList, tenantList, unitList] = await Promise.all([
        api.getInvoices(),
        api.getPayments(),
        api.getLeases(),
        api.getTenants(),
        api.getUnits(),
      ]);
      setInvoices(invoiceList);
      setPayments(paymentList);
      setLeases(leaseList);
      setTenants(tenantList);
      setUnits(unitList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load billing data.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) => {
      const lease = leases.find((item) => item.id === invoice.leaseId);
      const tenant = tenants.find((item) => item.id === lease?.tenantId);
      const unit = units.find((item) => item.id === lease?.unitId);
      return [tenant?.companyName, tenant?.fullName, unit?.unitNumber, invoice.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [invoices, leases, searchQuery, tenants, units]);

  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueTotal = invoices.filter((invoice) => invoice.status === "OVERDUE").reduce((sum, invoice) => sum + invoice.total, 0);

  async function handleRecordPayment() {
    try {
      await api.recordPayment({
        invoiceId: newPayment.invoiceId,
        amount: Number(newPayment.amount),
        paidAt: newPayment.paidAt,
        reference: newPayment.reference,
      });
      setNewPayment({
        invoiceId: "",
        amount: "",
        paidAt: new Date().toISOString().slice(0, 10),
        reference: "",
      });
      setIsRecordPaymentOpen(false);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to record payment.");
    }
  }

  function invoiceLabel(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return "Unknown invoice";
    const lease = leases.find((item) => item.id === invoice.leaseId);
    const tenant = tenants.find((item) => item.id === lease?.tenantId);
    const unit = units.find((item) => item.id === lease?.unitId);
    return `${tenant?.companyName ?? tenant?.fullName ?? "Unknown"} - Unit ${unit?.unitNumber ?? "?"}`;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground mt-1">Invoices, overdue balances, and recorded tenant payments.</p>
        </div>
        <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Apply a payment to an invoice already issued by the backend.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Invoice</Label>
                <Select value={newPayment.invoiceId} onValueChange={(value) => setNewPayment({ ...newPayment, invoiceId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoiceLabel(invoice.id)} - {currency.format(invoice.total)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newPayment.paidAt} onChange={(e) => setNewPayment({ ...newPayment, paidAt: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={newPayment.reference} onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleRecordPayment()}>Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <MetricCard title="Invoices" value={String(invoices.length)} icon={CreditCard} meta="Issued from lease + utility logic" />
        <MetricCard title="Collected" value={currency.format(totalCollected)} icon={DollarSign} meta="Recorded payments in PostgreSQL" />
        <MetricCard title="Overdue" value={currency.format(overdueTotal)} icon={CreditCard} meta="Outstanding invoice balance" />
        <MetricCard title="Payments" value={String(payments.length)} icon={DollarSign} meta="Latest payment activity" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Invoice Register</CardTitle>
          <CardDescription>Live invoice status across the leasing portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Tenant / Unit</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{invoice.billingPeriodStart} to {invoice.billingPeriodEnd}</p>
                    </div>
                  </TableCell>
                  <TableCell>{invoiceLabel(invoice.id)}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{currency.format(invoice.total)}</TableCell>
                  <TableCell><Badge variant={invoice.status === "OVERDUE" ? "destructive" : "outline"}>{invoice.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  meta,
  icon: Icon,
}: {
  title: string;
  value: string;
  meta: string;
  icon: typeof CreditCard;
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
