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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Wheat } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Harvests() {
  const harvests = useQuery(api.harvests.list);
  const trees = useQuery(api.coconutTrees.list);
  const workers = useQuery(api.workers.list);
  const createHarvest = useMutation(api.harvests.create);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    treeId: "",
    dateCut: new Date().toISOString().split("T")[0],
    totalCoconuts: "",
    cutterWorkerId: "",
    pickerWorkerId: "none",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHarvest({
        treeId: formData.treeId as any,
        dateCut: new Date(formData.dateCut).getTime(),
        totalCoconuts: Number(formData.totalCoconuts),
        cutterWorkerId: formData.cutterWorkerId as any,
        pickerWorkerId: formData.pickerWorkerId === "none" ? undefined : (formData.pickerWorkerId as any),
        notes: formData.notes,
      });
      toast.success("Harvest recorded successfully");
      setIsDialogOpen(false);
      setFormData({
        treeId: "",
        dateCut: new Date().toISOString().split("T")[0],
        totalCoconuts: "",
        cutterWorkerId: "",
        pickerWorkerId: "none",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to record harvest");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Harvests</h2>
          <p className="text-muted-foreground">
            Track coconut harvests and worker performance.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Record Harvest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Harvest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tree">Tree</Label>
                <Select
                  value={formData.treeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, treeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tree" />
                  </SelectTrigger>
                  <SelectContent>
                    {trees?.map((tree) => (
                      <SelectItem key={tree._id} value={tree._id}>
                        {tree.treeId} - {tree.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date Cut</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.dateCut}
                  onChange={(e) =>
                    setFormData({ ...formData, dateCut: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Coconuts</Label>
                <Input
                  id="total"
                  type="number"
                  value={formData.totalCoconuts}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCoconuts: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cutter">Cutter</Label>
                <Select
                  value={formData.cutterWorkerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cutterWorkerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cutter" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers?.map((worker) => (
                      <SelectItem key={worker.userId} value={worker.userId}>
                        {worker.user?.name || "Unknown Worker"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="picker">Picker (Optional)</Label>
                <Select
                  value={formData.pickerWorkerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pickerWorkerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select picker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {workers?.map((worker) => (
                      <SelectItem key={worker.userId} value={worker.userId}>
                        {worker.user?.name || "Unknown Worker"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Record Harvest
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
              <TableHead>Tree</TableHead>
              <TableHead>Cutter</TableHead>
              <TableHead>Picker</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {harvests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No harvests recorded.
                </TableCell>
              </TableRow>
            ) : (
              harvests?.map((harvest) => (
                <TableRow key={harvest._id}>
                  <TableCell>
                    {format(new Date(harvest.dateCut), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{harvest.tree?.treeId}</TableCell>
                  <TableCell>{harvest.cutter?.name}</TableCell>
                  <TableCell>{harvest.picker?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {harvest.totalCoconuts}
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
