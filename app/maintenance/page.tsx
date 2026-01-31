"use client";

import { Sidebar } from "@/components/sidebar";
import { MaintenanceContent } from "@/components/maintenance-content";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <MaintenanceContent />
      </main>
    </div>
  );
}
