
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, type SidebarMenuButtonProps } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps extends SidebarMenuButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function SidebarNavItem({ href, icon, label, className, ...props }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link href={href}>
      <SidebarMenuButton
        asChild={false} // Ensure it's a button for proper tooltip behavior if not using Link directly
        isActive={isActive}
        tooltip={{ children: label, side: 'right', align: 'center', className: "ml-2" }}
        className={cn("w-full justify-start", className)}
        {...props}
      >
        {icon}
        <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
      </SidebarMenuButton>
    </Link>
  );
}

