import { create } from "zustand";

import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import { useJobToolPanelStore } from "@/features/jobs/store/job-tool-panel.store";
import type { JobCardData } from "@/features/chat/types/job";

/** The job whose detail is open in the docked detail panel. */
export interface JobDetailTarget {
  job: JobCardData;
  /** Platform vacancy id (apply/save/discuss in-app), or null for off-platform. */
  vacancyId: string | null;
}

interface JobDetailPanelState {
  target: JobDetailTarget | null;
  openDetail: (job: JobCardData, vacancyId: string | null) => void;
  close: () => void;
}

/**
 * Drives the app-wide job detail panel (mounted once in `AppShell`) — a docked,
 * non-blocking right-side drawer, NOT a modal, so AI-tool and apply panels can
 * cleanly stack above it without an overlay/blur fighting them. Opening a detail
 * closes the chat panel and any stale tool result; the conversation panel takes
 * over when an application is sent.
 */
export const useJobDetailPanelStore = create<JobDetailPanelState>((set) => ({
  target: null,
  openDetail: (job, vacancyId) => {
    useChatPanelStore.getState().close();
    useJobToolPanelStore.getState().close();
    set({ target: { job, vacancyId } });
  },
  close: () => set({ target: null }),
}));
