"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/config/routes";
import { NAV_LINKS } from "@/features/marketing/constants/landing";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

/** Sticky marketing header. Gains a blur/border once the page is scrolled, and
 * collapses the nav into a toggle on small screens. */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-border/60 bg-background/80 border-b backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.auth}>Sign in</Link>
          </Button>
          <Button asChild variant="brand" size="sm">
            <Link href={routes.auth}>Get started</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </Container>

      {mobileOpen ? (
        <div className="border-border/60 bg-background/95 border-t backdrop-blur-md md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href={routes.auth}>Sign in</Link>
              </Button>
              <Button asChild variant="brand">
                <Link href={routes.auth}>Get started</Link>
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
