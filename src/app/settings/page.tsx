
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { listenToTeamMembers, updateTeamMember, uploadProfilePicture } from "@/services/teamService";
import type { TeamMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = React.useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      const unsubscribe = listenToTeamMembers((teamData) => {
        setTeam(teamData);
        const userProfile = teamData.find(member => member.id === user.uid);
        if (userProfile) {
          setCurrentUser(userProfile);
          setName(userProfile.name);
          setEmail(userProfile.email);
          setPhone(userProfile.phone);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const updatedProfile: TeamMember = {
        ...currentUser,
        name,
        email,
        phone,
    };

    try {
        await updateTeamMember(updatedProfile);
        toast({ title: "Success", description: "Your profile has been updated." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  }

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
        return;
    }
    const file = e.target.files[0];
    try {
        await uploadProfilePicture(file, user);
        toast({
            title: "Success",
            description: "Profile picture updated successfully."
        });
        // The real-time listener will update the UI
    } catch (error) {
        toast({
            title: "Upload Failed",
            description: "Could not upload the profile picture.",
            variant: "destructive"
        });
    }
  };


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
            <CardDescription>Update your personal information and profile picture.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <Label><Skeleton className="h-5 w-12" /></Label>
                        <div className="md:col-span-2"><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <Label><Skeleton className="h-5 w-12" /></Label>
                        <div className="md:col-span-2"><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <Label><Skeleton className="h-5 w-12" /></Label>
                        <div className="md:col-span-2"><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <div className="flex justify-end">
                       <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Label>Avatar</Label>
                        <div className="md:col-span-2">
                           <div
                                className="relative group w-24 h-24 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={currentUser?.photoURL || user?.photoURL || ''} alt={currentUser?.name} />
                                    <AvatarFallback>{currentUser?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePictureUpload}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} className="md:col-span-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="md:col-span-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="md:col-span-2" />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Update Profile</Button>
                    </div>
                </form>
            )}
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
