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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Sales() {
  const sales = useQuery(api.sales.list);
  const createSale = useMutation(api.sales.create);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    quantitySold: "",
    ratePerCoconut: "",
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSale({
        date: new Date(formData.date).getTime(),
        quantitySold: Number(formData.quantitySold),
        ratePerCoconut: Number(formData.ratePerCoconut),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
      });
      toast.success("Sale recorded successfully");
      setIsDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        quantitySold: "",
        ratePerCoconut: "",
        customerName: "",
        customerPhone: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to record sale");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">
            Track coconut sales and revenue.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantitySold}
                    onChange={(e) =>
                      setFormData({ ...formData, quantitySold: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Coconut</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={formData.ratePerCoconut}
                    onChange={(e) =>
                      setFormData({ ...formData, ratePerCoconut: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Customer Phone</Label>
                <Input
                  id="phone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Record Sale
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No sales recorded.
                </TableCell>
              </TableRow>
            ) : (
              sales?.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell>
                    {format(new Date(sale.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {sale.customerName || <span className="text-muted-foreground">Walk-in</span>}
                  </TableCell>
                  <TableCell className="text-right">{sale.quantitySold}</TableCell>
                  <TableCell className="text-right">₹{sale.ratePerCoconut}</TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{sale.totalRevenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}