import { create } from "zustand";

import { useJobToolPanelStore } from "@/features/jobs/store/job-tool-panel.store";
import type { ConversationScope } from "@/interfaces/application.interface";

/** The conversation currently open in the docked chat panel. */
export interface ChatThread {
  scope: ConversationScope;
  applicationId: string;
  /** Who the caller is talking to (applicant name, or the role/company). */
  title: string;
  subtitle?: string;
  /** The application's cover letter, pinned as the first message. */
  coverLetter?: string | null;
}

interface ChatPanelState {
  /** `null` when the panel is closed. */
  thread: ChatThread | null;
  /** Open (or switch to) a conversation. Replaces any currently open thread so
   *  only one message poll is ever active. */
  openThread: (thread: ChatThread) => void;
  close: () => void;
}

/**
 * Drives the persistent, app-wide chat panel mounted once in `AppShell`. Kept in
 * a store (not per-component state) so the panel survives navigation and any
 * surface — applicant list, candidate page, worker applications, the apply flow —
 * can open it without prop drilling. Session-scoped (no persistence) to avoid
 * hydration mismatch, mirroring `useSidebarStore`.
 */
export const useChatPanelStore = create<ChatPanelState>((set) => ({
  thread: null,
  openThread: (thread) => {
    // Only one right-side panel at a time — yield to the conversation.
    useJobToolPanelStore.getState().close();
    set({ thread });
  },
  close: () => set({ thread: null }),
}));
