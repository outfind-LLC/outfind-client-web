"use client";

import { Moon, PanelLeft, PanelLeftClose, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { BrandLogo } from "@/components/brand-logo";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

/** Sidebar top bar: brand, inline theme switch, and the desktop collapse toggle. */
export function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);

  const themeButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );

  const collapseButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={toggleCollapsed}
      className="hidden lg:inline-flex"
    >
      {collapsed ? (
        <PanelLeft className="size-4" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <BrandLogo full={false} href="/" className="h-7" />
        {collapseButton}
      </div>
    );
  }

  return (
    <div className={cn("flex h-14 items-center gap-1 px-3")}>
      <BrandLogo href="/" className="h-7" />
      <div className="ml-auto flex items-center gap-0.5">
        {themeButton}
        {collapseButton}
      </div>
    </div>
  );
}
