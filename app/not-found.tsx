import Link from "next/link";
import { Compass } from "lucide-react";

import { routes } from "@/config/routes";
import { buttonVariants } from "@/ui/button";
import { cn } from "@/lib/utils";

/** Branded 404 — also serves any URL that doesn't match a route. */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Compass className="size-6" />
        </span>
        <div className="space-y-1.5">
          <p className="text-brand text-sm font-semibold tracking-wide">404</p>
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm text-balance">
            The page you’re looking for doesn’t exist or may have moved.
          </p>
        </div>
        <Link href={routes.home} className={cn(buttonVariants(), "w-full sm:w-auto")}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
