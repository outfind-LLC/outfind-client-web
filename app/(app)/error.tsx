"use client"; // Error boundaries must be Client Components.

import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { routes } from "@/config/routes";
import { Button } from "@/ui/button";

/**
 * Error boundary for the authenticated app. It wraps the segment's pages (not
 * the layout), so the sidebar/shell stays in place and only the content area
 * shows the fallback. `unstable_retry` (Next 16.2) re-fetches and re-renders the
 * failed segment in place.
 */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ErrorState
      title="This page hit a snag"
      description="We couldn't load this part of Outfind AI. Try again, or head back to your dashboard."
      onRetry={unstable_retry}
      digest={error.digest}
      action={
        <Button variant="outline" asChild className="w-full sm:w-auto">
          {/* /chat is the session-aware dispatcher → the account's default tab. */}
          <Link href={routes.chat}>Go to dashboard</Link>
        </Button>
      }
    />
  );
}
