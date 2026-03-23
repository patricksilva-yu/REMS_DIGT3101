"use client";

import { Sidebar } from "@/components/sidebar";
import { PaymentsContent } from "@/components/payments-content";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <PaymentsContent />
      </main>
    </div>
  );
}
