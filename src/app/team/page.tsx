"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
import { type TeamMember } from "@/lib/types";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { getTeamMembers, updateTeamMember, deleteTeamMember } from "@/services/teamService";
import { Skeleton } from "@/components/ui/skeleton";

type SortableTeamKeys = keyof TeamMember;

export default function TeamPage() {
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableTeamKeys; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchTeam() {
        setIsLoading(true);
        try {
            const teamData = await getTeamMembers();
            setTeam(teamData);
        } catch (error) {
            toast({
                title: "Error fetching team",
                description: "Could not load team from the database.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchTeam();
  }, [toast]);


  const sortedTeam = React.useMemo(() => {
    let sortableItems = [...team];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number | string[] = a[sortConfig.key];
        let bValue: string | number | string[] = b[sortConfig.key];
        
        if (sortConfig.key === 'assignedClients') {
          aValue = a.assignedClients.length;
          bValue = b.assignedClients.length;
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
  }, [team, sortConfig]);

  const requestSort = (key: SortableTeamKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableTeamKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };
  
  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMember) return;

    const formData = new FormData(event.currentTarget);
    const updatedMember: TeamMember = {
      ...selectedMember,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as TeamMember["role"],
      hourlyRate: parseFloat(formData.get("hourlyRate") as string) || 0,
      assignedClients: (formData.get("assignedClients") as string).split(",").map(c => c.trim()).filter(Boolean),
    };

    try {
        await updateTeamMember(updatedMember);
        setTeam(team.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
        setIsEditOpen(false);
        toast({ title: "Success", description: "Team member updated successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Could not update team member.", variant: "destructive" });
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    try {
        await deleteTeamMember(selectedMember.id);
        setTeam(team.filter((m) => m.id !== selectedMember.id));
        setIsDeleteAlertOpen(false);
        toast({
          title: "Team Member Deleted",
          description: `${selectedMember.name} has been removed.`,
        });
    } catch (error) {
         toast({ title: "Error", description: "Could not delete team member.", variant: "destructive" });
    }
  };

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles. New members are added when they sign up.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            An overview of all team members in your agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('name')}>
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" onClick={() => requestSort('email')}>
                    Email
                    {getSortIcon('email')}
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button variant="ghost" onClick={() => requestSort('phone')}>
                    Phone
                    {getSortIcon('phone')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('role')}>
                    Role
                    {getSortIcon('role')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('hourlyRate')}>
                    Hourly Rate
                    {getSortIcon('hourlyRate')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('assignedClients')}>
                    Assigned Clients
                    {getSortIcon('assignedClients')}
                  </Button>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : sortedTeam.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No team members found. New members are added when they sign up.
                    </TableCell>
                </TableRow>
              ) : (
                sortedTeam.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {member.phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {(member.hourlyRate || 0).toLocaleString()} kr
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.assignedClients.map((clientName) => (
                          <Badge key={clientName} variant="secondary">
                            {clientName}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem onSelect={() => { setSelectedMember(member); setIsEditOpen(true); }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => { setSelectedMember(member); setIsDeleteAlertOpen(true); }}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Make changes to the team member's profile.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" defaultValue={selectedMember.name} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedMember.email} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={selectedMember.phone} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                   <Select name="role" defaultValue={selectedMember.role}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Strategist">Strategist</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hourlyRate" className="text-right">Hourly Rate</Label>
                  <Input id="hourlyRate" name="hourlyRate" type="number" defaultValue={selectedMember.hourlyRate} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedClients" className="text-right">Clients</Label>
                  <Input id="assignedClients" name="assignedClients" defaultValue={selectedMember.assignedClients.join(", ")} className="col-span-3" placeholder="Comma-separated names" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member "{selectedMember?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteMember}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppShell>
  );
}
