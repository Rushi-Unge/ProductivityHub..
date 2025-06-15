
"use client"

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger as UiSidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import { MainSidebarContent } from "./sidebar-content";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react"; // Search icon imported
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, LogOut as LogOutIcon } from "lucide-react"; // Import LogOutIcon
import { useTheme } from "next-themes"; // Import useTheme
import { Sun, Moon } from "lucide-react"; // Import Sun and Moon icons

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme(); // Get theme and setTheme
  const [currentTheme, setCurrentTheme] = useState("system");


  useEffect(() => {
    setIsClient(true);
    setCurrentTheme(theme || "system");
  }, [theme]);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem("prohub-auth-status");
      if (authStatus !== "loggedIn") {
        router.replace("/");
      } else {
        setIsLoading(false);
      }
    }
  }, [isClient, router, pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', '3.5rem'); // h-14
  }, []);

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

  if (isLoading && isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (!isClient || (isClient && localStorage.getItem("prohub-auth-status") !== "loggedIn")) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="bg-sidebar text-sidebar-foreground border-sidebar-border rounded-r-2xl shadow-lg">
        <MainSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
          <UiSidebarTrigger className="md:hidden" />
          {/* Search bar placeholder */}
          <div className="relative flex-1 md:grow-0">
            {/* Search Bar Removed as requested. This div is for spacing if needed. */}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50" onClick={toggleTheme} aria-label="Toggle theme">
                 {currentTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar professional" />
                      <AvatarFallback>PH</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">ProHub User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        user@prohub.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-section-background dark:bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
