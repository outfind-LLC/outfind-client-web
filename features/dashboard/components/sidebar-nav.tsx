"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import type { NavItem } from "@/features/dashboard/constants/nav";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

interface SidebarNavProps {
  items: NavItem[];
  collapsed: boolean;
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Primary navigation. Renders full rows when expanded, or a centered icon rail
 * with tooltips when collapsed. Closes the mobile drawer on selection. */
export function SidebarNav({ items, collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <nav className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
      {!collapsed ? (
        <p className="text-sidebar-foreground/50 px-3 pb-1 text-xs font-medium tracking-wide uppercase">
          Navigation
        </p>
      ) : null}

      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;

        const link = (
          <Link
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-sidebar-ring/40 focus-visible:ring-[3px]",
              collapsed ? "size-9 justify-center" : "gap-3 px-3 py-2",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );

        if (!collapsed) return <div key={item.href}>{link}</div>;

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
