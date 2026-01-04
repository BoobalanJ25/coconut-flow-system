import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Package, History } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Stock() {
  const currentStock = useQuery(api.stock.getCurrent);
  const history = useQuery(api.stock.getHistory);
  const updateStock = useMutation(api.stock.updateStock);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    freshCoconuts: "",
    oldStock: "",
    damagedCoconuts: "",
  });

  const handleOpenDialog = () => {
    if (currentStock) {
      setFormData({
        freshCoconuts: currentStock.freshCoconuts.toString(),
        oldStock: currentStock.oldStock.toString(),
        damagedCoconuts: currentStock.damagedCoconuts.toString(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStock({
        freshCoconuts: Number(formData.freshCoconuts),
        oldStock: Number(formData.oldStock),
        damagedCoconuts: Number(formData.damagedCoconuts),
      });
      toast.success("Stock updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update stock");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
          <p className="text-muted-foreground">
            Monitor current stock levels and history.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Package className="mr-2 h-4 w-4" /> Update Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock Levels</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fresh">Fresh Coconuts</Label>
                <Input
                  id="fresh"
                  type="number"
                  value={formData.freshCoconuts}
                  onChange={(e) =>
                    setFormData({ ...formData, freshCoconuts: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="old">Old Stock</Label>
                <Input
                  id="old"
                  type="number"
                  value={formData.oldStock}
                  onChange={(e) =>
                    setFormData({ ...formData, oldStock: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damaged">Damaged</Label>
                <Input
                  id="damaged"
                  type="number"
                  value={formData.damagedCoconuts}
                  onChange={(e) =>
                    setFormData({ ...formData, damagedCoconuts: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Update Stock
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fresh Coconuts</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStock?.freshCoconuts || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Old Stock</CardTitle>
            <Package className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStock?.oldStock || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStock?.damagedCoconuts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Stock History</h3>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No history available.
                  </TableCell>
                </TableRow>
              ) : (
                history?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {format(new Date(item.date), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.type === "in"
                            ? "bg-green-100 text-green-800"
                            : item.type === "out"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
