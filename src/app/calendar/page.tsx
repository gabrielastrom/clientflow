"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { appointments as allAppointments } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
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
import { type Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>();
  const [selectedAppointments, setSelectedAppointments] = React.useState<Appointment[]>([]);

  React.useEffect(() => {
    // Set the initial date only on the client
    if (!date) {
      setDate(new Date());
    }
  }, [date]);

  React.useEffect(() => {
    if (date) {
      const filteredAppointments = allAppointments.filter(
        (appt) => new Date(appt.date).toDateString() === date.toDateString()
      );
      setSelectedAppointments(filteredAppointments);
    } else {
        setSelectedAppointments([]);
    }
  }, [date]);

  function DayContentWithDot(props: { date: Date; activeModifiers: Record<string, boolean> }) {
    const hasAppointment = allAppointments.some(
      (appt) => new Date(appt.date).toDateString() === props.date.toDateString()
    );
  
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        {props.date.getDate()}
        {hasAppointment && (
          <div
            className={cn(
              "absolute bottom-1.5 h-1.5 w-1.5 rounded-full",
              props.activeModifiers.selected
                ? "bg-primary-foreground"
                : "bg-primary"
            )}
          />
        )}
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and deadlines.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
              <DialogDescription>Fill in the details for your new event.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" placeholder="e.g. Strategy Meeting" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input id="date" type="date" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>
                Events for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'today'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {selectedAppointments.length > 0 ? (
                <ul className="space-y-4">
                    {selectedAppointments.map((appt) => (
                    <li key={appt.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{appt.title}</p>
                                <p className="text-sm text-muted-foreground">
                                {new Date(appt.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                                </p>
                            </div>
                            <Badge variant={appt.type === 'Deadline' ? 'destructive' : 'secondary'}>{appt.type}</Badge>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-center text-muted-foreground py-8">No events scheduled for this day.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
                        month: "space-y-4 flex-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-around",
                        row: "flex w-full mt-2 justify-around",
                    }}
                    components={{
                      DayContent: DayContentWithDot,
                    }}
                />
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
