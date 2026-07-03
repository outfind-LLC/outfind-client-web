import { create } from "zustand";

import type { AiSpecialist } from "@/interfaces/enums";

/**
 * Composer client state: the active specialist, plus a one-shot "pending message"
 * used to hand the first message off from the new-chat screen to the freshly-
 * created conversation thread (which auto-sends it). The AI model is chosen
 * server-side (by use case × plan tier) — never held or sent by the client.
 */
/** The structured inputs the Job Finder specialist requires on every turn. */
export interface JobSearchInputs {
  profession: string;
  city: string;
}

interface ComposerState {
  specialist: AiSpecialist | null;
  /** conversationId → draft text awaiting auto-send on the thread page. */
  pending: Record<string, string>;
  /**
   * conversationId → Job Finder inputs. The AI Job Search is structured: the
   * backend requires `profession` + `city` on the request body, so we stash them
   * per conversation and the chat transport replays them on each turn.
   */
  jobSearch: Record<string, JobSearchInputs>;

  setSpecialist: (specialist: AiSpecialist) => void;
  queuePending: (conversationId: string, message: string) => void;
  takePending: (conversationId: string) => string | undefined;
  setJobSearch: (conversationId: string, inputs: JobSearchInputs) => void;
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  specialist: null,
  pending: {},
  jobSearch: {},

  setSpecialist: (specialist) => set({ specialist }),

  setJobSearch: (conversationId, inputs) =>
    set((state) => ({
      jobSearch: { ...state.jobSearch, [conversationId]: inputs },
    })),

  queuePending: (conversationId, message) =>
    set((state) => ({
      pending: { ...state.pending, [conversationId]: message },
    })),

  takePending: (conversationId) => {
    const message = get().pending[conversationId];
    if (message === undefined) return undefined;
    set((state) => {
      const next = { ...state.pending };
      delete next[conversationId];
      return { pending: next };
    });
    return message;
  },
}));
