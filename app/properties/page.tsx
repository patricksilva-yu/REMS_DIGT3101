"use client";

import { Sidebar } from "@/components/sidebar";
import { PropertiesContent } from "@/components/properties-content";

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <PropertiesContent />
      </main>
    </div>
  );
}
