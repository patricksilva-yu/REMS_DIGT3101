CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    business_type VARCHAR(255),
    phone VARCHAR(50),
    contact_person VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE properties (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE units (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_number VARCHAR(50) NOT NULL,
    floor_number INTEGER NOT NULL,
    size_sqft INTEGER NOT NULL,
    base_rent NUMERIC(12, 2) NOT NULL,
    classification VARCHAR(100) NOT NULL,
    business_purpose VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_units_property_number UNIQUE (property_id, unit_number)
);

CREATE TABLE availability_slots (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES users(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES units(id),
    agent_id UUID NOT NULL REFERENCES users(id),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    appointment_window TSTZRANGE GENERATED ALWAYS AS (tstzrange(starts_at, ends_at, '[)')) STORED
);

ALTER TABLE appointments
    ADD CONSTRAINT appointments_no_agent_overlap
    EXCLUDE USING gist (agent_id WITH =, appointment_window WITH &&)
    WHERE (status <> 'CANCELLED');

ALTER TABLE appointments
    ADD CONSTRAINT appointments_no_unit_overlap
    EXCLUDE USING gist (unit_id WITH =, appointment_window WITH &&)
    WHERE (status <> 'CANCELLED');

CREATE TABLE rental_applications (
    id UUID PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES units(id),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    business_type VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    requested_cycle VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id)
);

CREATE TABLE renewal_policies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    notice_days INTEGER NOT NULL,
    renewal_term_months INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL
);

CREATE TABLE payment_cycle_rates (
    id UUID PRIMARY KEY,
    cycle VARCHAR(50) NOT NULL UNIQUE,
    multiplier NUMERIC(6, 4) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE discount_policies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_active_leases INTEGER NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    enabled BOOLEAN NOT NULL
);

