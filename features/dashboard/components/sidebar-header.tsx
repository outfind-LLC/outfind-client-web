"use client";

import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { ChatMark, Ic } from "./app-icons";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * Sidebar head: the brand mark (doubles as the expand toggle when collapsed,
 * swapping to a panel glyph on hover), the wordmark, and the desktop collapse
 * button (visible only when expanded).
 */
export function SidebarHeader() {
  const toggleCollapsed = useSidebarStore((st) => st.toggleCollapsed);

  return (
    <div className={s["sb-head"]}>
      <button
        type="button"
        className={s["sb-toggle"]}
        onClick={toggleCollapsed}
        aria-label="Expand sidebar"
        title="Expand sidebar"
      >
        <ChatMark className={s["sb-mark"]} />
        <Ic name="panel" className={s["sb-panel"]} />
      </button>

      <Link href={routes.home} className={s.wm} aria-label={siteConfig.name}>
        {siteConfig.name}
      </Link>

      <button
        type="button"
        className={s["sb-collapse"]}
        onClick={toggleCollapsed}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
      >
        <Ic name="panel" />
      </button>
    </div>
  );
}
