export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  totalUnits: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor: number;
  size: number;
  baseRent: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  contactPerson: string;
  status: "active" | "inactive";
}

export interface Lease {
  id: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: "active" | "terminated" | "expired";
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  reference: string;
  status: "completed" | "pending" | "overdue";
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  unitId: string;
  category: "electrical" | "plumbing" | "hvac" | "structural" | "other";
  description: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "new" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type UserRole = "property-manager" | "leasing-agent" | "tenant" | "maintenance-staff" | "admin";

// Mock Properties
export const properties: Property[] = [
  {
    id: "prop-1",
    name: "Downtown Business Center",
    address: "123 Main Street, Toronto, ON",
    description: "Premium office space in the heart of downtown",
    totalUnits: 45,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "prop-2",
    name: "Westside Mall",
    address: "456 West Ave, Toronto, ON",
    description: "Major retail shopping center with high foot traffic",
    totalUnits: 120,
    status: "active",
    createdAt: "2023-06-20",
  },
  {
    id: "prop-3",
    name: "Tech Hub Plaza",
    address: "789 Innovation Drive, Toronto, ON",
    description: "Modern co-working and office spaces for tech companies",
    totalUnits: 60,
    status: "active",
    createdAt: "2024-03-10",
  },
];

// Mock Units
export const units: Unit[] = [
  { id: "unit-1", propertyId: "prop-1", unitNumber: "101", floor: 1, size: 1200, baseRent: 2500, status: "occupied" },
  { id: "unit-2", propertyId: "prop-1", unitNumber: "102", floor: 1, size: 800, baseRent: 1800, status: "available" },
  { id: "unit-3", propertyId: "prop-1", unitNumber: "201", floor: 2, size: 1500, baseRent: 3200, status: "occupied" },
  { id: "unit-4", propertyId: "prop-1", unitNumber: "202", floor: 2, size: 1000, baseRent: 2200, status: "reserved" },
  { id: "unit-5", propertyId: "prop-2", unitNumber: "A1", floor: 1, size: 2000, baseRent: 4500, status: "occupied" },
  { id: "unit-6", propertyId: "prop-2", unitNumber: "A2", floor: 1, size: 1800, baseRent: 4000, status: "available" },
  { id: "unit-7", propertyId: "prop-2", unitNumber: "B1", floor: 2, size: 1500, baseRent: 3500, status: "maintenance" },
  { id: "unit-8", propertyId: "prop-3", unitNumber: "S1", floor: 1, size: 500, baseRent: 1200, status: "occupied" },
  { id: "unit-9", propertyId: "prop-3", unitNumber: "S2", floor: 1, size: 600, baseRent: 1400, status: "available" },
  { id: "unit-10", propertyId: "prop-3", unitNumber: "L1", floor: 2, size: 2500, baseRent: 5000, status: "occupied" },
];

// Mock Tenants
export const tenants: Tenant[] = [
  {
    id: "tenant-1",
    name: "Acme Corporation",
    email: "contact@acmecorp.com",
    phone: "416-555-0101",
    businessType: "Technology",
    contactPerson: "John Smith",
    status: "active",
  },
  {
    id: "tenant-2",
    name: "Bean & Brew Coffee",
    email: "info@beanbrew.com",
    phone: "416-555-0102",
    businessType: "Food & Beverage",
    contactPerson: "Sarah Johnson",
    status: "active",
  },
  {
    id: "tenant-3",
    name: "Legal Eagles LLP",
    email: "office@legaleagles.com",
    phone: "416-555-0103",
    businessType: "Legal Services",
    contactPerson: "Michael Brown",
    status: "active",
  },
  {
    id: "tenant-4",
    name: "Fashion Forward",
    email: "hello@fashionforward.com",
    phone: "416-555-0104",
    businessType: "Retail",
    contactPerson: "Emily Davis",
    status: "active",
  },
  {
    id: "tenant-5",
    name: "StartUp Ventures",
    email: "team@startupventures.com",
    phone: "416-555-0105",
    businessType: "Technology",
    contactPerson: "David Wilson",
    status: "active",
  },
];

// Mock Leases
export const leases: Lease[] = [
  {
    id: "lease-1",
    tenantId: "tenant-1",
    unitId: "unit-1",
    propertyId: "prop-1",
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    monthlyRent: 2500,
    depositAmount: 5000,
    status: "active",
  },
  {
    id: "lease-2",
    tenantId: "tenant-2",
    unitId: "unit-5",
    propertyId: "prop-2",
    startDate: "2024-03-01",
    endDate: "2027-02-28",
    monthlyRent: 4500,
    depositAmount: 9000,
    status: "active",
  },
  {
    id: "lease-3",
    tenantId: "tenant-3",
    unitId: "unit-3",
    propertyId: "prop-1",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    monthlyRent: 3200,
    depositAmount: 6400,
    status: "active",
  },
  {
    id: "lease-4",
    tenantId: "tenant-5",
    unitId: "unit-8",
    propertyId: "prop-3",
    startDate: "2024-02-15",
    endDate: "2025-02-14",
    monthlyRent: 1200,
    depositAmount: 2400,
    status: "active",
  },
  {
    id: "lease-5",
    tenantId: "tenant-4",
    unitId: "unit-10",
    propertyId: "prop-3",
    startDate: "2024-04-01",
    endDate: "2026-03-31",
    monthlyRent: 5000,
    depositAmount: 10000,
    status: "active",
  },
];

// Mock Payments
export const payments: Payment[] = [
  { id: "pay-1", leaseId: "lease-1", amount: 2500, date: "2025-01-05", reference: "CHQ-10234", status: "completed" },
  { id: "pay-2", leaseId: "lease-1", amount: 2500, date: "2024-12-03", reference: "CHQ-10198", status: "completed" },
  { id: "pay-3", leaseId: "lease-2", amount: 4500, date: "2025-01-10", reference: "EFT-8821", status: "completed" },
  { id: "pay-4", leaseId: "lease-3", amount: 3200, date: "2025-01-02", reference: "CHQ-7645", status: "completed" },
  { id: "pay-5", leaseId: "lease-4", amount: 1200, date: "2025-01-15", reference: "EFT-9012", status: "pending" },
  { id: "pay-6", leaseId: "lease-5", amount: 5000, date: "2024-12-28", reference: "EFT-8900", status: "completed" },
  { id: "pay-7", leaseId: "lease-2", amount: 4500, date: "2024-11-08", reference: "EFT-8750", status: "completed" },
];

// Mock Maintenance Requests
export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: "maint-1",
    tenantId: "tenant-1",
    unitId: "unit-1",
    category: "hvac",
    description: "Air conditioning unit making loud noise and not cooling properly",
    urgency: "high",
    status: "in-progress",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-22",
    notes: "Technician scheduled for Jan 25",
  },
  {
    id: "maint-2",
    tenantId: "tenant-2",
    unitId: "unit-5",
    category: "plumbing",
    description: "Slow drain in kitchen sink area",
    urgency: "medium",
    status: "new",
    createdAt: "2025-01-25",
    updatedAt: "2025-01-25",
  },
  {
    id: "maint-3",
    tenantId: "tenant-3",
    unitId: "unit-3",
    category: "electrical",
    description: "Flickering lights in conference room",
    urgency: "low",
    status: "completed",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-15",
    notes: "Replaced faulty ballast in fluorescent fixture",
  },
  {
    id: "maint-4",
    tenantId: "tenant-5",
    unitId: "unit-8",
    category: "structural",
    description: "Door handle broken, unable to lock office properly",
    urgency: "critical",
    status: "new",
    createdAt: "2025-01-28",
    updatedAt: "2025-01-28",
  },
];

