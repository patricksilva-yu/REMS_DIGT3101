"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Home, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Property, Unit } from "@/lib/types";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  const [newProperty, setNewProperty] = useState({
    name: "",
    address: "",
    description: "",
  });

  const [newUnit, setNewUnit] = useState({
    propertyId: "",
    unitNumber: "",
    floorNumber: "1",
    sizeSqft: "",
    baseRent: "",
    classification: "Tier 2",
    businessPurpose: "",
  });

  async function load() {
    try {
      const [propertyList, unitList] = await Promise.all([api.getProperties(), api.getUnits()]);
      setProperties(propertyList);
      setUnits(unitList);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load properties.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return properties;
    return properties.filter((property) =>
      property.name.toLowerCase().includes(query) || property.address.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  const propertyUnits = useMemo(() => {
    if (!selectedPropertyId) return [];
    return units.filter((unit) => unit.propertyId === selectedPropertyId);
  }, [selectedPropertyId, units]);

  async function handleAddProperty() {
    try {
      await api.createProperty(newProperty);
      setNewProperty({ name: "", address: "", description: "" });
      setIsAddPropertyOpen(false);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create property.");
    }
  }

  async function handleAddUnit() {
    try {
      await api.createUnit({
        propertyId: newUnit.propertyId,
        unitNumber: newUnit.unitNumber,
        floorNumber: Number(newUnit.floorNumber),
        sizeSqft: Number(newUnit.sizeSqft),
        baseRent: Number(newUnit.baseRent),
        classification: newUnit.classification,
        businessPurpose: newUnit.businessPurpose,
      });
      setNewUnit({
        propertyId: "",
        unitNumber: "",
        floorNumber: "1",
        sizeSqft: "",
        baseRent: "",
        classification: "Tier 2",
        businessPurpose: "",
      });
      setIsAddUnitOpen(false);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create unit.");
    }
  }

  function unitsForProperty(propertyId: string) {
    return units.filter((unit) => unit.propertyId === propertyId);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage sites, units, rent baselines, and occupancy.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Property</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Property</DialogTitle>
                <DialogDescription>Create a new property in the REMS portfolio.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="property-name">Name</Label>
                  <Input id="property-name" value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-address">Address</Label>
                  <Input id="property-address" value={newProperty.address} onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-description">Description</Label>
                  <Textarea id="property-description" value={newProperty.description} onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPropertyOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleAddProperty()}>Save Property</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Home className="h-4 w-4 mr-2" />Add Unit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Unit</DialogTitle>
                <DialogDescription>Create a leasable space under an existing property.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={newUnit.propertyId} onValueChange={(value) => setNewUnit({ ...newUnit, propertyId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Number</Label>
                    <Input value={newUnit.unitNumber} onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input type="number" value={newUnit.floorNumber} onChange={(e) => setNewUnit({ ...newUnit, floorNumber: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Size (sqft)</Label>
                    <Input type="number" value={newUnit.sizeSqft} onChange={(e) => setNewUnit({ ...newUnit, sizeSqft: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Rent</Label>
                    <Input type="number" value={newUnit.baseRent} onChange={(e) => setNewUnit({ ...newUnit, baseRent: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classification</Label>
                    <Input value={newUnit.classification} onChange={(e) => setNewUnit({ ...newUnit, classification: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Purpose</Label>
                    <Input value={newUnit.businessPurpose} onChange={(e) => setNewUnit({ ...newUnit, businessPurpose: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUnitOpen(false)}>Cancel</Button>
                <Button onClick={() => void handleAddUnit()}>Save Unit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          placeholder="Search properties by name or address..."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              Portfolio
            </CardTitle>
            <CardDescription>{filteredProperties.length} properties loaded from PostgreSQL.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const propertyUnitsCount = unitsForProperty(property.id).length;
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-xs text-muted-foreground">{property.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{property.address}</TableCell>
                      <TableCell>{propertyUnitsCount}</TableCell>
                      <TableCell><Badge variant="outline">{property.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => setSelectedPropertyId(property.id)}>View Units</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Unit Detail</CardTitle>
            <CardDescription>
              {selectedPropertyId ? "Units for the selected property." : "Choose a property to inspect its leasable spaces."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {propertyUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No property selected.</p>
            ) : (
              propertyUnits.map((unit) => (
                <div key={unit.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Unit {unit.unitNumber}</p>
                      <p className="text-sm text-muted-foreground">{unit.businessPurpose}</p>
                    </div>
                    <Badge>{unit.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>{unit.sizeSqft} sqft</span>
                    <span>{currency.format(unit.baseRent)}</span>
                    <span>Floor {unit.floorNumber}</span>
                    <span>{unit.classification}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
