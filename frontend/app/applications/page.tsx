"use client";

import { Sidebar } from "@/components/sidebar";
import { ApplicationsContent } from "@/components/applications-content";

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <ApplicationsContent />
      </main>
    </div>
  );
}
