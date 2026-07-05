"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { CandidateDetailSheet } from "@/features/applications/components/candidate-detail-sheet";
import { ChatPanel } from "@/features/applications/components/chat-panel";
import { BillingSoundCue } from "@/features/billing/components/billing-sound-cue";
import { JobDetailPanel } from "@/features/jobs/components/job-detail-panel";
import { JobToolPanel } from "@/features/jobs/components/job-tool-panel";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { VisaWizardModal } from "@/features/visa/components/visa-wizard-modal";
import { CvWizardModal } from "@/features/resume/components/cv-wizard-modal";
import { EmployerVerifyGate } from "@/features/vacancies/components/employer-verify-gate";
import type { SessionUser } from "@/interfaces/auth.interface";
import { DashboardTopbar } from "./dashboard-topbar";
import { SidebarContent } from "./sidebar-content";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
}

/**
 * Authenticated app frame, re-skinned to the Peoplor prototype: a single
 * `.sidebar` that collapses to an icon rail on desktop (`data-collapsed`) and
 * becomes a transform-driven drawer on mobile (`data-mobile-open` + `.scrim`).
 * Seeds the React Query session cache with the server-resolved user so client
 * hooks don't re-fetch `/auth/me` on first paint.
 */
export function AppShell({ user, children }: AppShellProps) {
  const queryClient = useQueryClient();
  const collapsed = useSidebarStore((st) => st.collapsed);
  const mobileOpen = useSidebarStore((st) => st.mobileOpen);
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  // Seed the session cache exactly once (useState initializer runs a single
  // time) so client `useSession` consumers resolve without re-fetching /auth/me.
  useState(() => {
    queryClient.setQueryData(qk.session, user);
    return null;
  });

  return (
    <div
      className={s.app}
      data-collapsed={collapsed ? "true" : "false"}
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      <BillingSoundCue />
      <ChatPanel />
      <JobToolPanel />
      <CandidateDetailSheet />
      {/* Visa guidance wizard — opened from the sidebar item + search chip. */}
      <VisaWizardModal />
      {/* Guided "Create CV" wizard — opened from the CV chip + resume manager. */}
      <CvWizardModal />
      {/* Forces brand-new employers to set up + verify their company before they
          can use the app (overlays every surface; no-op for workers). */}
      <EmployerVerifyGate />

      <aside className={s.sidebar} aria-label="Sidebar">
        <SidebarContent user={user} />
      </aside>

      <div
        className={s.scrim}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <div className={s.main}>
        <DashboardTopbar />
        <main className="flex min-h-0 flex-1 scrollbar-thin flex-col overflow-y-auto">
          {children}
        </main>
        {/* Job detail slides in from the right as its own fixed sheet. */}
        <JobDetailPanel />
      </div>
    </div>
  );
}
