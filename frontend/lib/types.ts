export type PropertyStatus = "ACTIVE" | "INACTIVE";
export type UnitStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
export type PaymentCycle = "MONTHLY" | "QUARTERLY" | "BIANNUAL" | "ANNUAL";
export type LeaseStatus = "ACTIVE" | "TERMINATED" | "EXPIRED" | "PENDING";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
export type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED";
export type MaintenanceStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type MaintenanceUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceCategory = "ELECTRICAL" | "PLUMBING" | "HVAC" | "STRUCTURAL" | "OTHER";
export type AppointmentStatus = "BOOKED" | "COMPLETED" | "CANCELLED";
export type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type UserRole = "ADMIN" | "PROPERTY_MANAGER" | "LEASING_AGENT" | "MAINTENANCE_STAFF" | "TENANT";

export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  status: PropertyStatus;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floorNumber: number;
  sizeSqft: number;
  baseRent: number;
  classification: string;
  businessPurpose: string;
  status: UnitStatus;
  createdAt: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName?: string | null;
  businessType?: string | null;
  phone?: string | null;
  contactPerson?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Appointment {
  id: string;
  unitId: string;
  agentId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  agentId: string;
  propertyId: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface RentalApplication {
  id: string;
  unitId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  businessType: string;
  contactPerson: string;
  requestedCycle: PaymentCycle;
  notes?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface Lease {
  id: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  applicationId?: string | null;
  startDate: string;
  endDate: string;
  paymentCycle: PaymentCycle;
  cycleMultiplier: number;
  discountPercent: number;
  baseRent: number;
  effectiveRent: number;
  depositAmount: number;
  autoRenew: boolean;
  status: LeaseStatus;
  renewalPolicyId?: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  leaseId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  lineType: string;
  description: string;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface UtilityRate {
  id: string;
  utilityType: "ELECTRICITY" | "WATER" | "WASTE";
  ratePerUnit: number;
  unitLabel: string;
  effectiveFrom: string;
}

export interface UtilityReading {
  id: string;
  unitId: string;
  utilityType: "ELECTRICITY" | "WATER" | "WASTE";
  readingMonth: string;
  quantity: number;
  source: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  unitId: string;
  leaseId?: string | null;
  category: MaintenanceCategory;
  description: string;
  urgency: MaintenanceUrgency;
  misuseCaused: boolean;
  misuseChargeAmount: number;
  status: MaintenanceStatus;
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceEvent {
  id: string;
  requestId: string;
  eventType: string;
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "APPOINTMENT" | "APPLICATION" | "BILLING" | "LEASE" | "MAINTENANCE";
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  availableUnits: number;
  totalMonthlyRent: number;
  overdueAmount: number;
  openMaintenance: number;
  activeLeases: number;
  totalTenants: number;
}

export interface PublicUnitView {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  unitNumber: string;
  floorNumber: number;
  sizeSqft: number;
  baseRent: number;
  classification: string;
  businessPurpose: string;
  status: UnitStatus;
}
