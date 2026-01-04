import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Trees,
  Wheat,
  Calendar,
} from "lucide-react";
import { startOfMonth, endOfMonth, format, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { useState, useMemo } from "react";
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
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useAuth } from "@/hooks/use-auth";

export default function WorkerDashboard() {
  const { user } = useAuth();
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

  const workerStats = useQuery(
    api.dashboard.getWorkerStats,
    user
      ? {
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }
      : "skip"
  );

  const recentHarvests = useQuery(
    api.harvests.getByWorker,
    user
      ? { workerId: user._id as Id<"users"> }
      : "skip"
  );

  const attendanceHistory = useQuery(
    api.attendance.getWorkerAttendanceHistory,
    user
      ? { 
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      : "skip"
  );

  const salaryHistory = useQuery(
    api.payments.getWorkerSalaryPayments,
    user
      ? { 
          workerId: user._id as Id<"users">,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      : "skip"
  );

  if (workerStats === undefined || recentHarvests === undefined || attendanceHistory === undefined || salaryHistory === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Worker Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's your activity.
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
