
"use client"

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger as UiSidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import { MainSidebarContent } from "./sidebar-content";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
     // This case should ideally be handled by the redirect, but as a fallback:
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <MainSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <UiSidebarTrigger className="md:hidden" />
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search bar can be added here if needed later */}
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            /> */}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            {/* Profile Dropdown is now in SidebarFooter for desktop, could be duplicated here for mobile if needed */}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
