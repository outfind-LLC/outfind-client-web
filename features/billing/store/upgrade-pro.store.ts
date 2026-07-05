import { create } from "zustand";

/**
 * Global open/close for the "Included with Pro" upgrade modal so any locked
 * surface (landing chips, sidebar, visa screen, CV actions, chat 403s) opens
 * the single modal mounted in the app shell. `feature` is the lock that
 * triggered it (a `FeatureKey`), used to highlight the matching row.
 */
interface UpgradeProState {
  open: boolean;
  /** The feature key that triggered the modal (null for a generic open). */
  feature: string | null;
  openModal: (feature?: string) => void;
  close: () => void;
}

export const useUpgradeProStore = create<UpgradeProState>((set) => ({
  open: false,
  feature: null,
  openModal: (feature) => set({ open: true, feature: feature ?? null }),
  close: () => set({ open: false, feature: null }),
}));
