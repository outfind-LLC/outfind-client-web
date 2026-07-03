"use client";

import { useEffect, type ReactNode } from "react";

import { flushAnalytics, track } from "@/lib/analytics/client";

/**
 * Flushes any buffered analytics when the tab is hidden or the page unloads, so
 * events queued right before navigation/close aren't lost. Mounted once in the
 * app provider tree.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushAnalytics();
    };
    const onPageHide = () => flushAnalytics();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return <>{children}</>;
}

/** Access the analytics tracker: `const track = useTrack(); track("job_viewed", {...})`. */
export function useTrack() {
  return track;
}
