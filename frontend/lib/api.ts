import type {
  Appointment,
  AvailabilitySlot,
  DashboardMetrics,
  Invoice,
  InvoiceLineItem,
  Lease,
  MaintenanceEvent,
  MaintenanceRequest,
  Notification,
  Payment,
  Property,
  PublicUnitView,
  RentalApplication,
  Tenant,
  Unit,
  UtilityRate,
  UtilityReading,
} from "@/lib/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ id: string; fullName: string; email: string; role: string; status: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getDashboard: () => request<DashboardMetrics>("/api/dashboard"),

  getProperties: () => request<Property[]>("/api/properties"),
  createProperty: (payload: { name: string; address: string; description: string }) =>
    request<Property>("/api/properties", { method: "POST", body: JSON.stringify(payload) }),

  getUnits: () => request<Unit[]>("/api/units"),
  createUnit: (payload: {
    propertyId: string;
    unitNumber: string;
    floorNumber: number;
    sizeSqft: number;
    baseRent: number;
    classification: string;
    businessPurpose: string;
  }) => request<Unit>("/api/units", { method: "POST", body: JSON.stringify(payload) }),

  searchUnits: (params: URLSearchParams) => request<PublicUnitView[]>(`/api/public/units/search?${params.toString()}`),
  getAvailability: (propertyId?: string) =>
    request<AvailabilitySlot[]>(propertyId ? `/api/public/availability?propertyId=${propertyId}` : "/api/public/availability"),
  createAppointment: (payload: {
    unitId: string;
    agentId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    startsAt: string;
    endsAt: string;
    notes?: string;
  }) => request<Appointment>("/api/public/appointments", { method: "POST", body: JSON.stringify(payload) }),
  getAppointments: () => request<Appointment[]>("/api/appointments"),

  createApplication: (payload: {
    unitId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    businessType: string;
    contactPerson: string;
    requestedCycle: string;
    notes?: string;
  }) => request<RentalApplication>("/api/public/applications", { method: "POST", body: JSON.stringify(payload) }),
  getApplications: () => request<RentalApplication[]>("/api/applications"),
  reviewApplication: (
    applicationId: string,
    payload: {
      reviewerId: string;
      approved: boolean;
      notes?: string;
      startDate?: string;
      endDate?: string;
      depositAmount?: number;
      autoRenew?: boolean;
      renewalPolicyId?: string;
    }
  ) => request<Lease | RentalApplication>(`/api/applications/${applicationId}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),

  getTenants: () => request<Tenant[]>("/api/tenants"),
  createTenant: (payload: {
    fullName: string;
    email: string;
    phone: string;
    businessType: string;
    contactPerson: string;
    companyName: string;
    password: string;
  }) => request<Tenant>("/api/tenants", { method: "POST", body: JSON.stringify(payload) }),

  getLeases: () => request<Lease[]>("/api/leases"),

  getInvoices: () => request<Invoice[]>("/api/invoices"),
  getInvoiceLineItems: (invoiceId: string) => request<InvoiceLineItem[]>(`/api/invoices/${invoiceId}/line-items`),
  getPayments: () => request<Payment[]>("/api/payments"),
  recordPayment: (payload: { invoiceId: string; amount: number; paidAt: string; reference: string }) =>
    request<Payment>("/api/payments", { method: "POST", body: JSON.stringify(payload) }),

  getUtilityRates: () => request<UtilityRate[]>("/api/utilities/rates"),
  getUtilityReadings: (readingMonth?: string) =>
    request<UtilityReading[]>(readingMonth ? `/api/utilities/readings?readingMonth=${readingMonth}` : "/api/utilities/readings"),
  createUtilityReading: (payload: {
    unitId: string;
    utilityType: string;
    readingMonth: string;
    quantity: number;
    source: string;
  }) => request<UtilityReading>("/api/utilities/readings", { method: "POST", body: JSON.stringify(payload) }),

  getMaintenanceRequests: () => request<MaintenanceRequest[]>("/api/maintenance"),
  getMaintenanceEvents: (requestId: string) => request<MaintenanceEvent[]>(`/api/maintenance/${requestId}/events`),
  createMaintenanceRequest: (payload: {
    tenantId: string;
    unitId: string;
    leaseId?: string;
    category: string;
    description: string;
    urgency: string;
    misuseCaused: boolean;
    misuseChargeAmount?: number;
  }) => request<MaintenanceRequest>("/api/maintenance", { method: "POST", body: JSON.stringify(payload) }),
  updateMaintenanceStatus: (requestId: string, payload: { status: string; notes?: string }) =>
    request<MaintenanceRequest>(`/api/maintenance/${requestId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getNotifications: (userId: string) => request<Notification[]>(`/api/notifications?userId=${userId}`),
};
