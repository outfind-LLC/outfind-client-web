"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { ChatPanel } from "@/features/applications/components/chat-panel";
import { BillingSoundCue } from "@/features/billing/components/billing-sound-cue";
import { JobToolPanel } from "@/features/jobs/components/job-tool-panel";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/interfaces/auth.interface";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarContent } from "./sidebar-content";

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
}

/**
 * Authenticated app frame: a persistent desktop sidebar, a mobile drawer, and
 * the scrollable content region. Seeds the React Query session cache with the
 * server-resolved user so client hooks don't re-fetch `/auth/me` on first paint.
 */
export function AppShell({ user, children }: AppShellProps) {
  const queryClient = useQueryClient();
  const collapsed = useSidebarStore((s) => s.collapsed);
  // Seed the session cache exactly once (useState initializer runs a single
  // time) so client `useSession` consumers resolve without re-fetching /auth/me.
  useState(() => {
    queryClient.setQueryData(qk.session, user);
    return null;
  });

  return (
    <div className="flex h-svh overflow-hidden">
      <BillingSoundCue />
      <ChatPanel />
      <JobToolPanel />
      <aside
        className={cn(
          "border-sidebar-border hidden shrink-0 border-r transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="h-svh">
          <SidebarContent user={user} collapsed={collapsed} />
        </div>
      </aside>

      <MobileSidebar user={user} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex min-h-0 flex-1 scrollbar-thin flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
