import { create } from "zustand";

import type { CandidateCardData } from "@/features/chat/types/candidate";

/**
 * The employer's candidate detail sheet (mounted once in `AppShell`). Mirrors
 * `useJobDetailPanelStore` on the worker side.
 */
interface CandidateDetailState {
  candidate: CandidateCardData | null;
  openCandidate: (candidate: CandidateCardData) => void;
  close: () => void;
}

export const useCandidateDetailStore = create<CandidateDetailState>((set) => ({
  candidate: null,
  openCandidate: (candidate) => set({ candidate }),
  close: () => set({ candidate: null }),
}));
