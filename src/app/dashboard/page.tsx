
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppShell } from "@/components/app-shell";
import { financialData, appointments as allAppointments, content, clients } from "@/lib/data";
import { type Appointment, type TeamMember, type TimeEntry } from "@/lib/types";
import { Clock, DollarSign, Pencil } from "lucide-react";
import FinancialChart from "./financial-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import RevenueByClientChart from "./revenue-by-client-chart";
import { listenToTeamMembers, updateTeamMember } from "@/services/teamService";
import { getTimeEntries } from "@/services/timeTrackingService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


type TeamPerformanceData = {
  id: string;
  name: string;
  role: string;
  hoursThisMonth: number;
  photoURL?: string;
};


export default function DashboardPage() {
  const [weeklyAppointments, setWeeklyAppointments] = React.useState<Appointment[]>([]);
  const [weekDates, setWeekDates] = React.useState<Date[]>([]);
  const [doneContentCount, setDoneContentCount] = React.useState(0);
  const [totalContentCount, setTotalContentCount] = React.useState(0);
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([]);
  const [teamPerformance, setTeamPerformance] = React.useState<TeamPerformanceData[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = React.useState(true);
  const [selectedMemberForRateEdit, setSelectedMemberForRateEdit] = React.useState<TeamMember | null>(null);
  const [isRateEditDialogOpen, setIsRateEditDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const today = new Date();
    
    // Calculate weekly appointments
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const filteredAppointments = allAppointments.filter(
      (appt) => {
          const apptDate = new Date(appt.date);
          return apptDate >= start && apptDate <= end;
      }
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeeklyAppointments(filteredAppointments);
    setWeekDates(eachDayOfInterval({ start, end }));
    
    // Calculate content completion for the month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const contentThisMonth = content.filter(c => {
        const deadlineDate = new Date(c.deadline);
        return deadlineDate.getFullYear() === currentYear &&
               deadlineDate.getMonth() === currentMonth;
    });
    const doneContentThisMonth = contentThisMonth.filter(c => c.status === 'Done').length;
    const totalMonthlyVideos = clients.reduce((sum, client) => sum + client.monthlyVideos, 0);
    setDoneContentCount(doneContentThisMonth);
    setTotalContentCount(totalMonthlyVideos);

    // Fetch time entries
     getTimeEntries().then(setTimeEntries).catch(error => {
      console.error("Failed to fetch time entries for dashboard", error);
      toast({
          title: "Error",
          description: "Could not load time entry data.",
          variant: "destructive"
      });
    });

    // Set up real-time listener for team members
    const unsubscribeTeam = listenToTeamMembers((teamData) => {
        setTeam(teamData);
        if (teamData) setIsLoadingTeam(false);
    });

    return () => {
        unsubscribeTeam();
    };
  }, [toast]);

  React.useEffect(() => {
    if (team.length === 0 || timeEntries.length === 0) return;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const performanceData = team.map(member => {
        const hoursThisMonth = timeEntries
            .filter(entry => {
                const entryDate = new Date(entry.date);
                return entry.teamMember.toLowerCase() === member.name.toLowerCase() &&
                       entryDate.getFullYear() === currentYear &&
                       entryDate.getMonth() === currentMonth;
            })
            .reduce((total, entry) => total + entry.duration, 0);
        
        return {
            id: member.id,
            name: member.name,
            role: member.role,
            hoursThisMonth: hoursThisMonth,
            photoURL: member.photoURL
        };
    });
    setTeamPerformance(performanceData);
  }, [team, timeEntries]);

  const handleRateEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMemberForRateEdit) return;

    const formData = new FormData(event.currentTarget);
    const newRate = parseFloat(formData.get("hourlyRate") as string);

    if (isNaN(newRate) || newRate < 0) {
        toast({ title: "Invalid Input", description: "Please enter a valid, non-negative number for the hourly rate.", variant: "destructive" });
        return;
    }

    const updatedMember: TeamMember = {
        ...selectedMemberForRateEdit,
        hourlyRate: newRate,
    };

    try {
        await updateTeamMember(updatedMember);
        // State will be updated by the real-time listener
        setIsRateEditDialogOpen(false);
        toast({ title: "Success", description: "Hourly rate updated successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Could not update hourly rate.", variant: "destructive" });
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Month's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData.monthly.revenue.toLocaleString()} kr
              </div>
              <p className="text-xs text-muted-foreground">
                +10.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Month's Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData.monthly.expenses.toLocaleString()} kr
              </div>
              <p className="text-xs text-muted-foreground">
                +5.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Month's Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData.monthly.profit.toLocaleString()} kr
              </div>
              <p className="text-xs text-muted-foreground">
                +12.8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Content Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {doneContentCount}/{totalContentCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed this month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Profit Over Time</CardTitle>
                    <CardDescription>Last 7 months performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FinancialChart />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Revenue by Client</CardTitle>
                    <CardDescription>This month's revenue distribution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueByClientChart />
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Monthly stats for each team member.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {isLoadingTeam ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))
              ) : teamPerformance.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                   <Avatar className="h-12 w-12">
                    <AvatarImage src={member.photoURL} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{member.hoursThisMonth.toFixed(1)} hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                                          {clients.find(c => c.id === appt.clientId)?.name}
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
        <Card>
            <CardHeader>
              <CardTitle>Hourly Rates</CardTitle>
              <CardDescription>Current hourly rates for each team member.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoadingTeam ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))
                ) : team.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                   <Avatar className="h-12 w-12">
                    <AvatarImage src={member.photoURL} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{(member.hourlyRate || 0).toLocaleString()} kr / hour</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                        setSelectedMemberForRateEdit(member);
                        setIsRateEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Rate</span>
                  </Button>
                </div>
              ))}
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

       <Dialog open={isRateEditDialogOpen} onOpenChange={setIsRateEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hourly Rate</DialogTitle>
            <DialogDescription>
              Update the hourly rate for {selectedMemberForRateEdit?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedMemberForRateEdit && (
            <form onSubmit={handleRateEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hourlyRate" className="text-right">
                    Hourly Rate (kr)
                  </Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    defaultValue={selectedMemberForRateEdit.hourlyRate}
                    className="col-span-3"
                    required
                  />
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
