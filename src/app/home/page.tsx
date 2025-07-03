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

import { content as allContent, clients, timeEntries as initialTimeEntries, teamMembers } from "@/lib/data";
import { type Content, type TimeEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { Mail, MessageSquare, HardDrive, PlusCircle, Clock, DollarSign } from 'lucide-react';

// Hardcoded current user for demonstration purposes
const CURRENT_USER = "Alex Ray";

export default function HomePage() {
  const [content, setContent] = React.useState<Content[]>(allContent);
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

  const { toast } = useToast();

  React.useEffect(() => {
    // Set default date on client-side
    setDefaultDate(new Date().toISOString().split("T")[0]);

    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);

    const userContent = content.filter(item => item.owner === CURRENT_USER);
    
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

    const userTimeEntriesThisMonth = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.teamMember === CURRENT_USER &&
               isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth });
    });

    const totalHours = userTimeEntriesThisMonth.reduce((sum, entry) => sum + entry.duration, 0);
    const hourlyRate = 150;
    const salary = totalHours * hourlyRate;

    setMonthlyHours(totalHours);
    setMonthlySalary(salary);

  }, [timeEntries, content]);

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
      owner: CURRENT_USER,
      description: formData.get("description") as string || undefined,
    };
    setContent((prev) => [newContent, ...prev]);
    setIsAddTaskOpen(false);
    toast({ title: "Success", description: "Task added successfully." });
  };

  const TaskList = ({ tasks }: { tasks: Content[] }) => {
    if (tasks.length === 0) {
      return <p className="text-muted-foreground text-center p-8">No tasks for this period. Great job!</p>;
    }
    return (
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
  
  return (
    <AppShell>
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {CURRENT_USER.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Here's what's on your plate.</p>
                </div>
                <Button onClick={() => setIsLogTimeOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log Time
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>My Tasks</CardTitle>
                                <CardDescription>Content assigned to you with deadlines this week and month.</CardDescription>
                            </div>
                            <Button onClick={() => setIsAddTaskOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Task
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="week">
                                <TabsList>
                                    <TabsTrigger value="week">This Week</TabsTrigger>
                                    <TabsTrigger value="month">This Month</TabsTrigger>
                                </TabsList>
                                <TabsContent value="week" className="mt-4">
                                    <TaskList tasks={weeklyTasks} />
                                </TabsContent>
                                <TabsContent value="month" className="mt-4">
                                    <TaskList tasks={monthlyTasks} />
                                </TabsContent>
                            </Tabs>
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
                                <span className="font-bold text-lg">{monthlyHours.toFixed(2)}h</span>
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
                   <Select name="teamMember" defaultValue={CURRENT_USER}>
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
                  <Select name="client">
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
                        {clients.map((client) => (
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
    </AppShell>
  );
}
