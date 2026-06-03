import { create } from "zustand";

/**
 * Sidebar UI state (client-only). Both flags are session-scoped — kept out of
 * localStorage so the server and first client render always agree (no hydration
 * mismatch). Shared via Zustand so the header toggle, the mobile topbar, and the
 * sidebar itself stay in sync without prop drilling.
 */
interface SidebarState {
  /** Desktop icon-rail mode. */
  collapsed: boolean;
  /** Mobile drawer open state. */
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
