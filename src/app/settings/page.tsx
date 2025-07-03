
"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Alex Doe" className="md:col-span-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex@clientflow.com" className="md:col-span-2" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue="555-0201" className="md:col-span-2" />
            </div>
            <div className="flex justify-end">
              <Button>Update Profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label>Theme</Label>
               <div className="md:col-span-2">
                 <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="email-notifications" className="cursor-pointer">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email for important updates.</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
               <div>
                <Label htmlFor="push-notifications" className="cursor-pointer">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get push notifications on your devices.</p>
              </div>
              <Switch id="push-notifications" />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
               <div>
                <Label htmlFor="task-updates" className="cursor-pointer">Task Updates</Label>
                <p className="text-sm text-muted-foreground">Notify me when a task status changes.</p>
              </div>
              <Switch id="task-updates" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
    