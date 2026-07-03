"use client";

import { Suspense, type ReactNode } from "react";

import { CanonicalHostGuard } from "@/components/canonical-host-guard";
import { OAuthRedirectListener } from "@/features/auth/components/oauth-redirect-listener";
import { Toaster } from "@/ui/sonner";
import { AnalyticsProvider } from "./analytics-provider";
import { I18nProvider } from "./i18n-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

/** Single client provider tree mounted once in the root layout. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <QueryProvider>
          <AnalyticsProvider>
            <CanonicalHostGuard />
            {children}
            {/* Suspense isolates useSearchParams so static pages aren't de-opted. */}
            <Suspense fallback={null}>
              <OAuthRedirectListener />
            </Suspense>
            <Toaster />
          </AnalyticsProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
