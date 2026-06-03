"use client";

import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { Button } from "@/ui/button";

/** Mobile-only top bar: opens the drawer and shows the brand. Hidden on desktop
 * where the sidebar is always visible. */
export function DashboardTopbar() {
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <header className="border-border/60 bg-background/80 flex h-14 items-center justify-between gap-2 border-b px-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <BrandLogo href="/" />
      </div>
      <ThemeToggle />
    </header>
  );
}
