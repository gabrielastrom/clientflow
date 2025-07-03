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
import { timeEntries as initialTimeEntries, clients, teamMembers } from "@/lib/data";
import type { TimeEntry } from "@/lib/types";
import { PlusCircle, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useToast } from "@/hooks/use-toast";

type SortableTimeEntryKeys = keyof TimeEntry;

export default function TrackingPage() {
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>(initialTimeEntries);
  const [isLogTimeOpen, setIsLogTimeOpen] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<TimeEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [defaultDate, setDefaultDate] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableTimeEntryKeys; direction: 'ascending' | 'descending' } | null>(null);

  const { toast } = useToast();

  React.useEffect(() => {
    // Set the default date only on the client
    setDefaultDate(new Date().toISOString().split("T")[0]);
  }, []);

  const parseDuration = (duration: string): number => {
    const parts = duration.split(' ');
    let minutes = 0;
    parts.forEach(part => {
        if (part.includes('h')) {
            minutes += parseInt(part.replace('h', ''), 10) * 60;
        }
        if (part.includes('m')) {
            minutes += parseInt(part.replace('m', ''), 10);
        }
    });
    return minutes;
  };

  const sortedTimeEntries = React.useMemo(() => {
    let sortableItems = [...timeEntries];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number = a[sortConfig.key];
        let bValue: string | number = b[sortConfig.key];
        
        if (sortConfig.key === 'duration') {
          aValue = parseDuration(a.duration);
          bValue = parseDuration(b.duration);
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
  }, [timeEntries, sortConfig]);

  const requestSort = (key: SortableTimeEntryKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableTimeEntryKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const handleLogTimeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEntry: TimeEntry = {
      id: (timeEntries.length + 1).toString(),
      date: formData.get("date") as string,
      teamMember: formData.get("teamMember") as string,
      client: formData.get("client") as string,
      task: formData.get("task") as string,
      duration: formData.get("duration") as string,
    };

    setTimeEntries([newEntry, ...timeEntries]);
    setIsLogTimeOpen(false);
    (event.target as HTMLFormElement).reset();
    toast({
      title: "Time Logged",
      description: "Your time entry has been successfully saved.",
    });
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEntry) return;

    const formData = new FormData(event.currentTarget);
    const updatedEntry: TimeEntry = {
      ...selectedEntry,
      date: formData.get("date") as string,
      teamMember: formData.get("teamMember") as string,
      client: formData.get("client") as string,
      task: formData.get("task") as string,
      duration: formData.get("duration") as string,
    };

    setTimeEntries(
      timeEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
    setIsEditOpen(false);
    toast({
      title: "Entry Updated",
      description: "The time entry has been successfully updated.",
    });
  };


  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Log and review time spent on clients and tasks.
          </p>
        </div>
        <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Time Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for your time log.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogTimeSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input id="date" name="date" type="date" defaultValue={defaultDate} key={defaultDate} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamMember" className="text-right">
                    Team Member
                  </Label>
                  <Select name="teamMember" defaultValue={teamMembers[0]}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select name="client" defaultValue={clients[0].name}>
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
                  <Label htmlFor="task" className="text-right">
                    Task
                  </Label>
                  <Input id="task" name="task" placeholder="e.g., Weekly Sync" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Input id="duration" name="duration" placeholder="e.g., 1h 30m" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            A log of all time tracked by the team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')}>
                    Date
                    {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('teamMember')}>
                    Team Member
                    {getSortIcon('teamMember')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('client')}>
                    Client
                    {getSortIcon('client')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('task')}>
                    Task
                    {getSortIcon('task')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('duration')} className="justify-end w-full">
                    Duration
                    {getSortIcon('duration')}
                  </Button>
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTimeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-medium">{entry.teamMember}</TableCell>
                  <TableCell>{entry.client}</TableCell>
                  <TableCell>{entry.task}</TableCell>
                  <TableCell className="text-right">{entry.duration}</TableCell>
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
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedEntry(entry);
                            setIsEditOpen(true);
                          }}
                        >
                          Edit
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
      
      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Make changes to the time entry. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">Date</Label>
                  <Input id="edit-date" name="date" type="date" defaultValue={selectedEntry.date} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-teamMember" className="text-right">Team Member</Label>
                  <Select name="teamMember" defaultValue={selectedEntry.teamMember}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-client" className="text-right">Client</Label>
                  <Select name="client" defaultValue={selectedEntry.client}>
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
                  <Label htmlFor="edit-task" className="text-right">Task</Label>
                  <Input id="edit-task" name="task" defaultValue={selectedEntry.task} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-duration" className="text-right">Duration</Label>
                  <Input id="edit-duration" name="duration" defaultValue={selectedEntry.duration} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
