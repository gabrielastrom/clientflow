"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { revenues as initialRevenues, clients } from "@/lib/data";
import { type Revenue } from "@/lib/types";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function FinancePage() {
  const [revenues, setRevenues] = React.useState<Revenue[]>(initialRevenues);
  const [selectedRevenue, setSelectedRevenue] = React.useState<Revenue | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newRevenue: Revenue = {
      id: `${Date.now()}`,
      revenue: parseFloat(formData.get("revenue") as string),
      month: formData.get("month") as string,
      client: formData.get("client") as string,
      comment: formData.get("comment") as string,
    };
    setRevenues((prev) => [newRevenue, ...prev]);
    setIsAddOpen(false);
    toast({ title: "Success", description: "Revenue added successfully." });
  };
  
  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRevenue) return;

    const formData = new FormData(event.currentTarget);
    const updatedRevenue: Revenue = {
      ...selectedRevenue,
      revenue: parseFloat(formData.get("revenue") as string),
      month: formData.get("month") as string,
      client: formData.get("client") as string,
      comment: formData.get("comment") as string,
    };

    setRevenues(
      revenues.map((r) => (r.id === updatedRevenue.id ? updatedRevenue : r))
    );
    setIsEditOpen(false);
    toast({ title: "Success", description: "Revenue updated successfully." });
  };

  const handleDeleteRevenue = () => {
    if (!selectedRevenue) return;
    setRevenues(revenues.filter((r) => r.id !== selectedRevenue.id));
    setIsDeleteAlertOpen(false);
    toast({
      title: "Revenue Deleted",
      description: `The revenue entry has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Track your agency's revenue and financial performance.
        </p>
         <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Revenue
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Log</CardTitle>
          <CardDescription>
            A detailed record of all incoming revenue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Revenue</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Month</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenues.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    ${item.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.month}
                  </TableCell>
                  <TableCell>{item.comment}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => { setSelectedRevenue(item); setIsEditOpen(true); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => { setSelectedRevenue(item); setIsDeleteAlertOpen(true); }}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={isAddOpen ? setIsAddOpen : setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddOpen ? "Add New Revenue" : "Edit Revenue"}</DialogTitle>
            <DialogDescription>
              {isAddOpen ? "Fill in the details for the new revenue entry." : "Make changes to the revenue entry."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="revenue" className="text-right">Revenue</Label>
                <Input id="revenue" name="revenue" type="number" defaultValue={selectedRevenue?.revenue} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Client</Label>
                <Select name="client" defaultValue={selectedRevenue?.client}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month" className="text-right">Month</Label>
                <Input id="month" name="month" defaultValue={selectedRevenue?.month} className="col-span-3" placeholder="E.g. July 2024" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">Comment</Label>
                <Input id="comment" name="comment" defaultValue={selectedRevenue?.comment} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit">{isAddOpen ? "Add Revenue" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the revenue entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteRevenue}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
