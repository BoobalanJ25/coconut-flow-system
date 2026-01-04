import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function AttendanceRow({ worker, dateTimestamp, existingRecord, markAttendance }: { worker: any, dateTimestamp: number, existingRecord: any, markAttendance: any }) {
  const [status, setStatus] = useState<string>(existingRecord?.status || "absent");
  const [workType, setWorkType] = useState<string>(existingRecord?.workType || "");
  const [treesWorked, setTreesWorked] = useState<string>(existingRecord?.treesWorked?.toString() || "");
  const [coconutsHarvested, setCoconutsHarvested] = useState<string>(existingRecord?.coconutsHarvested?.toString() || "");
  const [amountEarned, setAmountEarned] = useState<string>(existingRecord?.amountEarned?.toString() || "");
  
  useEffect(() => {
    setStatus(existingRecord?.status || "absent");
    setWorkType(existingRecord?.workType || "");
    setTreesWorked(existingRecord?.treesWorked?.toString() || "");
    setCoconutsHarvested(existingRecord?.coconutsHarvested?.toString() || "");
    setAmountEarned(existingRecord?.amountEarned?.toString() || "");
  }, [existingRecord]);

  const handleSave = async () => {
    try {
      await markAttendance({
        workerId: worker.user._id,
        date: dateTimestamp,
        status: status as any,
        workType: workType ? (workType as any) : undefined,
        treesWorked: treesWorked ? Number(treesWorked) : undefined,
        coconutsHarvested: coconutsHarvested ? Number(coconutsHarvested) : undefined,
        amountEarned: amountEarned ? Number(amountEarned) : undefined,
      });
      toast.success("Saved");
    } catch (error) {
      toast.error("Failed to save");
      console.error(error);
    }
  };

  const isWorkDisabled = status === "absent" || status === "leave";

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{worker.user?.name}</span>
          <span className="text-xs text-muted-foreground">{worker.location}</span>
        </div>
      </TableCell>
      <TableCell>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="leave">Leave</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={workType} onValueChange={setWorkType} disabled={isWorkDisabled}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cutting">Cutting</SelectItem>
            <SelectItem value="picking">Picking</SelectItem>
            <SelectItem value="both">Both</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={treesWorked} 
          onChange={(e) => setTreesWorked(e.target.value)} 
          className="w-20" 
          disabled={isWorkDisabled}
          placeholder="Trees"
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={coconutsHarvested} 
          onChange={(e) => setCoconutsHarvested(e.target.value)} 
          className="w-20" 
          disabled={isWorkDisabled}
          placeholder="Nuts"
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={amountEarned} 
          onChange={(e) => setAmountEarned(e.target.value)} 
          className="w-24" 
          disabled={isWorkDisabled}
          placeholder="₹"
        />
      </TableCell>
      <TableCell>
        <Button size="sm" onClick={handleSave} variant="ghost">
          <Save className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<"week" | "month" | "year" | "all">("month");
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const dateTimestamp = normalizedDate.getTime();

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
        return { start: undefined, end: undefined };
      default:
        return { start: startOfMonth(now).getTime(), end: endOfMonth(now).getTime() };
    }
  }, [filterType]);

  const workers = useQuery(api.workers.list);
  const attendanceRecords = useQuery(api.attendance.getAttendanceByDate, { date: dateTimestamp });
  const historyRecords = useQuery(api.attendance.getAllAttendanceHistory, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const markAttendance = useMutation(api.attendance.markAttendance);

  if (!workers) {
    return <div className="p-6">Loading workers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Entry</TabsTrigger>
          <TabsTrigger value="history">History & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Worker Attendance for {format(date, "MMMM do, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Trees</TableHead>
                    <TableHead>Coconuts</TableHead>
                    <TableHead>Earned</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => {
                    const attendance = attendanceRecords?.find(r => r.workerId === worker.user?._id);
                    return (
                      <AttendanceRow 
                        key={worker._id} 
                        worker={worker} 
                        dateTimestamp={dateTimestamp} 
                        existingRecord={attendance} 
                        markAttendance={markAttendance} 
                      />
                    );
                  })}
                  {workers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No workers found. Add workers first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance History</CardTitle>
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Trees</TableHead>
                    <TableHead>Coconuts</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRecords?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No records found for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyRecords?.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{record.workerName}</TableCell>
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
                        <TableCell>{record.treesWorked || "-"}</TableCell>
                        <TableCell>{record.coconutsHarvested || "-"}</TableCell>
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
      </Tabs>
    </div>
  );
}