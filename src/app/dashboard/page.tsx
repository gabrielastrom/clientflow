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
import { financialData, appointments as allAppointments } from "@/lib/data";
import { type Appointment } from "@/lib/types";
import { CheckCircle2, Circle, DollarSign, ArrowDown, ArrowUp } from "lucide-react";
import FinancialChart from "./financial-chart";

export default function DashboardPage() {
  const [todaysAppointments, setTodaysAppointments] = React.useState<Appointment[]>([]);

  React.useEffect(() => {
    const today = new Date();
    const filteredAppointments = allAppointments.filter(
      (appt) => new Date(appt.date).toDateString() === today.toDateString()
    );
    setTodaysAppointments(filteredAppointments);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </AppShell>
  );
}
