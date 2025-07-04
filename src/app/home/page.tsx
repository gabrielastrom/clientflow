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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

import { clients as allClients, timeEntries as initialTimeEntries, appointments as allAppointments } from "@/lib/data";
import { type Content, type TimeEntry, type Appointment, type TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Mail, MessageSquare, HardDrive, PlusCircle, Clock, DollarSign } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { getTeamMembers } from "@/services/teamService";
import { getContent } from "@/services/contentService";


export default function HomePage() {
  const { user } = useAuth();
  const currentUser = user?.displayName || user?.email || "";

  const [content, setContent] = React.useState<Content[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [weeklyTasks, setWeeklyTasks] = React.useState<Content[]>([]);
  const [monthlyTasks, setMonthlyTasks] = React.useState<Content[]>([]);
  const [monthlyProgress, setMonthlyProgress] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLogTimeOpen, setIsLogTimeOpen] = React.useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>(initialTimeEntries);
  const [defaultDate, setDefaultDate] = React.useState("");
  const [monthlyHours, setMonthlyHours] = React.useState(0);
  const [monthlySalary, setMonthlySalary] = React.useState(0);
  const [weeklyAppointments, setWeeklyAppointments] = React.useState<Appointment[]>([]);
  const [weekDates, setWeekDates] = React.useState<Date[]>([]);

  const [selectedTask, setSelectedTask] = React.useState<Content | null>(null);
  const [isTaskStatusModalOpen, setIsTaskStatusModalOpen] = React.useState(false);

  const { toast } = useToast();

   React.useEffect(() => {
    async function fetchData() {
        try {
            const [contentData, teamData] = await Promise.all([
                getContent(),
                getTeamMembers(),
            ]);
            setContent(contentData);
            setTeamMembers(teamData);
        } catch (error) {
            toast({
                title: "Error fetching data",
                description: "Could not load data from the database.",
                variant: "destructive"
            });
        }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    if (!currentUser) return;
    // Set default date on client-side
    setDefaultDate(new Date().toISOString().split("T")[0]);

    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);

    // Filter user tasks
    const userContent = content.filter(item => {
        return item.owner === user?.displayName || item.owner === user?.email;
    });
    
    const weekTasks = userContent.filter(item => {
      const deadline = new Date(item.deadline);
      return isWithinInterval(deadline, { start: startOfThisWeek, end: endOfThisWeek });
    }).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    setWeeklyTasks(weekTasks);

    const monthTasks = userContent.filter(item => {
      const deadline = new Date(item.deadline);
      return isWithinInterval(deadline, { start: startOfThisMonth, end: endOfThisMonth });
    }).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    setMonthlyTasks(monthTasks);

    const assignedThisMonth = userContent.filter(item => {
        const deadline = new Date(item.deadline);
        return isWithinInterval(deadline, { start: startOfThisMonth, end: endOfThisMonth });
    });
    
    const completedThisMonth = assignedThisMonth.filter(item => item.status === 'Done');
    
    setCompletedCount(completedThisMonth.length);
    setTotalCount(assignedThisMonth.length);

    if (assignedThisMonth.length > 0) {
        setMonthlyProgress((completedThisMonth.length / assignedThisMonth.length) * 100);
    } else {
        setMonthlyProgress(0);
    }

    // Filter weekly appointments
    const filteredAppointments = allAppointments.filter(
      (appt) => isWithinInterval(new Date(appt.date), { start: startOfThisWeek, end: endOfThisWeek })
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeeklyAppointments(filteredAppointments);
    setWeekDates(eachDayOfInterval({ start: startOfThisWeek, end: endOfThisWeek }));


    // Calculate monthly time entries and salary
    const userTimeEntriesThisMonth = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (entry.teamMember === user?.displayName || entry.teamMember === user?.email) &&
               isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth });
    });

    const totalHours = userTimeEntriesThisMonth.reduce((sum, entry) => sum + entry.duration, 0);
    const hourlyRate = 150;
    const salary = totalHours * hourlyRate;

    setMonthlyHours(totalHours);
    setMonthlySalary(salary);

  }, [timeEntries, content, currentUser, user]);

  const getStatusBadgeClassName = (status: 'To Do' | 'In Progress' | 'In Review' | 'Done') => {
    switch (status) {
      case 'Done':
        return 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/20 hover:bg-blue-500/30';
      case 'In Review':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30';
      case 'To Do':
         return 'bg-gray-500/20 text-gray-700 border-gray-500/20 hover:bg-gray-500/30';
      default:
        return '';
    }
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
      duration: parseFloat(formData.get("duration") as string),
    };

    setTimeEntries([newEntry, ...timeEntries]);
    setIsLogTimeOpen(false);
    (event.target as HTMLFormElement).reset();
    toast({
      title: "Time Logged",
      description: "Your time entry has been successfully saved.",
    });
  };

  const handleAddTaskSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newContent: Content = {
      id: `${Date.now()}`,
      title: formData.get("title") as string,
      client: formData.get("client") as string,
      status: "To Do",
      platform: formData.get("platform") as Content["platform"],
      deadline: formData.get("deadline") as string,
      owner: currentUser,
      description: formData.get("description") as string || undefined,
    };
    setContent((prev) => [newContent, ...prev]);
    setIsAddTaskOpen(false);
    toast({ title: "Success", description: "Task added successfully." });
  };
  
  const handleTaskClick = (task: Content) => {
    setSelectedTask(task);
    setIsTaskStatusModalOpen(true);
  };

  const handleStatusUpdateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask) return;

    const formData = new FormData(event.currentTarget);
    const newStatus = formData.get("status") as Content["status"];

    const updatedContent = content.map(item => 
      item.id === selectedTask.id ? { ...item, status: newStatus } : item
    );
    setContent(updatedContent);

    setIsTaskStatusModalOpen(false);
    setSelectedTask(null);
    toast({
      title: "Status Updated",
      description: `Task "${selectedTask.title}" has been updated to "${newStatus}".`,
    });
  };

  const TaskList = ({ tasks, onTaskClick }: { tasks: Content[], onTaskClick: (task: Content) => void }) => {
    if (tasks.length === 0) {
      return <p className="text-muted-foreground text-center p-8">No tasks for this period. Great job!</p>;
    }
    return (
      <div className="space-y-4">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-muted-foreground">{task.client} - Deadline: {format(new Date(task.deadline), 'MMM dd')}</p>
            </div>
            <Badge variant={'outline'} className={cn(getStatusBadgeClassName(task.status))}>
              {task.status}
            </Badge>
          </div>
        ))}
      </div>
    );
  };
  
  if (!user) {
    return null;
  }
  
  const name = currentUser.split('@')[0];
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <AppShell>
        <div className="flex flex-col gap-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {capitalizedName}!</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsLogTimeOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Log Time
                    </Button>
                    <Button onClick={() => setIsAddTaskOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                            <CardDescription>Content assigned to you with deadlines this week and month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="week">
                                <TabsList>
                                    <TabsTrigger value="week">This Week</TabsTrigger>
                                    <TabsTrigger value="month">This Month</TabsTrigger>
                                </TabsList>
                                <TabsContent value="week" className="mt-4">
                                    <TaskList tasks={weeklyTasks} onTaskClick={handleTaskClick} />
                                </TabsContent>
                                <TabsContent value="month" className="mt-4">
                                    <TaskList tasks={monthlyTasks} onTaskClick={handleTaskClick} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Agenda</CardTitle>
                            <CardDescription>What's going on at BrandGuys this week!</CardDescription>
                        </CardHeader>
                        <CardContent className="pr-0">
                            <ScrollArea className="h-[290px]">
                              <div className="space-y-6 pr-6">
                                {weekDates.map((day) => {
                                  const dayAppointments = weeklyAppointments.filter((appt) =>
                                    isSameDay(new Date(appt.date), day)
                                  );

                                  if (dayAppointments.length === 0) {
                                    return null;
                                  }

                                  return (
                                    <div key={day.toString()}>
                                      <h3 className="font-semibold text-sm mb-3 sticky top-0 bg-card py-2 z-10">
                                        {format(day, 'EEEE, MMM d')}
                                      </h3>
                                      <div className="space-y-4">
                                        {dayAppointments.map((appt) => (
                                          <div key={appt.id} className="flex items-start gap-4 text-sm">
                                            <div className="flex flex-col items-center w-16 flex-shrink-0">
                                              <p className="font-semibold text-primary">{format(new Date(appt.date), 'HH:mm')}</p>
                                              <Badge
                                                variant={appt.type === "Deadline" ? "destructive" : "secondary"}
                                                className="mt-1"
                                              >
                                                {appt.type}
                                              </Badge>
                                            </div>
                                            <div className="border-l pl-4 flex-1">
                                              <p className="font-medium">{appt.title}</p>
                                              {appt.clientId && (
                                                <p className="text-xs text-muted-foreground">
                                                    {allClients.find(c => c.id === appt.clientId)?.name}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                                {weeklyAppointments.length === 0 && (
                                  <div className="flex h-full min-h-[290px] items-center justify-center text-muted-foreground">
                                      <p>No appointments for this week.</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Progress</CardTitle>
                            <CardDescription>Your completed tasks for this month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                <span className="text-sm font-bold">{completedCount}/{totalCount}</span>
                            </div>
                            <Progress value={monthlyProgress} className="w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Summary</CardTitle>
                            <CardDescription>Your hours and estimated salary.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-5 w-5" />
                                    <span>Hours Logged</span>
                                </div>
                                <span className="font-bold text-lg">{monthlyHours.toFixed(1)}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="h-5 w-5" />
                                    <span>Estimated Salary</span>
                                </div>
                                <span className="font-bold text-lg">{monthlySalary.toLocaleString()} kr</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Access</CardTitle>
                            <CardDescription>Core tools for your workflow.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <Button variant="outline" asChild>
                                <Link href="#">
                                    <Mail className="mr-2 h-4 w-4"/> Email
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="#">
                                    <MessageSquare className="mr-2 h-4 w-4"/> Discord
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="#">
                                    <HardDrive className="mr-2 h-4 w-4"/> Drive
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                            <CardDescription>Your personal scratchpad for quick notes and reminders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea placeholder="Type your notes here..." className="h-48 resize-none" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* Log Time Dialog */}
        <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
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
                  <Input id="date" name="date" type="date" defaultValue={defaultDate} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamMember" className="text-right">
                    Team Member
                  </Label>
                   <Select name="teamMember" defaultValue={currentUser}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select name="client">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task" className="text-right">
                    Task/Note
                  </Label>
                  <Textarea id="task" name="task" placeholder="e.g., Filming for Summer Campaign" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Hours
                  </Label>
                  <Input id="duration" name="duration" type="number" step="0.1" placeholder="e.g., 1.5" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Log Time</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Fill in the details for your new task. It will be assigned to you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTaskSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" name="title" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">Client</Label>
                  <Select name="client">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">Platform</Label>
                    <Select name="platform" defaultValue="Instagram">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="X">X</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">Deadline</Label>
                  <Input id="deadline" name="deadline" type="date" defaultValue={defaultDate} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">Description</Label>
                  <Textarea id="description" name="description" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Add Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Task Status Dialog */}
        <Dialog open={isTaskStatusModalOpen} onOpenChange={setIsTaskStatusModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Task Status</DialogTitle>
              <DialogDescription>
                Update the status for the task: "{selectedTask?.title}".
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <form onSubmit={handleStatusUpdateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select name="status" defaultValue={selectedTask.status}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
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
