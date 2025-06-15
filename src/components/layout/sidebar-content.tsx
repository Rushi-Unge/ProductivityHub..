
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
import { LayoutDashboard, ListChecks, FileText, Settings as SettingsIcon, StickyNote, LineChart, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation"; // Added import for useRouter
import { useEffect, useState } from "react"; // Added imports for useEffect, useState

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
  { href: "/tasks", icon: <ListChecks className="h-5 w-5" />, label: "Tasks" },
  { href: "/notes", icon: <StickyNote className="h-5 w-5" />, label: "Notes" },
  { href: "/trades", icon: <LineChart className="h-5 w-5" />, label: "Trades" }, 
  { href: "/docs", icon: <BookOpen className="h-5 w-5" />, label: "Docs" }, // Changed icon for docs
  { href: "/settings", icon: <SettingsIcon className="h-5 w-5" />, label: "Settings" },
];

// Abstract Logo SVG component
const AppLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V7H15V5C15 3.34315 13.6569 2 12 2Z" />
    <path d="M9 9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V9H9Z" />
    <path d="M7 18C7 19.6569 8.34315 21 10 21H14C15.6569 21 17 19.6569 17 18V16H7V18Z" />
    <path d="M5 7C3.34315 7 2 8.34315 2 10V14C2 15.6569 3.34315 17 5 17H7V7H5Z" />
    <path d="M19 7H17V17H19C20.6569 17 22 15.6569 22 14V10C22 8.34315 20.6569 7 19 7Z" />
  </svg>
);


export function MainSidebarContent() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <AppLogo />
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

      {/* Footer is now minimal or can be removed entirely if no other elements are needed */}
       <SidebarFooter className="p-2">
        {/* Optionally, add a small branding or version number if desired */}
        <p className="text-xs text-sidebar-foreground/50 text-center group-data-[collapsible=icon]:hidden">
          ProHub v1.0
        </p>
      </SidebarFooter>
    </>
  );
}

    