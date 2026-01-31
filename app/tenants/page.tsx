"use client";

import { Sidebar } from "@/components/sidebar";
import { TenantsContent } from "@/components/tenants-content";

export default function TenantsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <TenantsContent />
      </main>
    </div>
  );
}
