"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCheck2, FileText } from "lucide-react";
import { api } from "@/lib/api";
import type { RentalApplication, Unit } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

const REVIEWER_ID = "00000000-0000-0000-0000-000000000002";

export function ApplicationsContent() {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selected, setSelected] = useState<RentalApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    depositAmount: "",
    notes: "",
  });

  async function load() {
    try {
      const [applicationList, unitList] = await Promise.all([api.getApplications(), api.getUnits()]);
      setApplications(applicationList);
      setUnits(unitList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load applications.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const openApplications = useMemo(
    () => applications.filter((application) => application.status === "SUBMITTED" || application.status === "UNDER_REVIEW"),
    [applications]
  );

  async function review(approved: boolean) {
    if (!selected) return;
    try {
      await api.reviewApplication(selected.id, {
        reviewerId: REVIEWER_ID,
        approved,
        notes: reviewForm.notes,
        startDate: approved ? reviewForm.startDate : undefined,
        endDate: approved ? reviewForm.endDate : undefined,
        depositAmount: approved && reviewForm.depositAmount ? Number(reviewForm.depositAmount) : undefined,
        autoRenew: approved,
      });
      setSelected(null);
      setReviewForm({
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        depositAmount: "",
        notes: "",
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to review application.");
    }
  }

  function unitLabel(unitId: string) {
    return units.find((unit) => unit.id === unitId)?.unitNumber ?? "Unknown unit";
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-1">Review public applications and convert approvals into active leases.</p>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {openApplications.map((application) => (
          <Card key={application.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {application.applicantName}
                  </CardTitle>
                  <CardDescription>{application.applicantEmail} • Unit {unitLabel(application.unitId)}</CardDescription>
                </div>
                <Badge>{application.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{application.notes || "No applicant notes provided."}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <span>Contact: {application.contactPerson}</span>
                <span>Phone: {application.applicantPhone}</span>
                <span>Business: {application.businessType}</span>
                <span>Cycle: {application.requestedCycle}</span>
              </div>
              <Button onClick={() => setSelected(application)}><FileCheck2 className="mr-2 h-4 w-4" />Review Application</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Rental Application</DialogTitle>
            <DialogDescription>Approve this application to create an active lease and first invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start</Label>
                <Input type="date" value={reviewForm.startDate} onChange={(e) => setReviewForm({ ...reviewForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Lease End</Label>
                <Input type="date" value={reviewForm.endDate} onChange={(e) => setReviewForm({ ...reviewForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deposit Amount</Label>
              <Input type="number" value={reviewForm.depositAmount} onChange={(e) => setReviewForm({ ...reviewForm, depositAmount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Reviewer Notes</Label>
              <Textarea value={reviewForm.notes} onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => void review(false)}>Reject</Button>
            <Button onClick={() => void review(true)}>Approve & Create Lease</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
