import { cn } from "@/lib/utils";

interface PeoplorMarkProps {
  className?: string;
  /**
   * "color" = the brand tri-square palette (logo art).
   * "mono"  = single currentColor fill (e.g. animated hero mark).
   */
  variant?: "color" | "mono";
  /** When true, each square animates in with the prototype `legoDrop` keyframe. */
  animated?: boolean;
}

/**
 * Outfind AI brand mark — the three-square "lego" glyph, extracted verbatim from
 * _Peoplor_Design/assets/Peoplor-icon-logo.svg. Brand-coloured by default;
 * `mono` renders in currentColor for the animated hero treatment.
 */
export function PeoplorMark({
  className,
  variant = "color",
  animated = false,
}: PeoplorMarkProps) {
  const mono = variant === "mono";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-peoplor-mark=""
      className={cn(animated && "pl-mark-animated", className)}
    >
      <path
        d="M3 7.5C3 9.98528 5.01474 12 7.5 12C8.96564 12 11.6249 12 11.9999 12C12 11.25 12 9 12 7.5C12 5.01472 9.98526 3 7.5 3C5.01474 3 3 5.01472 3 7.5Z"
        fill={mono ? "currentColor" : "#4A49CF"}
      />
      <path
        d="M16.9999 3.02659C14.5147 3.04125 12.5118 5.05263 12.5264 7.51909C12.535 8.97363 12.5509 11.6808 12.5531 12.0529C13.3031 12.0486 15.4115 12.036 17.0531 12.0264C19.5383 12.0117 21.5408 9.93243 21.5262 7.46598C21.5117 4.99953 19.4852 3.01192 16.9999 3.02659Z"
        fill={mono ? "currentColor" : "#3158F6"}
      />
      <path
        d="M3 17.053C3 14.5677 4.99953 12.553 7.46604 12.553C8.92061 12.553 11.6278 12.553 12 12.553C12.0001 13.303 12 15.553 12 17.053C12 19.5383 9.93254 21.553 7.46604 21.553C4.99953 21.553 3 19.5383 3 17.053Z"
        fill={mono ? "currentColor" : "#FF6B00"}
      />
    </svg>
  );
}
