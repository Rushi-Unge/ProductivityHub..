
"use client"

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger as UiSidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import { MainSidebarContent } from "./sidebar-content";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut as LogOutIcon, Sun, Moon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [currentThemeStored, setCurrentThemeStored] = useState("system");
  const [userDisplayName, setUserDisplayName] = useState("ProHub User"); // Mock
  const [userEmail, setUserEmail] = useState("user@prohub.com"); // Mock


  useEffect(() => {
    setIsClient(true);
    setCurrentThemeStored(theme || "system"); 
  }, [theme]);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem("prohub-auth-status");
      if (authStatus !== "loggedIn") {
        router.replace("/");
      } else {
        // Simulate fetching user details
        const storedName = localStorage.getItem("prohub-user-name") || "ProHub User";
        const storedEmail = localStorage.getItem("prohub-user-email") || "user@prohub.com";
        setUserDisplayName(storedName);
        setUserEmail(storedEmail);
        setIsLoading(false);
      }
    }
  }, [isClient, router, pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', '3.5rem'); 
  }, []);

  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem("prohub-auth-status");
      localStorage.removeItem("prohub-user-name");
      localStorage.removeItem("prohub-user-email");
    }
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = currentThemeStored === "dark" ? "light" : "dark";
    setTheme(newTheme);
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
    return ( 
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Skeleton className="h-12 w-12 rounded-full" /> 
            <Skeleton className="h-4 w-32 ml-4" />
        </div>
    );
  }

  const avatarFallbackName = userDisplayName.split(" ").map(n => n[0]).join("").toUpperCase() || "PH";

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="bg-sidebar text-sidebar-foreground border-sidebar-border rounded-r-2xl shadow-lg">
        <MainSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
          <UiSidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-3 ml-auto">
            <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:ring-offset-0 focus-visible:ring-primary/70" 
                onClick={toggleTheme} 
                aria-label="Toggle theme"
            >
                 {currentThemeStored === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-offset-0 focus-visible:ring-primary/70">
                    <Avatar className="h-9 w-9 border-2 border-primary/30 hover:border-primary/70 transition-colors">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar professional"/>
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">{avatarFallbackName}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-xl border" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{userDisplayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer hover:bg-muted/50">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive hover:bg-destructive/10 cursor-pointer">
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
