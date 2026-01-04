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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function TreeOwners() {
  const owners = useQuery(api.treeOwners.list);
  const createOwner = useMutation(api.treeOwners.create);
  const updateOwner = useMutation(api.treeOwners.update);
  const removeOwner = useMutation(api.treeOwners.remove);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"treeOwners"> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    numberOfTrees: "",
    annualRent: "",
    notes: "",
  });

  const handleOpenDialog = (owner?: any) => {
    if (owner) {
      setEditingId(owner._id);
      setFormData({
        name: owner.name,
        phone: owner.phone,
        location: owner.location,
        numberOfTrees: owner.numberOfTrees.toString(),
        annualRent: owner.annualRent.toString(),
        notes: owner.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        phone: "",
        location: "",
        numberOfTrees: "",
        annualRent: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateOwner({
          id: editingId,
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          numberOfTrees: Number(formData.numberOfTrees),
          annualRent: Number(formData.annualRent),
          notes: formData.notes || undefined,
        });
        toast.success("Tree owner updated successfully");
      } else {
        await createOwner({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          numberOfTrees: Number(formData.numberOfTrees),
          annualRent: Number(formData.annualRent),
          notes: formData.notes || undefined,
        });
        toast.success("Tree owner added successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(editingId ? "Failed to update owner" : "Failed to add owner");
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"treeOwners">) => {
    if (confirm("Are you sure you want to delete this owner?")) {
      try {
        await removeOwner({ id });
        toast.success("Tree owner removed");
      } catch (error) {
        toast.error("Failed to remove owner");
      }
    }
  };

  if (owners === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tree Owners</h2>
          <p className="text-muted-foreground">
            Manage coconut tree owners and their details.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Owner
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Owner" : "Add New Owner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trees">Number of Trees</Label>
                <Input
                  id="trees"
                  type="number"
                  value={formData.numberOfTrees}
                  onChange={(e) =>
                    setFormData({ ...formData, numberOfTrees: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent">Annual Rent</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.annualRent}
                  onChange={(e) =>
                    setFormData({ ...formData, annualRent: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              {editingId ? "Update Owner" : "Add Owner"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Trees</TableHead>
              <TableHead className="text-right">Annual Rent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No tree owners found.
                </TableCell>
              </TableRow>
            ) : (
              owners?.map((owner) => (
                <TableRow key={owner._id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>{owner.phone}</TableCell>
                  <TableCell>{owner.location}</TableCell>
                  <TableCell className="text-right">{owner.numberOfTrees}</TableCell>
                  <TableCell className="text-right">${owner.annualRent}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(owner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(owner._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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