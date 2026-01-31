"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  properties as initialProperties,
  units as initialUnits,
  getUnitsByProperty,
  type Property,
  type Unit,
} from "@/lib/store";
import { Building2, Plus, Search, Edit, Eye, Home } from "lucide-react";

export function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isViewUnitsOpen, setIsViewUnitsOpen] = useState(false);

  // Filter properties
  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // New property form state
  const [newProperty, setNewProperty] = useState({
    name: "",
    address: "",
    description: "",
  });

  // New unit form state
  const [newUnit, setNewUnit] = useState({
    unitNumber: "",
    floor: "",
    size: "",
    baseRent: "",
    status: "available" as Unit["status"],
  });

  const handleAddProperty = () => {
    const property: Property = {
      id: `prop-${Date.now()}`,
      name: newProperty.name,
      address: newProperty.address,
      description: newProperty.description,
      totalUnits: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProperties([...properties, property]);
    setNewProperty({ name: "", address: "", description: "" });
    setIsAddPropertyOpen(false);
  };

  const handleAddUnit = () => {
    if (!selectedProperty) return;
    const unit: Unit = {
      id: `unit-${Date.now()}`,
      propertyId: selectedProperty.id,
      unitNumber: newUnit.unitNumber,
      floor: parseInt(newUnit.floor),
      size: parseInt(newUnit.size),
      baseRent: parseInt(newUnit.baseRent),
      status: newUnit.status,
    };
    setUnits([...units, unit]);
    // Update property total units
    setProperties(
      properties.map((p) =>
        p.id === selectedProperty.id
          ? { ...p, totalUnits: p.totalUnits + 1 }
          : p
      )
    );
    setNewUnit({
      unitNumber: "",
      floor: "",
      size: "",
      baseRent: "",
      status: "available",
    });
    setIsAddUnitOpen(false);
  };

  const getPropertyUnits = (propertyId: string) => {
    return units.filter((u) => u.propertyId === propertyId);
  };

  const getStatusColor = (status: Unit["status"]) => {
    switch (status) {
      case "available":
        return "bg-primary/20 text-primary";
      case "occupied":
        return "bg-chart-2/20 text-chart-2";
      case "reserved":
        return "bg-chart-3/20 text-chart-3";
      case "maintenance":
        return "bg-destructive/20 text-destructive";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property portfolio and units
          </p>
        </div>
        <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Add New Property</DialogTitle>
              <DialogDescription>
                Enter the details for the new property
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown Business Center"
                  value={newProperty.name}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, name: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street, Toronto, ON"
                  value={newProperty.address}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, address: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property..."
                  value={newProperty.description}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, description: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPropertyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProperty} className="bg-primary text-primary-foreground">
                Add Property
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search properties by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const propertyUnits = getPropertyUnits(property.id);
          const occupiedUnits = propertyUnits.filter((u) => u.status === "occupied").length;
          const availableUnits = propertyUnits.filter((u) => u.status === "available").length;
          const occupancyRate = propertyUnits.length > 0
            ? Math.round((occupiedUnits / propertyUnits.length) * 100)
            : 0;

          return (
            <Card key={property.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-card-foreground">
                        {property.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {property.address}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={property.status === "active" ? "default" : "secondary"}
                    className={property.status === "active" ? "bg-primary/20 text-primary" : ""}
                  >
                    {property.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {property.description}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      {propertyUnits.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {availableUnits}
                    </p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      {occupancyRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsViewUnitsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Units
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsAddUnitOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Unit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Units Dialog */}
      <Dialog open={isViewUnitsOpen} onOpenChange={setIsViewUnitsOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {selectedProperty?.name} - Units
            </DialogTitle>
            <DialogDescription>
              All units in this property
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Unit #</TableHead>
                  <TableHead className="text-muted-foreground">Floor</TableHead>
                  <TableHead className="text-muted-foreground">Size (sq ft)</TableHead>
                  <TableHead className="text-muted-foreground">Base Rent</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProperty &&
                  getPropertyUnits(selectedProperty.id).map((unit) => (
                    <TableRow key={unit.id} className="border-border">
                      <TableCell className="font-medium text-card-foreground">
                        {unit.unitNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{unit.floor}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {unit.size.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        ${unit.baseRent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(unit.status)}>
                          {unit.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {selectedProperty && getPropertyUnits(selectedProperty.id).length === 0 && (
              <div className="text-center py-8">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No units added yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Add Unit to {selectedProperty?.name}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the new unit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Input
                  id="unitNumber"
                  placeholder="e.g., 301"
                  value={newUnit.unitNumber}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, unitNumber: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 3"
                  value={newUnit.floor}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, floor: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="e.g., 1200"
                  value={newUnit.size}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, size: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseRent">Base Rent ($)</Label>
                <Input
                  id="baseRent"
                  type="number"
                  placeholder="e.g., 2500"
                  value={newUnit.baseRent}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, baseRent: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newUnit.status}
                onValueChange={(value: Unit["status"]) =>
                  setNewUnit({ ...newUnit, status: value })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUnitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUnit} className="bg-primary text-primary-foreground">
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
