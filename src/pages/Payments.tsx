import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
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
import { Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Payments() {
  const rentPayments = useQuery(api.payments.listRentPayments);
  const salaryPayments = useQuery(api.payments.listSalaryPayments);
  const owners = useQuery(api.treeOwners.list);
  const workers = useQuery(api.workers.list);
  
  const createRentPayment = useMutation(api.payments.createRentPayment);
  const createSalaryPayment = useMutation(api.payments.createSalaryPayment);

  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);

  const [rentForm, setRentForm] = useState({
    ownerId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    notes: "",
  });

  const [salaryForm, setSalaryForm] = useState({
    workerId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    periodStart: new Date().toISOString().split("T")[0],
    periodEnd: new Date().toISOString().split("T")[0],
    status: "pending",
    notes: "",
  });

  const handleRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRentPayment({
        ownerId: rentForm.ownerId as any,
        amount: Number(rentForm.amount),
        paymentDate: new Date(rentForm.paymentDate).getTime(),
        dueDate: new Date(rentForm.dueDate).getTime(),
        status: rentForm.status as any,
        notes: rentForm.notes,
      });
      toast.success("Rent payment recorded");
      setIsRentDialogOpen(false);
    } catch (error) {
      toast.error("Failed to record rent payment");
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSalaryPayment({
        workerId: salaryForm.workerId as any,
        amount: Number(salaryForm.amount),
        paymentDate: new Date(salaryForm.paymentDate).getTime(),
        periodStart: new Date(salaryForm.periodStart).getTime(),
        periodEnd: new Date(salaryForm.periodEnd).getTime(),
        status: salaryForm.status as any,
        notes: salaryForm.notes,
      });
      toast.success("Salary payment recorded");
      setIsSalaryDialogOpen(false);
    } catch (error) {
      toast.error("Failed to record salary payment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Manage rent and salary payments.
          </p>
        </div>
      </div>

      <Tabs defaultValue="rent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rent">Rent Payments</TabsTrigger>
          <TabsTrigger value="salary">Salary Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="rent" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Record Rent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Rent Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Select
                      value={rentForm.ownerId}
                      onValueChange={(v) => setRentForm({ ...rentForm, ownerId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {owners?.map((owner) => (
                          <SelectItem key={owner._id} value={owner._id}>
                            {owner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={rentForm.amount}
                      onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={rentForm.paymentDate}
                        onChange={(e) => setRentForm({ ...rentForm, paymentDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={rentForm.dueDate}
                        onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={rentForm.status}
                      onValueChange={(v) => setRentForm({ ...rentForm, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Record Payment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentPayments?.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{format(new Date(payment.paymentDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{payment.owner?.name}</TableCell>
                    <TableCell>
                      <span className={`capitalize ${
                        payment.status === "paid" ? "text-green-600" : 
                        payment.status === "overdue" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${payment.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Record Salary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Salary Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSalarySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Worker</Label>
                    <Select
                      value={salaryForm.workerId}
                      onValueChange={(v) => setSalaryForm({ ...salaryForm, workerId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers?.map((worker) => (
                          <SelectItem key={worker.userId} value={worker.userId}>
                            {worker.user?.name || "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={salaryForm.amount}
                      onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Date</Label>
                    <Input
                      type="date"
                      value={salaryForm.paymentDate}
                      onChange={(e) => setSalaryForm({ ...salaryForm, paymentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Period Start</Label>
                      <Input
                        type="date"
                        value={salaryForm.periodStart}
                        onChange={(e) => setSalaryForm({ ...salaryForm, periodStart: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Period End</Label>
                      <Input
                        type="date"
                        value={salaryForm.periodEnd}
                        onChange={(e) => setSalaryForm({ ...salaryForm, periodEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={salaryForm.status}
                      onValueChange={(v) => setSalaryForm({ ...salaryForm, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Record Payment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryPayments?.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{format(new Date(payment.paymentDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{payment.worker?.name}</TableCell>
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
                    <TableCell className="text-right">${payment.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
