import { create } from "zustand";

/**
 * Global open/close for the guided "Create CV" wizard so any surface (the CV
 * search chip on the jobs landing, the "create" affordance in the resume
 * manager) opens the single modal mounted once in the app shell.
 */
interface CvWizardState {
  open: boolean;
  openModal: () => void;
  close: () => void;
}

export const useCvWizardStore = create<CvWizardState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  close: () => set({ open: false }),
}));
