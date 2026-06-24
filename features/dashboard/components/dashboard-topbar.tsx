"use client";

import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { cn } from "@/lib/utils";
import { Ic } from "./app-icons";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/** A readable title for the current section (the live conversation title is
 * shown by the chat surface itself; this is the shell-level fallback). */
function titleForPath(pathname: string): string {
  if (pathname.startsWith("/jobs")) return "Job search";
  if (pathname.startsWith("/assistant")) return "Assistant";
  if (pathname.startsWith("/applications")) return "Saved & applied";
  if (pathname.startsWith("/bookmarks")) return "Saved & applied";
  if (pathname.startsWith("/tools")) return "Career tools";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/vacancies")) return "Vacancies";
  if (pathname.startsWith("/applicants")) return "Applicants";
  return "";
}

/** App top bar: the mobile menu button plus the current section title. */
export function DashboardTopbar() {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  return (
    <header className={s.topbar} id="topbar">
      <button
        type="button"
        className={cn(s["icon-btn"], s["menu-btn"])}
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <Ic name="menu" />
      </button>
      <div className={s["tb-title"]}>{titleForPath(pathname)}</div>
      <div className={s["tb-spacer"]} />
    </header>
  );
}
