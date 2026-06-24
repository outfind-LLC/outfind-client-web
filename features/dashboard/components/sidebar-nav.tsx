"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import type { NavItem } from "@/features/dashboard/constants/nav";
import { cn } from "@/lib/utils";
import { Ic } from "./app-icons";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Primary navigation as flat, borderless rows. The first item ("New job" /
 * "New chat") carries the plus affordance. Closes the mobile drawer on select.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              s["sb-btn"],
              item.newChat && s["sb-newchat"],
              active && s.active,
            )}
          >
            <Ic name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