CREATE TABLE leases (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES users(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    application_id UUID REFERENCES rental_applications(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_cycle VARCHAR(50) NOT NULL,
    cycle_multiplier NUMERIC(6, 4) NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    base_rent NUMERIC(12, 2) NOT NULL,
    effective_rent NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL,
    auto_renew BOOLEAN NOT NULL,
    status VARCHAR(50) NOT NULL,
    renewal_policy_id UUID REFERENCES renewal_policies(id),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE utility_rates (
    id UUID PRIMARY KEY,
    utility_type VARCHAR(50) NOT NULL,
    rate_per_unit NUMERIC(12, 2) NOT NULL,
    unit_label VARCHAR(100) NOT NULL,
    effective_from DATE NOT NULL
);

CREATE TABLE utility_readings (
    id UUID PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES units(id),
    utility_type VARCHAR(50) NOT NULL,
    reading_month DATE NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES users(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    lease_id UUID REFERENCES leases(id),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    misuse_caused BOOLEAN NOT NULL,
    misuse_charge_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    escalated BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE maintenance_events (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    lease_id UUID NOT NULL REFERENCES leases(id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    line_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount NUMERIC(12, 2) NOT NULL,
    paid_at DATE NOT NULL,
    reference VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_units_property_id ON units(property_id);
CREATE INDEX idx_availability_slots_agent_id ON availability_slots(agent_id);
CREATE INDEX idx_rental_applications_status ON rental_applications(status);
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_utility_readings_month ON utility_readings(reading_month);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

INSERT INTO users (id, full_name, email, password, role, company_name, business_type, phone, contact_person, status, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@rems.com', 'demo123', 'ADMIN', 'REMS Properties Inc.', NULL, '416-555-0000', 'System Administrator', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000002', 'Pat Morgan', 'manager@rems.com', 'demo123', 'PROPERTY_MANAGER', 'REMS Properties Inc.', NULL, '416-555-0100', 'Pat Morgan', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000003', 'Leah Agent', 'leah.agent@rems.com', 'demo123', 'LEASING_AGENT', 'REMS Properties Inc.', NULL, '416-555-0101', 'Leah Agent', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000004', 'Marco Agent', 'marco.agent@rems.com', 'demo123', 'LEASING_AGENT', 'REMS Properties Inc.', NULL, '416-555-0102', 'Marco Agent', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000005', 'Mina Repairs', 'maintenance@rems.com', 'demo123', 'MAINTENANCE_STAFF', 'REMS Properties Inc.', NULL, '416-555-0103', 'Mina Repairs', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000011', 'Acme Corporation', 'contact@acmecorp.com', 'demo123', 'TENANT', 'Acme Corporation', 'Technology', '416-555-1001', 'John Smith', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000012', 'Bean & Brew Coffee', 'info@beanbrew.com', 'demo123', 'TENANT', 'Bean & Brew Coffee', 'Food & Beverage', '416-555-1002', 'Sarah Johnson', 'ACTIVE', '2026-03-19T09:00:00Z'),
('00000000-0000-0000-0000-000000000013', 'StartUp Ventures', 'team@startupventures.com', 'demo123', 'TENANT', 'StartUp Ventures', 'Technology', '416-555-1003', 'David Wilson', 'ACTIVE', '2026-03-19T09:00:00Z');

INSERT INTO properties (id, name, address, description, status, created_at) VALUES
('10000000-0000-0000-0000-000000000001', 'Downtown Business Center', '123 Main Street, Toronto, ON', 'Premium office and storefront space in the downtown core.', 'ACTIVE', '2026-03-19T09:00:00Z'),
('10000000-0000-0000-0000-000000000002', 'Westside Mall', '456 West Avenue, Toronto, ON', 'Large-format shopping mall with strong weekend traffic.', 'ACTIVE', '2026-03-19T09:00:00Z'),
('10000000-0000-0000-0000-000000000003', 'Tech Hub Plaza', '789 Innovation Drive, Toronto, ON', 'Mixed retail and co-working property aimed at startups.', 'ACTIVE', '2026-03-19T09:00:00Z');

INSERT INTO units (id, property_id, unit_number, floor_number, size_sqft, base_rent, classification, business_purpose, status, created_at) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '101', 1, 1200, 2500.00, 'Tier 1', 'Tech retail', 'OCCUPIED', '2026-03-19T09:00:00Z'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '102', 1, 900, 2100.00, 'Tier 2', 'Professional services', 'AVAILABLE', '2026-03-19T09:00:00Z'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'A1', 1, 1800, 4200.00, 'Tier 1', 'Coffee shop', 'OCCUPIED', '2026-03-19T09:00:00Z'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'A2', 1, 1600, 3900.00, 'Tier 2', 'Fashion retail', 'AVAILABLE', '2026-03-19T09:00:00Z'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'S1', 1, 600, 1400.00, 'Tier 3', 'Startup office', 'OCCUPIED', '2026-03-19T09:00:00Z'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'S2', 1, 650, 1550.00, 'Tier 3', 'Consulting office', 'AVAILABLE', '2026-03-19T09:00:00Z');

INSERT INTO availability_slots (id, agent_id, property_id, starts_at, ends_at, created_at) VALUES
('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2026-03-20T13:00:00Z', '2026-03-20T21:00:00Z', '2026-03-19T09:00:00Z'),
('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '2026-03-21T13:00:00Z', '2026-03-21T20:00:00Z', '2026-03-19T09:00:00Z'),
('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '2026-03-20T14:00:00Z', '2026-03-20T21:00:00Z', '2026-03-19T09:00:00Z');

INSERT INTO appointments (id, unit_id, agent_id, applicant_name, applicant_email, applicant_phone, starts_at, ends_at, status, notes, created_at) VALUES
('81000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Jamie Prospect', 'jamie@example.com', '416-555-2001', '2026-03-20T15:00:00Z', '2026-03-20T16:00:00Z', 'BOOKED', 'First walkthrough for Unit 102.', '2026-03-19T09:00:00Z');

INSERT INTO rental_applications (id, unit_id, applicant_name, applicant_email, applicant_phone, business_type, contact_person, requested_cycle, notes, status, created_at, reviewed_at, reviewed_by) VALUES
('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'North Star Apparel', 'leasing@northstar.com', '416-555-2100', 'Retail', 'Alicia Stone', 'QUARTERLY', 'Needs high-foot-traffic unit for summer launch.', 'UNDER_REVIEW', '2026-03-18T16:00:00Z', NULL, NULL),
('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', 'Maple Advisory', 'hello@mapleadvisory.com', '416-555-2200', 'Consulting', 'Owen Lake', 'MONTHLY', 'Looking for a six-month flexible office lease.', 'SUBMITTED', '2026-03-19T11:00:00Z', NULL, NULL);

INSERT INTO renewal_policies (id, name, notice_days, renewal_term_months, enabled) VALUES
('91000000-0000-0000-0000-000000000001', 'Standard 12-month renewal', 45, 12, TRUE);

INSERT INTO payment_cycle_rates (id, cycle, multiplier, description) VALUES
('92000000-0000-0000-0000-000000000001', 'MONTHLY', 1.0000, 'Base monthly rate'),
('92000000-0000-0000-0000-000000000002', 'QUARTERLY', 0.9700, 'Quarterly pre-pay discount'),
('92000000-0000-0000-0000-000000000003', 'BIANNUAL', 0.9400, 'Bi-annual pre-pay discount'),
('92000000-0000-0000-0000-000000000004', 'ANNUAL', 0.9000, 'Annual pre-pay discount');

INSERT INTO discount_policies (id, name, min_active_leases, discount_percent, enabled) VALUES
('93000000-0000-0000-0000-000000000001', 'Two-store discount', 2, 5.00, TRUE),
('93000000-0000-0000-0000-000000000002', 'Portfolio discount', 3, 8.00, TRUE);

INSERT INTO leases (id, tenant_id, unit_id, property_id, application_id, start_date, end_date, payment_cycle, cycle_multiplier, discount_percent, base_rent, effective_rent, deposit_amount, auto_renew, status, renewal_policy_id, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NULL, '2026-01-01', '2026-12-31', 'MONTHLY', 1.0000, 0.00, 2500.00, 2500.00, 5000.00, TRUE, 'ACTIVE', '91000000-0000-0000-0000-000000000001', '2026-01-01T09:00:00Z'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', NULL, '2026-02-01', '2027-01-31', 'QUARTERLY', 0.9700, 0.00, 4200.00, 4074.00, 8000.00, TRUE, 'ACTIVE', '91000000-0000-0000-0000-000000000001', '2026-02-01T09:00:00Z'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', NULL, '2026-02-15', '2026-08-14', 'MONTHLY', 1.0000, 0.00, 1400.00, 1400.00, 2800.00, FALSE, 'ACTIVE', NULL, '2026-02-15T09:00:00Z');

INSERT INTO utility_rates (id, utility_type, rate_per_unit, unit_label, effective_from) VALUES
('94000000-0000-0000-0000-000000000001', 'ELECTRICITY', 0.18, 'kWh', '2026-01-01'),
('94000000-0000-0000-0000-000000000002', 'WATER', 2.25, 'm3', '2026-01-01'),
('94000000-0000-0000-0000-000000000003', 'WASTE', 35.00, 'pickup', '2026-01-01');

INSERT INTO utility_readings (id, unit_id, utility_type, reading_month, quantity, source, created_at) VALUES
('95000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ELECTRICITY', '2026-03-01', 850.00, 'SIMULATED', '2026-03-19T09:00:00Z'),
('95000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'WATER', '2026-03-01', 18.00, 'MANUAL', '2026-03-19T09:00:00Z'),
('95000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'WASTE', '2026-03-01', 1.00, 'SIMULATED', '2026-03-19T09:00:00Z'),
('95000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'ELECTRICITY', '2026-03-01', 1200.00, 'SIMULATED', '2026-03-19T09:00:00Z'),
('95000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'WATER', '2026-03-01', 22.00, 'MANUAL', '2026-03-19T09:00:00Z'),
('95000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'WASTE', '2026-03-01', 1.00, 'SIMULATED', '2026-03-19T09:00:00Z');

INSERT INTO maintenance_requests (id, tenant_id, unit_id, lease_id, category, description, urgency, misuse_caused, misuse_charge_amount, status, escalated, created_at, updated_at) VALUES
('96000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'HVAC', 'Air conditioning is not cooling the storefront.', 'HIGH', FALSE, 0.00, 'IN_PROGRESS', TRUE, '2026-03-17T10:00:00Z', '2026-03-18T13:00:00Z'),
('96000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'PLUMBING', 'Sink backed up after grease disposal.', 'MEDIUM', TRUE, 175.00, 'NEW', FALSE, '2026-03-18T14:00:00Z', '2026-03-18T14:00:00Z');

INSERT INTO maintenance_events (id, request_id, event_type, notes, created_at) VALUES
('97000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 'CREATED', 'Request created by tenant portal.', '2026-03-17T10:00:00Z'),
('97000000-0000-0000-0000-000000000002', '96000000-0000-0000-0000-000000000001', 'ESCALATED', 'Marked as urgent due to HVAC outage.', '2026-03-17T10:10:00Z'),
('97000000-0000-0000-0000-000000000003', '96000000-0000-0000-0000-000000000002', 'CREATED', 'Request created by tenant portal.', '2026-03-18T14:00:00Z');

INSERT INTO invoices (id, lease_id, billing_period_start, billing_period_end, due_date, subtotal, discount_amount, total, status, created_at, updated_at) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-03-01', '2026-03-31', '2026-03-10', 2725.50, 0.00, 2725.50, 'OVERDUE', '2026-03-01T09:00:00Z', '2026-03-18T09:00:00Z'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '2026-03-01', '2026-05-31', '2026-03-15', 12470.50, 0.00, 12470.50, 'PARTIALLY_PAID', '2026-03-01T09:00:00Z', '2026-03-18T09:00:00Z'),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '2026-03-01', '2026-03-31', '2026-03-12', 1400.00, 0.00, 1400.00, 'ISSUED', '2026-03-01T09:00:00Z', '2026-03-18T09:00:00Z');

INSERT INTO invoice_line_items (id, invoice_id, line_type, description, amount) VALUES
('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'RENT', 'Monthly rent for Unit 101', 2500.00),
('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'UTILITY', 'Electricity usage', 153.00),
('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'UTILITY', 'Water usage', 40.50),
('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'UTILITY', 'Waste pickup', 35.00),
('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', 'RENT', 'Quarterly rent for Unit A1', 12222.00),
('41000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', 'UTILITY', 'Electricity usage', 216.00),
('41000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002', 'UTILITY', 'Water usage', 49.50),
('41000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000002', 'UTILITY', 'Waste pickup', 35.00),
('41000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000003', 'RENT', 'Monthly rent for Unit S1', 1400.00);

INSERT INTO payments (id, invoice_id, amount, paid_at, reference, status, created_at) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1000.00, '2026-03-05', 'EFT-10001', 'COMPLETED', '2026-03-05T09:00:00Z'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 6000.00, '2026-03-06', 'EFT-10002', 'COMPLETED', '2026-03-06T09:00:00Z'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 2000.00, '2026-03-15', 'EFT-10003', 'COMPLETED', '2026-03-15T09:00:00Z');

INSERT INTO notifications (id, user_id, type, title, message, read_at, created_at) VALUES
('98000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'APPLICATION', 'Application awaiting review', 'North Star Apparel has applied for Unit A2.', NULL, '2026-03-18T16:05:00Z'),
('98000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'BILLING', 'Invoice overdue', 'Your March invoice for Unit 101 is overdue.', NULL, '2026-03-18T09:00:00Z'),
('98000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'MAINTENANCE', 'Urgent maintenance assigned', 'HVAC issue for Unit 101 requires attention.', NULL, '2026-03-17T10:15:00Z');
