"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Home, Search, Send } from "lucide-react";
import { api } from "@/lib/api";
import type { AvailabilitySlot, PublicUnitView } from "@/lib/types";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const APPOINTMENT_DURATION_OPTIONS = [30, 60, 90, 120];

function formatSlotLabel(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SpacesContent() {
  const [units, setUnits] = useState<PublicUnitView[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<PublicUnitView | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    classification: "all",
    maxRent: "",
    minSize: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [appointmentForm, setAppointmentForm] = useState({
    slotKey: "",
    appointmentStart: "",
    durationMinutes: "60",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    notes: "",
  });

  const [applicationForm, setApplicationForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    businessType: "",
    contactPerson: "",
    requestedCycle: "MONTHLY",
    notes: "",
  });

  async function loadUnits() {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.classification !== "all") params.set("classification", filters.classification);
      if (filters.maxRent) params.set("maxRent", filters.maxRent);
      if (filters.minSize) params.set("minSize", filters.minSize);
      const unitList = await api.searchUnits(params);
      setUnits(unitList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load available units.");
    }
  }

  useEffect(() => {
    void loadUnits();
  }, []);

  useEffect(() => {
    void loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedUnit) return;
      try {
        const slots = await api.getAvailability(selectedUnit.propertyId);
        setAvailability(slots);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load availability.");
      }
    }

    void loadAvailability();
  }, [selectedUnit]);

  const filteredSlots = useMemo(() => {
    if (!selectedUnit) return [];
    return availability.filter((slot) => slot.propertyId === selectedUnit.propertyId);
  }, [availability, selectedUnit]);

  const selectedAvailabilitySlot = useMemo(
    () => filteredSlots.find((item) => `${item.id}:${item.startsAt}` === appointmentForm.slotKey) ?? null,
    [appointmentForm.slotKey, filteredSlots]
  );

  const appointmentStartOptions = useMemo(() => {
    if (!selectedAvailabilitySlot) return [];

    const startsAt = new Date(selectedAvailabilitySlot.startsAt).getTime();
    const endsAt = new Date(selectedAvailabilitySlot.endsAt).getTime();
    const latestStart = endsAt - 30 * 60 * 1000;
    const options: string[] = [];

    for (let current = startsAt; current <= latestStart; current += 30 * 60 * 1000) {
      options.push(new Date(current).toISOString());
    }

    return options;
  }, [selectedAvailabilitySlot]);

  const durationOptions = useMemo(() => {
    if (!selectedAvailabilitySlot || !appointmentForm.appointmentStart) {
      return APPOINTMENT_DURATION_OPTIONS;
    }

    const start = new Date(appointmentForm.appointmentStart).getTime();
    const slotEnd = new Date(selectedAvailabilitySlot.endsAt).getTime();
    const remainingMinutes = Math.max(0, Math.floor((slotEnd - start) / (30 * 60 * 1000)) * 30);

    return APPOINTMENT_DURATION_OPTIONS.filter((minutes) => minutes <= remainingMinutes);
  }, [appointmentForm.appointmentStart, selectedAvailabilitySlot]);

  useEffect(() => {
    if (!selectedAvailabilitySlot) return;

    setAppointmentForm((current) => {
      const nextStart = appointmentStartOptions[0] ?? "";
      return {
        ...current,
        appointmentStart: nextStart,
        durationMinutes: durationOptions.includes(Number(current.durationMinutes))
          ? current.durationMinutes
          : String(durationOptions[0] ?? 60),
      };
    });
  }, [appointmentStartOptions, durationOptions, selectedAvailabilitySlot]);

  async function submitAppointment() {
    if (!selectedUnit) return;
    if (!selectedAvailabilitySlot || !appointmentForm.appointmentStart) return;

    const startsAt = new Date(appointmentForm.appointmentStart);
    const endsAt = new Date(startsAt.getTime() + Number(appointmentForm.durationMinutes) * 60 * 1000);

    try {
      await api.createAppointment({
        unitId: selectedUnit.id,
        agentId: selectedAvailabilitySlot.agentId,
        applicantName: appointmentForm.applicantName,
        applicantEmail: appointmentForm.applicantEmail,
        applicantPhone: appointmentForm.applicantPhone,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        notes: appointmentForm.notes,
      });
      setBookingOpen(false);
      setAppointmentForm({
        slotKey: "",
        appointmentStart: "",
        durationMinutes: "60",
        applicantName: "",
        applicantEmail: "",
        applicantPhone: "",
        notes: "",
      });
      setMessage("Viewing appointment booked successfully.");
      setError(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit booking.");
    }
  }

  async function submitApplication() {
    if (!selectedUnit) return;
    try {
      await api.createApplication({
        unitId: selectedUnit.id,
        ...applicationForm,
      });
      setApplicationOpen(false);
      setApplicationForm({
        applicantName: "",
        applicantEmail: "",
        applicantPhone: "",
        businessType: "",
        contactPerson: "",
        requestedCycle: "MONTHLY",
        notes: "",
      });
      setMessage("Rental application submitted successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit application.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-10 max-w-3xl">
          <Badge className="mb-4">Public Leasing Portal</Badge>
          <h1 className="text-4xl font-bold text-foreground">Search retail and office space across the REMS portfolio.</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Filter current availability, book a site visit with a leasing agent, and submit a rental application without leaving the portal.
          </p>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-primary">{message}</p> : null}

        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Search Filters</CardTitle>
            <CardDescription>Use the same availability data the staff dashboard sees.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Property or use case" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Classification</Label>
              <Select value={filters.classification} onValueChange={(value) => setFilters({ ...filters, classification: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="Tier 1">Tier 1</SelectItem>
                  <SelectItem value="Tier 2">Tier 2</SelectItem>
                  <SelectItem value="Tier 3">Tier 3</SelectItem>
                  <SelectItem value="Tier 4">Tier 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Rent</Label>
              <Input type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} placeholder="4500" />
            </div>
            <div className="space-y-2">
              <Label>Min Size</Label>
              <Input type="number" value={filters.minSize} onChange={(e) => setFilters({ ...filters, minSize: e.target.value })} placeholder="800" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {units.map((unit) => (
            <Card key={unit.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Unit {unit.unitNumber}
                    </CardTitle>
                    <CardDescription>{unit.propertyName}</CardDescription>
                  </div>
                  <Badge>{unit.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{unit.propertyAddress}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>{unit.sizeSqft} sqft</span>
                  <span>{currency.format(unit.baseRent)}</span>
                  <span>{unit.classification}</span>
                  <span>{unit.businessPurpose}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setError(null);
                      setMessage(null);
                      setAppointmentForm({
                        slotKey: "",
                        appointmentStart: "",
                        durationMinutes: "60",
                        applicantName: "",
                        applicantEmail: "",
                        applicantPhone: "",
                        notes: "",
                      });
                      setBookingOpen(true);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Viewing
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setError(null);
                      setMessage(null);
                      setApplicationOpen(true);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Viewing</DialogTitle>
            <DialogDescription>{selectedUnit ? `Book a visit for Unit ${selectedUnit.unitNumber} at ${selectedUnit.propertyName}.` : "Select a unit."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Slot</Label>
              <Select value={appointmentForm.slotKey} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, slotKey: value })}>
                <SelectTrigger><SelectValue placeholder="Select a leasing slot" /></SelectTrigger>
                <SelectContent>
                  {filteredSlots.map((slot) => (
                    <SelectItem key={slot.id} value={`${slot.id}:${slot.startsAt}`}>
                      {formatSlotLabel(slot.startsAt)} to {formatSlotLabel(slot.endsAt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Appointment Start</Label>
                <Select
                  value={appointmentForm.appointmentStart}
                  onValueChange={(value) => setAppointmentForm({ ...appointmentForm, appointmentStart: value })}
                  disabled={!selectedAvailabilitySlot}
                >
                  <SelectTrigger><SelectValue placeholder="Select a start time" /></SelectTrigger>
                  <SelectContent>
                    {appointmentStartOptions.map((start) => (
                      <SelectItem key={start} value={start}>
                        {formatSlotLabel(start)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={appointmentForm.durationMinutes}
                  onValueChange={(value) => setAppointmentForm({ ...appointmentForm, durationMinutes: value })}
                  disabled={!selectedAvailabilitySlot}
                >
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {minutes} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={appointmentForm.applicantName} onChange={(e) => setAppointmentForm({ ...appointmentForm, applicantName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={appointmentForm.applicantPhone} onChange={(e) => setAppointmentForm({ ...appointmentForm, applicantPhone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={appointmentForm.applicantEmail} onChange={(e) => setAppointmentForm({ ...appointmentForm, applicantEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={appointmentForm.notes} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={() => void submitAppointment()}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Rental Application</DialogTitle>
            <DialogDescription>{selectedUnit ? `Apply for Unit ${selectedUnit.unitNumber} at ${selectedUnit.propertyName}.` : "Select a unit."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={applicationForm.applicantName} onChange={(e) => setApplicationForm({ ...applicationForm, applicantName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={applicationForm.contactPerson} onChange={(e) => setApplicationForm({ ...applicationForm, contactPerson: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={applicationForm.applicantEmail} onChange={(e) => setApplicationForm({ ...applicationForm, applicantEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={applicationForm.applicantPhone} onChange={(e) => setApplicationForm({ ...applicationForm, applicantPhone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input value={applicationForm.businessType} onChange={(e) => setApplicationForm({ ...applicationForm, businessType: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Cycle</Label>
                <Select value={applicationForm.requestedCycle} onValueChange={(value) => setApplicationForm({ ...applicationForm, requestedCycle: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["MONTHLY", "QUARTERLY", "BIANNUAL", "ANNUAL"].map((cycle) => (
                      <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={applicationForm.notes} onChange={(e) => setApplicationForm({ ...applicationForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationOpen(false)}>Cancel</Button>
            <Button onClick={() => void submitApplication()}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
