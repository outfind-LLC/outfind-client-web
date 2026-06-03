"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import type { SessionUser } from "@/interfaces/auth.interface";
import { SidebarContent } from "./sidebar-content";

interface MobileSidebarProps {
  user: SessionUser;
}

/** Off-canvas sidebar drawer for small screens, driven by the sidebar store. */
export function MobileSidebar({ user }: MobileSidebarProps) {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" />
        <Dialog.Content className="border-sidebar-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r shadow-xl outline-none lg:hidden">
          <VisuallyHidden>
            <Dialog.Title>Navigation</Dialog.Title>
          </VisuallyHidden>
          <SidebarContent user={user} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
