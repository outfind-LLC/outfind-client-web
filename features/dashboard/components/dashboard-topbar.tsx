"use client";

import { usePathname } from "next/navigation";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { cn } from "@/lib/utils";
import { Ic } from "./app-icons";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * Routes whose screen renders its OWN full-bleed topbar (`.screen` with a sticky
 * header — messenger, profile, company, career, global hiring, CV). On these the
 * shared topbar must NOT render, or it stacks a second empty bar above the
 * screen's own — pushing the page title down, away from the sidebar logo. The
 * screen's topbar then sits at the top, level with the logo (see image spec).
 */
const FULL_BLEED = new Set([
  "/applications",
  "/candidates",
  "/profile",
  "/profile/cv",
  "/company",
  "/career",
  "/visa",
  "/global-hiring",
  "/vacancies",
  "/vacancies/new",
]);

/** Section title for routes that rely on the shared topbar (chat, vacancies,
 * settings, …). Full-bleed routes carry their own title and are handled above. */
function titleForPath(pathname: string): string {
  if (pathname.startsWith("/jobs")) return "Job search";
  if (pathname.startsWith("/assistant")) return "Assistant";
  if (pathname.startsWith("/tools")) return "Career tools";
  if (pathname.startsWith("/bookmarks")) return "Bookmarks";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/vacancies")) return "Vacancies";
  if (pathname.startsWith("/candidates")) return "Candidates";
  if (pathname.startsWith("/history")) return "History";
  if (pathname.startsWith("/help")) return "Help";
  return "";
}

/**
 * Shared app top bar — the single, consistent header aligned with the sidebar
 * logo. Renders for every screen EXCEPT the full-bleed ones (which own their
 * header). Holds the mobile menu button + the current section title.
 */
export function DashboardTopbar() {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  // Full-bleed screens own their header (the resume editor at /profile/cv/<id>
  // is a nested route, so match by prefix too — otherwise an empty shared bar
  // stacks above it and pushes its title down).
  if (FULL_BLEED.has(pathname) || pathname.startsWith("/profile/cv/")) {
    return null;
  }

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
      <button
        type="button"
        className={s["icon-btn"]}
        aria-label="Notifications"
      >
        <Ic name="notification" />
      </button>
    </header>
  );
}
