import { create } from "zustand";

import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import type { AiToolId } from "@/features/jobs/constants/job-ai-tools";
import type { JobCardData } from "@/features/chat/types/job";

/** The AI tool currently open in the docked tool panel, with its job context. */
export interface JobToolTarget {
  tool: AiToolId;
  job: JobCardData;
}

interface JobToolPanelState {
  /** `null` when the panel is closed. */
  target: JobToolTarget | null;
  openTool: (tool: AiToolId, job: JobCardData) => void;
  close: () => void;
}

/**
 * Drives the app-wide AI-tool panel (mounted once in `AppShell`). A per-job tool
 * result opens here as a docked right-side drawer — same surface model as the
 * chat panel. Only one right-side panel is shown at a time, so opening a tool
 * closes any open conversation.
 */
export const useJobToolPanelStore = create<JobToolPanelState>((set) => ({
  target: null,
  openTool: (tool, job) => {
    useChatPanelStore.getState().close();
    set({ target: { tool, job } });
  },
  close: () => set({ target: null }),
}));
