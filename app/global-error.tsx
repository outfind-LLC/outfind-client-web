"use client"; // Error boundaries must be Client Components.

import { ErrorState } from "@/components/error-state";
import "./globals.css";

/**
 * Last-resort boundary for errors thrown by the ROOT layout itself (where the
 * normal `error.tsx` can't reach). It replaces the entire document, so it must
 * render its own `<html>`/`<body>` and pull in global styles. Kept dependency-
 * light because it runs when the app is in a broken state.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col antialiased">
        <ErrorState
          title="Something went wrong"
          description="Outfind AI ran into an unexpected error. Please try again."
          onRetry={unstable_retry}
          digest={error.digest}
        />
      </body>
    </html>
  );
}
