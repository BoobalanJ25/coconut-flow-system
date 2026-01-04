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
import { Plus, Search, Trees as TreesIcon } from "lucide-react";
import { toast } from "sonner";

export default function Trees() {
  const trees = useQuery(api.coconutTrees.list);
  const owners = useQuery(api.treeOwners.list);
  const workers = useQuery(api.workers.list);
  const createTree = useMutation(api.coconutTrees.create);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    treeId: "",
    ownerId: "",
    location: "",
    rentPerYear: "",
    expectedCoconutsCount: "",
    assignedWorkerId: "unassigned",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTree({
        treeId: formData.treeId,
        ownerId: formData.ownerId as any,
        location: formData.location,
        rentPerYear: Number(formData.rentPerYear),
        expectedCoconutsCount: Number(formData.expectedCoconutsCount),
        assignedWorkerId: formData.assignedWorkerId === "unassigned" ? undefined : (formData.assignedWorkerId as any),
      });
      toast.success("Tree added successfully");
      setIsDialogOpen(false);
      setFormData({
        treeId: "",
        ownerId: "",
        location: "",
        rentPerYear: "",
        expectedCoconutsCount: "",
        assignedWorkerId: "unassigned",
      });
    } catch (error) {
      toast.error("Failed to add tree");
      console.error(error);
    }
  };

  const filteredTrees = trees?.filter((tree) =>
    tree.treeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coconut Trees</h2>
          <p className="text-muted-foreground">
            Manage your coconut trees and their assignments.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Tree
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tree</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treeId">Tree ID</Label>
                <Input
                  id="treeId"
                  value={formData.treeId}
                  onChange={(e) =>
                    setFormData({ ...formData, treeId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ownerId: value })
                  }
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Annual Rent</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rentPerYear}
                    onChange={(e) =>
                      setFormData({ ...formData, rentPerYear: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected">Expected Coconuts</Label>
                  <Input
                    id="expected"
                    type="number"
                    value={formData.expectedCoconutsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedCoconutsCount: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="worker">Assigned Worker</Label>
                <Select
                  value={formData.assignedWorkerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedWorkerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {workers?.map((worker) => (
                      <SelectItem key={worker.userId} value={worker.userId}>
                        {worker.user?.name || "Unknown Worker"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Add Tree
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tree ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Assigned Worker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Rent/Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No trees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrees?.map((tree) => (
                <TableRow key={tree._id}>
                  <TableCell className="font-medium">{tree.treeId}</TableCell>
                  <TableCell>{tree.location}</TableCell>
                  <TableCell>{tree.owner?.name}</TableCell>
                  <TableCell>
                    {tree.worker?.name || <span className="text-muted-foreground">Unassigned</span>}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tree.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tree.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{tree.rentPerYear.toLocaleString()}
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