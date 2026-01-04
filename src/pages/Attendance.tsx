import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Save } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  
  // Normalize date to midnight for consistent querying
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const dateTimestamp = normalizedDate.getTime();

  const workers = useQuery(api.workers.list);
  const attendanceRecords = useQuery(api.attendance.getAttendanceByDate, { date: dateTimestamp });
  const markAttendance = useMutation(api.attendance.markAttendance);

  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (workerId: Id<"users">, status: "present" | "absent" | "half_day" | "leave") => {
    setLoading(workerId);
    try {
      // Find existing record to preserve other fields if needed, or just update status
      const existingRecord = attendanceRecords?.find(r => r.workerId === workerId);
      
      await markAttendance({
        workerId,
        date: dateTimestamp,
        status,
        treesWorked: existingRecord?.treesWorked,
        coconutsHarvested: existingRecord?.coconutsHarvested,
        amountEarned: existingRecord?.amountEarned,
        workType: existingRecord?.workType,
        notes: existingRecord?.notes,
      });
      toast.success("Attendance updated");
    } catch (error) {
      toast.error("Failed to update attendance");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleDetailsChange = async (workerId: Id<"users">, field: string, value: any) => {
    // This would be for a more detailed edit modal or inline edit
    // For now, we'll focus on status, but the structure is here
  };

  if (!workers) {
    return <div className="p-6">Loading workers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => {
                const attendance = attendanceRecords?.find(r => r.workerId === worker.user?._id);
                const status = attendance?.status || "absent"; // Default to absent if no record? Or maybe undefined/unmarked
                
                return (
                  <TableRow key={worker._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{worker.user?.name}</span>
                        <span className="text-xs text-muted-foreground">{worker.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={attendance?.status}
                        onValueChange={(val: any) => handleStatusChange(worker.user!._id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Mark Status" />
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
                      {attendance?.status === "present" || attendance?.status === "half_day" ? (
                        <span className="capitalize">{attendance.workType || "-"}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attendance?.treesWorked || "-"}
                    </TableCell>
                    <TableCell>
                      {attendance?.coconutsHarvested || "-"}
                    </TableCell>
                    <TableCell>
                      {attendance?.amountEarned ? `₹${attendance.amountEarned}` : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {workers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No workers found. Add workers first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
