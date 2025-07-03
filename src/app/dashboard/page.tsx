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
import { financialData, appointments as allAppointments, team, timeEntries, content, clients } from "@/lib/data";
import { type Appointment } from "@/lib/types";
import { CheckCircle2, Circle, DollarSign, ArrowDown, ArrowUp, UserPlus, Clock } from "lucide-react";
import FinancialChart from "./financial-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TeamPerformanceData = {
  id: string;
  name: string;
  role: string;
  hoursThisMonth: number;
};


export default function DashboardPage() {
  const [todaysAppointments, setTodaysAppointments] = React.useState<Appointment[]>([]);
  const [newClientsThisQuarter, setNewClientsThisQuarter] = React.useState(0);
  const [contentCompletionRate, setContentCompletionRate] = React.useState(0);
  const [teamPerformance, setTeamPerformance] = React.useState<TeamPerformanceData[]>([]);

  React.useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    // Calculate today's appointments
    const filteredAppointments = allAppointments.filter(
      (appt) => new Date(appt.date).toDateString() === today.toDateString()
    );
    setTodaysAppointments(filteredAppointments);

    // Calculate new clients this quarter
    const newClientsCount = clients.filter(client => {
      const joinDate = new Date(client.joinDate);
      return joinDate.getFullYear() === currentYear && Math.floor(joinDate.getMonth() / 3) === currentQuarter;
    }).length;
    setNewClientsThisQuarter(newClientsCount);

    // Calculate content completion rate for the month
    const contentThisMonth = content.filter(c => {
        const deadlineDate = new Date(c.deadline);
        return deadlineDate.getFullYear() === currentYear &&
               deadlineDate.getMonth() === currentMonth;
    });
    const doneContentThisMonth = contentThisMonth.filter(c => c.status === 'Done').length;
    const totalContentThisMonth = contentThisMonth.length;
    const completionRate = totalContentThisMonth > 0
        ? Math.round((doneContentThisMonth / totalContentThisMonth) * 100)
        : 0;
    setContentCompletionRate(completionRate);

    // Calculate team performance (hours per member)
    const performanceData = team.map(member => {
      const hoursThisMonth = timeEntries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entry.teamMember === member.name &&
                 entryDate.getFullYear() === currentYear &&
                 entryDate.getMonth() === currentMonth;
        })
        .reduce((total, entry) => total + entry.duration, 0);
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        hoursThisMonth: hoursThisMonth,
      };
    });
    setTeamPerformance(performanceData);
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's a summary of your agency's performance.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialData.monthly.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +10.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month's Expenses
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialData.monthly.expenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +5.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month's Profit
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialData.monthly.profit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Clients (Quarter)
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{newClientsThisQuarter}
              </div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Content Completion
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contentCompletionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of this month's content is Done
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
                    <CardTitle>Daily Agenda</CardTitle>
                    <CardDescription>Your tasks and appointments for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {todaysAppointments.length > 0 ? (
                            todaysAppointments.map(appt => (
                                <li key={appt.id} className="flex items-start gap-3">
                                    <div className="mt-1">
                                      {appt.type === 'Task' ? <Circle className="h-5 w-5 text-muted-foreground" /> : <CheckCircle2 className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{appt.title}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No appointments or tasks for today. Enjoy your day!</p>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Monthly stats for each team member.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {teamPerformance.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                   <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person user" />
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
        </div>
      </div>
    </AppShell>
  );
}
