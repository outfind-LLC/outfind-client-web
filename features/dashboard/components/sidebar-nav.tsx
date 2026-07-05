"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import type { NavItem } from "@/features/dashboard/constants/nav";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Ic } from "./app-icons";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Primary navigation as flat, borderless rows. The first item ("New job" /
 * "New search") carries the plus affordance. Labels are localised. Closes the
 * mobile drawer on select. Every destination is free to open — plan gating
 * happens on value-consuming actions inside the screens themselves.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const t = useT();

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item);
        const label = t(item.labelKey);

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
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}
