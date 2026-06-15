import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Wire to the route boundary's retry so users can recover in place. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Secondary action (e.g. a "Go home" link). */
  action?: ReactNode;
  /** Next forwards a hashed `digest` for Server Component errors — show it so
   * users can quote it to support, matching it to server logs. */
  digest?: string;
}

/** Centered fallback UI for route-level error boundaries. Presentational only;
 * the parent (a Client error boundary) owns the retry handler. */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again — if it keeps happening, come back in a moment.",
  onRetry,
  retryLabel = "Try again",
  action,
  digest,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <span className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm text-balance">
          {description}
        </p>
      </div>
      {(onRetry || action) && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {onRetry ? (
            <Button onClick={onRetry} className="w-full sm:w-auto">
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </div>
      )}
      {digest ? (
        <p className="text-muted-foreground/60 font-mono text-xs">
          Reference: {digest}
        </p>
      ) : null}
    </div>
  );
}
