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
import { PlusCircle, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

type SortableRevenueKeys = keyof Revenue;

export default function FinancePage() {
  const [revenues, setRevenues] = React.useState<Revenue[]>(initialRevenues);
  const [selectedRevenue, setSelectedRevenue] = React.useState<Revenue | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableRevenueKeys; direction: 'ascending' | 'descending' } | null>(null);

  const { toast } = useToast();

  const sortedRevenues = React.useMemo(() => {
    let sortableItems = [...revenues];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
  
        if (sortConfig.key === 'revenue') {
          aValue = a.revenue;
          bValue = b.revenue;
        } else if (sortConfig.key === 'month') {
          aValue = new Date(a.month).getTime();
          bValue = new Date(b.month).getTime();
        }
  
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [revenues, sortConfig]);

  const requestSort = (key: SortableRevenueKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableRevenueKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Track your agency's revenue and financial performance.
          </p>
        </div>
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
                <TableHead className="w-[120px]">
                  <Button variant="ghost" onClick={() => requestSort('revenue')}>
                    Revenue
                    {getSortIcon('revenue')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('client')}>
                    Client
                    {getSortIcon('client')}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" onClick={() => requestSort('month')}>
                    Month
                    {getSortIcon('month')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('comment')}>
                    Comment
                    {getSortIcon('comment')}
                  </Button>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRevenues.map((item) => (
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
