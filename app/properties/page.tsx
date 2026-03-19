import { Sidebar } from "@/components/sidebar";
import { PropertiesContent } from "@/components/properties-content";
import { prisma } from "@/lib/prisma";
import type { Property, Unit } from "@/lib/store";

function toDateString(value: Date) {
  return value.toISOString().split("T")[0];
}

export default async function PropertiesPage() {
  const [properties, units] = await Promise.all([
    prisma.property.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.unit.findMany({
      orderBy: [
        { propertyId: "asc" },
        { unitNumber: "asc" },
      ],
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64">
        <PropertiesContent
          initialProperties={properties.map((property) => ({
            ...property,
            status: property.status as Property["status"],
            createdAt: toDateString(property.createdAt),
          }))}
          initialUnits={units.map((unit) => ({
            ...unit,
            status: unit.status as Unit["status"],
          }))}
        />
      </main>
    </div>
  );
}
