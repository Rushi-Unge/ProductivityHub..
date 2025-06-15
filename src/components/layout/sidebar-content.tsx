
"use client"

import {
  SidebarHeader,
  SidebarContent as UiSidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from "./sidebar-nav-item";
import { LayoutDashboard, ListChecks, Timer, FileText, Settings as SettingsIcon, Sun, Moon, LogOut, StickyNote, LineChart } from "lucide-react"; // Changed BarChart3 to LineChart
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
  { href: "/tasks", icon: <ListChecks className="h-5 w-5" />, label: "Tasks" },
  { href: "/timer", icon: <Timer className="h-5 w-5" />, label: "Timer" },
  { href: "/notes", icon: <StickyNote className="h-5 w-5" />, label: "Notes" },
  { href: "/analytics", icon: <LineChart className="h-5 w-5" />, label: "Trading Journal" }, 
  { href: "/docs", icon: <FileText className="h-5 w-5" />, label: "Docs" },
  { href: "/settings", icon: <SettingsIcon className="h-5 w-5" />, label: "Settings" },
];

export function MainSidebarContent() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("system");

  useEffect(() => {
    setIsClient(true);
    setCurrentTheme(theme || "system");
  }, [theme]);
  
  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("prohub-auth-status");
    }
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          {/* Modern Abstract Logo SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110">
            <path d="M12 2C10.3431 2 9 3.34315 9 5V7H15V5C15 3.34315 13.6569 2 12 2Z" />
            <path d="M9 9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V9H9Z" />
            <path d="M7 18C7 19.6569 8.34315 21 10 21H14C15.6569 21 17 19.6569 17 18V16H7V18Z" />
            <path d="M5 7C3.34315 7 2 8.34315 2 10V14C2 15.6569 3.34315 17 5 17H7V7H5Z" />
            <path d="M19 7H17V17H19C20.6569 17 22 15.6569 22 14V10C22 8.34315 20.6569 7 19 7Z" />
          </svg>
          <h1 className="text-2xl font-headline font-semibold text-primary group-data-[collapsible=icon]:hidden transition-opacity duration-300">
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
        {/* Expanded Footer */}
        <div className="group-data-[collapsible=icon]:hidden flex flex-col space-y-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-2 h-auto hover:bg-sidebar-accent transition-colors duration-200">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">User Name</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="w-full justify-start px-2 h-auto hover:bg-sidebar-accent transition-colors duration-200 flex items-center gap-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {currentTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium">Toggle Theme</span>
          </Button>
        </div>

        {/* Collapsed Footer (Icon Only) */}
        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:space-y-2 hidden">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-sidebar-accent transition-colors duration-200">
                <Avatar className="h-full w-full">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                  <AvatarFallback>PH</AvatarFallback>
                </Avatar>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-sidebar-accent transition-colors duration-200"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {currentTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}

    