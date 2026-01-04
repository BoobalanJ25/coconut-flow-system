import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  Trees,
  Users,
  Wheat,
} from "lucide-react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardSkeleton } from "./DashboardSkeleton";

export default function AdminDashboard() {
  const [filterType, setFilterType] = useState<"week" | "month" | "year" | "all">("month");

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (filterType) {
      case "week":
        return { start: startOfWeek(now).getTime(), end: endOfWeek(now).getTime() };
      case "month":
        return { start: startOfMonth(now).getTime(), end: endOfMonth(now).getTime() };
      case "year":
        return { start: startOfYear(now).getTime(), end: endOfYear(now).getTime() };
      case "all":
        return { start: 0, end: now.getTime() };
      default:
        return { start: startOfMonth(now).getTime(), end: endOfMonth(now).getTime() };
    }
  }, [filterType]);

  const stats = useQuery(api.dashboard.getAdminStats, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (stats === undefined) {
    return <DashboardSkeleton />;
  }

  if (stats === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-destructive">Error loading stats. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {filterType === "all" ? "All time" : `For this ${filterType}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {stats.profit >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit < 0 ? "text-red-500" : "text-green-600"}`}>
              ₹{stats.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Costs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trees</CardTitle>
            <Trees className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrees}</div>
            <p className="text-xs text-muted-foreground">
              Productive coconut trees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentStock?.freshCoconuts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fresh coconuts in stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Financial Overview ({filterType === "all" ? "All Time" : `This ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`})</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Revenue</span>
                <span className="font-bold text-green-600">+₹{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Rent Paid</span>
                <span className="font-bold text-red-600">-₹{stats.totalRentPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Salaries Paid</span>
                <span className="font-bold text-red-600">-₹{stats.totalSalaryPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Expenses</span>
                <span className="font-bold text-red-600">-₹{stats.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-bold">Net Profit</span>
                <span className={`text-base font-bold ${stats.profit < 0 ? "text-red-600" : "text-green-600"}`}>
                  ₹{stats.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Operational Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Users className="h-9 w-9 text-primary bg-primary/10 p-2 rounded-full" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Active Workers</p>
                  <p className="text-sm text-muted-foreground">
                    Currently employed
                  </p>
                </div>
                <div className="ml-auto font-medium">{stats.activeWorkers}</div>
              </div>
              <div className="flex items-center">
                <Users className="h-9 w-9 text-blue-500 bg-blue-500/10 p-2 rounded-full" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Tree Owners</p>
                  <p className="text-sm text-muted-foreground">
                    Landlords managed
                  </p>
                </div>
                <div className="ml-auto font-medium">{stats.totalOwners}</div>
              </div>
              <div className="flex items-center">
                <Wheat className="h-9 w-9 text-orange-500 bg-orange-500/10 p-2 rounded-full" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Sales Count</p>
                  <p className="text-sm text-muted-foreground">
                    Transactions {filterType === "all" ? "all time" : `this ${filterType}`}
                  </p>
                </div>
                <div className="ml-auto font-medium">{stats.salesCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
