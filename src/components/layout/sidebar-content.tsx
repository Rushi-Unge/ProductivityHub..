
"use client"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent as UiSidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from "./sidebar-nav-item";
import { LayoutDashboard, ListChecks, Timer, BarChart2, FileText, Settings as SettingsIcon, Sun, Moon, LogOut, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  { href: "/tasks", icon: <ListChecks />, label: "Tasks" },
  { href: "/timer", icon: <Timer />, label: "Timer" },
  { href: "/notes", icon: <StickyNote />, label: "Notes" },
  { href: "/analytics", icon: <BarChart2 />, label: "Analytics" },
  { href: "/docs", icon: <FileText />, label: "Docs" },
  { href: "/settings", icon: <SettingsIcon />, label: "Settings" },
];

export function MainSidebarContent() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("prohub-auth-status");
    }
    router.push("/");
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <h1 className="text-2xl font-headline font-semibold text-primary group-data-[collapsible=icon]:hidden">
            ProHub
          </h1>
        </div>
      </SidebarHeader>

      <UiSidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarNavItem href={item.href} icon={item.icon} label={item.label} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </UiSidebarContent>

      <SidebarSeparator />
      
      <SidebarFooter className="p-4 space-y-2">
        <div className="group-data-[collapsible=icon]:hidden flex flex-col space-y-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
                <span className="truncate">User Name</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Toggle Theme</span>
          </Button>
        </div>

        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:space-y-2 hidden">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                <Avatar className="h-full w-full">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
