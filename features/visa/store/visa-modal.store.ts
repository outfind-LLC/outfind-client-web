import { create } from "zustand";

/**
 * Global open/close for the visa wizard so any surface (sidebar "Visa guide",
 * the "Visa documentation" search chip) opens the single modal mounted in the
 * app shell. An optional destination pre-selects the checklist step.
 */
interface VisaModalState {
  open: boolean;
  /** Optional destination id/slug to jump straight to its checklist. */
  presetDestination: string | null;
  openModal: (presetDestination?: string) => void;
  close: () => void;
}

export const useVisaModalStore = create<VisaModalState>((set) => ({
  open: false,
  presetDestination: null,
  openModal: (presetDestination) =>
    set({ open: true, presetDestination: presetDestination ?? null }),
  close: () => set({ open: false, presetDestination: null }),
}));
