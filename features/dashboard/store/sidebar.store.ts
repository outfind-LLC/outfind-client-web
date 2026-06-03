import { create } from "zustand";

/**
 * Sidebar UI state (client-only). Desktop collapse persists in localStorage;
 * the mobile drawer is ephemeral. Kept in Zustand so the toggle in the topbar
 * and the sidebar itself stay in sync without prop drilling.
 */
interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

const STORAGE_KEY = "jobsterr.sidebar.collapsed";

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: readInitialCollapsed(),
  mobileOpen: false,
  toggleCollapsed: () =>
    set((state) => {
      const collapsed = !state.collapsed;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(collapsed));
      }
      return { collapsed };
    }),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
