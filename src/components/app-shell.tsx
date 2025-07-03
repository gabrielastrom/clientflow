"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Lightbulb,
  Clock,
  Settings,
  Briefcase,
  Banknote,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Footer } from "./footer";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/team", icon: Briefcase, label: "Team" },
  { href: "/finance", icon: Banknote, label: "Finance" },
  { href: "/content", icon: Lightbulb, label: "Content" },
  { href: "/tracking", icon: Clock, label: "Time Tracking" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r bg-card">
          <SidebarHeader className="p-4 flex flex-row items-center justify-between group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
            >
              <Logo />
              <span className="font-bold text-lg text-foreground">
                ClientFlow
              </span>
            </Link>
            <SidebarTrigger className="hidden md:flex" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <NavItem href="/settings" icon={Settings} label="Settings" />
              <UserMenu />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 grid h-14 grid-cols-3 items-center border-b bg-card px-4 md:hidden">
                <div className="flex justify-start">
                    <SidebarTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                        >
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                    </SidebarTrigger>
                </div>
                <div className="flex justify-center">
                    <Link
                    href="/dashboard"
                    className="flex items-center gap-2"
                    >
                    <Logo />
                    <span className="font-bold text-lg text-foreground">
                        ClientFlow
                    </span>
                    </Link>
                </div>
                <div className="flex justify-end">
                    <UserMenu isMobile />
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
            <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton tooltip={label} isActive={isActive}>
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

function UserMenu({ isMobile = false }) {
  const trigger = (
    <Button variant="ghost" size="icon" className="rounded-full md:hidden">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src="https://placehold.co/100x100.png"
          data-ai-hint="person user"
          alt="User Avatar"
        />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    </Button>
  );

  const dropdownMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isMobile ? (
          trigger
        ) : (
          <SidebarMenuButton className="h-auto group-data-[collapsible=icon]:p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://placehold.co/100x100.png"
                data-ai-hint="person user"
                alt="User Avatar"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-medium text-sm">Alex Doe</p>
              <p className="text-xs text-muted-foreground">
                alex@clientflow.com
              </p>
            </div>
          </SidebarMenuButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align="end"
        className="w-56"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isMobile) {
    return dropdownMenu;
  }

  return (
    <SidebarMenuItem className="mt-auto">
      {dropdownMenu}
    </SidebarMenuItem>
  );
}