// Helper functions
export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getUnitById(id: string): Unit | undefined {
  return units.find((u) => u.id === id);
}

export function getTenantById(id: string): Tenant | undefined {
  return tenants.find((t) => t.id === id);
}

export function getLeaseById(id: string): Lease | undefined {
  return leases.find((l) => l.id === id);
}

export function getUnitsByProperty(propertyId: string): Unit[] {
  return units.filter((u) => u.propertyId === propertyId);
}

export function getLeasesByTenant(tenantId: string): Lease[] {
  return leases.filter((l) => l.tenantId === tenantId);
}

export function getPaymentsByLease(leaseId: string): Payment[] {
  return payments.filter((p) => p.leaseId === leaseId);
}

export function getMaintenanceByTenant(tenantId: string): MaintenanceRequest[] {
  return maintenanceRequests.filter((m) => m.tenantId === tenantId);
}

// Calculate dashboard metrics
export function getDashboardMetrics() {
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "occupied").length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  
  const activeLeases = leases.filter((l) => l.status === "active");
  const totalMonthlyRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
  
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "overdue");
  const overdueAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const openMaintenance = maintenanceRequests.filter((m) => m.status === "new" || m.status === "in-progress").length;
  
  return {
    totalProperties: properties.length,
    totalUnits,
    occupiedUnits,
    occupancyRate,
    availableUnits: units.filter((u) => u.status === "available").length,
    totalMonthlyRent,
    overdueAmount,
    openMaintenance,
    activeLeases: activeLeases.length,
    totalTenants: tenants.filter((t) => t.status === "active").length,
  };
}
