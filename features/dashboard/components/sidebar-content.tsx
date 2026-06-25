"use client";

import { getNavItems } from "@/features/dashboard/constants/nav";
import { useT } from "@/providers/i18n-provider";
import type { SessionUser } from "@/interfaces/auth.interface";
import { SidebarChats } from "./sidebar-chats";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * The inner sidebar layout (brand head, nav, recent conversations, footer),
 * filling the `.sidebar` frame. Structure mirrors the prototype: head →
 * scrollable nav + Recent → footer (language + account). Nav adapts to the
 * account type and every label is localised.
 */
export function SidebarContent({ user }: { user: SessionUser }) {
  const t = useT();
  const items = getNavItems(user.accountType);

  return (
    <>
      <SidebarHeader />

      <div className={s["sb-scroll"]}>
        <SidebarNav items={items} />
        <div className={s["sb-section"]}>{t("sidebar.recent")}</div>
        <SidebarChats />
      </div>

      <SidebarFooter user={user} />
    </>
  );
}
