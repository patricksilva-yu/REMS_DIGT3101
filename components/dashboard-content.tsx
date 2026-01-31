"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardMetrics,
  properties,
  maintenanceRequests,
  tenants,
  leases,
  units,
  getTenantById,
  getUnitById,
  getPropertyById,
} from "@/lib/store";
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Home,
  FileText,
  Wrench,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const metrics = getDashboardMetrics();

// Mock revenue data
const revenueData = [
  { month: "Aug", revenue: 42000 },
  { month: "Sep", revenue: 45000 },
  { month: "Oct", revenue: 48000 },
  { month: "Nov", revenue: 52000 },
  { month: "Dec", revenue: 54000 },
  { month: "Jan", revenue: 56400 },
];

// Occupancy by property
const occupancyData = properties.map((property) => {
  const propertyUnits = units.filter((u) => u.propertyId === property.id);
  const occupied = propertyUnits.filter((u) => u.status === "occupied").length;
  return {
    name: property.name.split(" ")[0],
    value: occupied,
    total: propertyUnits.length,
  };
});

const COLORS = ["hsl(160, 50%, 50%)", "hsl(200, 50%, 55%)", "hsl(85, 50%, 55%)"];

export function DashboardContent() {
  const recentMaintenance = maintenanceRequests
    .filter((m) => m.status === "new" || m.status === "in-progress")
    .slice(0, 4);

  const recentLeases = leases.filter((l) => l.status === "active").slice(0, 4);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your real estate portfolio
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.totalProperties}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.occupiedUnits} of {metrics.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ${metrics.totalMonthlyRent.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.openMaintenance}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {maintenanceRequests.filter((m) => m.urgency === "critical" || m.urgency === "high").length} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
            <CardDescription>Monthly rental income over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 50%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 50%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 10%, 25%)" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(0, 0%, 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(0, 0%, 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(250, 10%, 18%)",
                      border: "1px solid hsl(250, 10%, 28%)",
                      borderRadius: "8px",
                      color: "hsl(0, 0%, 95%)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(160, 50%, 50%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Occupancy by Property</CardTitle>
            <CardDescription>Distribution of occupied units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(250, 10%, 18%)",
                      border: "1px solid hsl(250, 10%, 28%)",
                      borderRadius: "8px",
                      color: "hsl(0, 0%, 95%)",
                    }}
                    formatter={(value: number, _, entry) => [
                      `${value} / ${entry.payload.total} units`,
                      entry.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {occupancyData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance Requests */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Maintenance Requests</CardTitle>
                <CardDescription>Recent open tickets requiring attention</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.map((request) => {
                const tenant = getTenantById(request.tenantId);
                const unit = getUnitById(request.unitId);
                return (
                  <div
                    key={request.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)} - Unit {unit?.unitNumber}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tenant?.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          request.urgency === "critical" || request.urgency === "high"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {request.urgency}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Leases */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Active Leases</CardTitle>
                <CardDescription>Current lease agreements overview</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeases.map((lease) => {
                const tenant = getTenantById(lease.tenantId);
                const unit = getUnitById(lease.unitId);
                const property = getPropertyById(lease.propertyId);
                return (
                  <div
                    key={lease.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {tenant?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unit {unit?.unitNumber} - {property?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ends: {new Date(lease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        ${lease.monthlyRent.toLocaleString()}/mo
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-card-foreground">{metrics.totalTenants}</p>
            <p className="text-xs text-muted-foreground">Active Tenants</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-card-foreground">{metrics.activeLeases}</p>
            <p className="text-xs text-muted-foreground">Active Leases</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
          <Home className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-card-foreground">{metrics.availableUnits}</p>
            <p className="text-xs text-muted-foreground">Available Units</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
          <DollarSign className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-2xl font-bold text-card-foreground">${metrics.overdueAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending Payments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
