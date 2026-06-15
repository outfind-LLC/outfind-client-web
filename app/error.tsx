"use client"; // Error boundaries must be Client Components.

import Link from "next/link";

import { ErrorState } from "@/components/error-state";
import { routes } from "@/config/routes";
import { Button } from "@/ui/button";

/**
 * Top-level error boundary for routes outside the authenticated shell (landing,
 * auth). Catches anything the more specific `(app)/error.tsx` doesn't. The root
 * layout (and its `<html>`/`<body>`) stays mounted; only the page is replaced.
 */
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <ErrorState
        title="Something went wrong"
        description="We hit an unexpected error. Please try again — if it persists, come back in a moment."
        onRetry={unstable_retry}
        digest={error.digest}
        action={
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={routes.home}>Return home</Link>
          </Button>
        }
      />
    </main>
  );
}
