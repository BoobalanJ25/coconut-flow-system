import { useQuery, useMutation } from "convex/react";
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
  Loader2,
  Calendar,
} from "lucide-react";
import { startOfMonth, endOfMonth, format, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [filterType, setFilterType] = useState<"week" | "month" | "year" | "all">("month");

  const getDateRange = (type: string) => {
    const now = new Date();
    switch (type) {
      case "week":
        return { start: startOfWeek(now).getTime(), end: endOfWeek(now).getTime() };
      case "month":
        return { start: startOfMonth(now).getTime(), end: endOfMonth(now).getTime() };
      case "year":
        return { start: startOfYear(now).getTime(), end: endOfYear(now).getTime() };
      case "all":
        return { start: 0, end: Date.now() };
      default:
        return { start: startOfMonth(now).getTime(), end: endOfMonth(now).getTime() };
    }
  };

  const dateRange = getDateRange(filterType);

  const initializeUser = useMutation(api.users.initializeUser);

  useEffect(() => {
    if (user && !user.role) {
      initializeUser();
    }
  }, [user, initializeUser]);

  const stats = useQuery(
    api.dashboard.getAdminStats,
    user?.role === "admin"
      ? {
          startDate: dateRange.start,
          endDate: dateRange.end,
        }
      : "skip"
  );

  const workerStats = useQuery(
    api.dashboard.getWorkerStats,
    user && user.role !== "admin"
      ? {
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }
      : "skip"
  );

  const recentHarvests = useQuery(
    api.harvests.getByWorker,
    user && user.role !== "admin"
      ? { workerId: user._id as Id<"users"> }
      : "skip"
  );

  const attendanceHistory = useQuery(
    api.attendance.getWorkerAttendanceHistory,
    user && user.role !== "admin"
      ? { 
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      : "skip"
  );

  const salaryHistory = useQuery(
    api.payments.getWorkerSalaryPayments,
    user && user.role !== "admin"
      ? { 
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      : "skip"
  );

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  if (!user.role) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    if (workerStats === undefined || recentHarvests === undefined || attendanceHistory === undefined || salaryHistory === undefined) {
      return <DashboardSkeleton />;
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Worker Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}. Here's your activity.
            </p>
          </div>
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
              <CardTitle className="text-sm font-medium">Total Harvested</CardTitle>
              <Wheat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workerStats?.totalCoconuts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Coconuts {filterType === "all" ? "all time" : `this ${filterType}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trees Worked</CardTitle>
              <Trees className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerStats?.treesWorked}</div>
              <p className="text-xs text-muted-foreground">
                Harvest sessions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{workerStats?.totalEarned.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Paid {filterType === "all" ? "all time" : `this ${filterType}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ₹{workerStats?.pendingPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                To be paid
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Tabs defaultValue="harvests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="harvests">Recent Harvests</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payments">Salary Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="harvests">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Harvests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tree Location</TableHead>
                        <TableHead className="text-right">Coconuts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentHarvests?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24">
                            No recent harvests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentHarvests?.map((harvest) => (
                          <TableRow key={harvest._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(harvest.dateCut), "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>{harvest.tree?.location || "Unknown"}</TableCell>
                            <TableCell className="text-right font-medium">
                              {harvest.totalCoconuts}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History ({filterType === "all" ? "All Time" : `This ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Work Type</TableHead>
                        <TableHead className="text-right">Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceHistory?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            No attendance records found for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceHistory?.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(record.date), "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`capitalize ${
                                record.status === "present" ? "text-green-600" :
                                record.status === "absent" ? "text-red-600" :
                                "text-yellow-600"
                              }`}>
                                {record.status.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize">{record.workType || "-"}</TableCell>
                            <TableCell className="text-right font-medium">
                              {record.amountEarned ? `₹${record.amountEarned}` : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Payments ({filterType === "all" ? "All Time" : `This ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryHistory?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            No payments found for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        salaryHistory?.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(payment.periodStart), "MMM d")} - {format(new Date(payment.periodEnd), "MMM d")}
                            </TableCell>
                            <TableCell>
                              <span className={`capitalize ${
                                payment.status === "paid" ? "text-green-600" : "text-yellow-600"
                              }`}>
                                {payment.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{payment.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

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
              For this month
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
            <CardTitle>Financial Overview</CardTitle>
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
                    Transactions this month
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

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[300px]" />
        <Skeleton className="col-span-3 h-[300px]" />
      </div>
    </div>
  );
}