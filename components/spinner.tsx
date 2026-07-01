import { cn } from "@/lib/utils";

/**
 * Inline loading spinner — a faint ring + a bright rotating arc, sized to the
 * current font-size (`1.05em`) and coloured with `currentColor`, so it sits
 * cleanly inside any button (shadcn `Button loading` or a CSS-module `.pf-btn`)
 * and inherits the label's colour/scale automatically. Respects reduced motion.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("motion-safe:animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ width: "1.05em", height: "1.05em", flex: "0 0 auto" }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
