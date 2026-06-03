"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import type { NavItem } from "@/features/dashboard/constants/nav";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: NavItem[];
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Primary sidebar navigation. Closes the mobile drawer on selection. */
export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-sidebar-ring/40 focus-visible:ring-[3px]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
