import { create } from "zustand";

import type { AiSpecialist } from "@/interfaces/enums";

/**
 * Composer client state: the active specialist and optional model override, plus
 * a one-shot "pending message" used to hand the first message off from the new-
 * chat screen to the freshly-created conversation thread (which auto-sends it).
 */
interface ComposerState {
  specialist: AiSpecialist | null;
  /** Gateway model id; `null` lets the backend use the specialist default. */
  model: string | null;
  /** conversationId → draft text awaiting auto-send on the thread page. */
  pending: Record<string, string>;

  setSpecialist: (specialist: AiSpecialist) => void;
  setModel: (model: string | null) => void;
  queuePending: (conversationId: string, message: string) => void;
  takePending: (conversationId: string) => string | undefined;
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  specialist: null,
  model: null,
  pending: {},

  setSpecialist: (specialist) => set({ specialist }),
  setModel: (model) => set({ model }),

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
