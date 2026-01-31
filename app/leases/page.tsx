"use client";

import { Sidebar } from "@/components/sidebar";
import { LeasesContent } from "@/components/leases-content";

export default function LeasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <LeasesContent />
      </main>
    </div>
  );
}
