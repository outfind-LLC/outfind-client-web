/**
 * Peoplor chat-app icons — ported verbatim from the _Peoplor_Design prototype.
 * Most are CSS mask icons (`.ic` + `--i`), exactly as the prototype renders them,
 * so the chat CSS module's contextual sizing rules apply automatically and the
 * glyphs are pixel-identical. A few multi-colour / structural marks are inline
 * SVGs (brand mark, verified badge, language dropdown chrome).
 */
import type { CSSProperties } from "react";

import styles from "@/features/dashboard/styles/peoplor-app.module.css";
import { cn } from "@/lib/utils";

/** Build a stroke-style mask data-uri matching the prototype's inline `jdIcon`. */
function stroke(inner: string, sw = 1.7): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'%3E${inner}%3C/svg%3E")`;
}

/** Exact data-uris transcribed from the prototype markup. */
export const ICONS = {
  panel: stroke("%3Crect x='3' y='4' width='18' height='16' rx='2.5'/%3E%3Cline x1='9' y1='4' x2='9' y2='20'/%3E", 1.6),
  plus: stroke("%3Cpath d='M12 5v14M5 12h14'/%3E", 1.6),
  bookmark: stroke("%3Cpath d='M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z'/%3E", 1.5),
  user: stroke("%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5'/%3E", 1.6),
  briefcase: stroke("%3Crect x='2' y='7' width='20' height='14' rx='2'/%3E%3Cpath d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'/%3E", 1.6),
  users: stroke("%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'/%3E", 1.6),
  messages: stroke("%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E", 1.6),
  search: stroke("%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-4.3-4.3'/%3E", 1.6),
  company: stroke("%3Cpath d='M3 21h18'/%3E%3Cpath d='M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16'/%3E%3Cpath d='M15 21V9h3a1 1 0 0 1 1 1v11'/%3E%3Cpath d='M8 8h2M8 12h2M8 16h2'/%3E", 1.5),
  // Career & migration (worker) / Global hiring (employer) nav glyph — exact prototype `route` icon.
  route: stroke("%3Ccircle cx='6' cy='19' r='2.4'/%3E%3Ccircle cx='18' cy='5' r='2.4'/%3E%3Cpath d='M8.4 19H14a3.6 3.6 0 0 0 0-7.2H10A3.6 3.6 0 0 1 10 4.6h5.6'/%3E", 1.6),
  zap: stroke("%3Cpath d='M13 2L3 14h7l-1 8 10-12h-7z'/%3E", 1.6),
  settings: stroke(
    "%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E",
    1.6,
  ),
  help: stroke("%3Ccircle cx='12' cy='12' r='9.5'/%3E%3Cpath d='M9.6 9.2a2.5 2.5 0 1 1 3.6 2.4c-.8.4-1.2 1-1.2 1.9'/%3E%3Cpath d='M12 17h.01'/%3E", 1.6),
  logout: stroke("%3Cpath d='M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3'/%3E%3Cpath d='M16 17l5-5-5-5'/%3E%3Cpath d='M21 12H9'/%3E", 1.6),
  menu: stroke("%3Cpath d='M3 6h18M3 12h18M3 18h18'/%3E", 1.7),
  close: stroke("%3Cpath d='M6 6l12 12M18 6L6 18'/%3E", 1.7),
  mic: stroke("%3Crect x='9' y='3' width='6' height='11' rx='3'/%3E%3Cpath d='M5 11a7 7 0 0 0 14 0M12 18v3'/%3E", 1.5),
  arrowUp: stroke("%3Cpath d='M12 20V5M6 11l6-6 6 6'/%3E", 1.8),
  chevronDown: stroke("%3Cpath d='M6 9l6 6 6-6'/%3E", 1.8),
  checkThin: stroke("%3Cpath d='M20 6L9 17l-5-5'/%3E", 1.8),
  checkBold: stroke("%3Cpath d='M20 6L9 17l-5-5'/%3E", 1.9),
  // job-detail facts
  globe: stroke("%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M3 12h18'/%3E%3Cpath d='M12 3c2.4 2.5 2.4 15 0 18M12 3c-2.4 2.5-2.4 15 0 18'/%3E", 1.5),
  type: stroke("%3Crect x='3' y='7' width='18' height='13' rx='2'/%3E%3Cpath d='M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/%3E", 1.6),
  clock: stroke("%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E", 1.6),
  cal: stroke("%3Crect x='3' y='5' width='18' height='16' rx='2'/%3E%3Cpath d='M3 9h18M8 3v4M16 3v4'/%3E", 1.6),
  pin: stroke("%3Cpath d='M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z'/%3E%3Ccircle cx='12' cy='10' r='2.5'/%3E", 1.6),
  phone: stroke("%3Cpath d='M6.6 10.8a12 12 0 0 0 5.6 5.6l1.9-1.9a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1h3.3a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.24 1z'/%3E", 1.6),
  mail: stroke("%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='M3 7l9 6 9-6'/%3E", 1.6),
  // multi-colour verified badge (rendered as a mask → solid accent silhouette, as in the prototype)
  verified:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2'%3E%3Cpath d='M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.7-.9 2.9.9 2.9-2.4 1.7-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15.6l.9-2.9-.9-2.9 2.4-1.7 1-2.8 3-.1z' fill='%2358b685'/%3E%3Cpath d='M8.5 12l2.5 2.5 4.5-5' stroke='%23fff'/%3E%3C/svg%3E\")",
  // stop (busy send) — filled square
  stop: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='6.5' y='6.5' width='11' height='11' rx='2.5' fill='black'/%3E%3C/svg%3E\")",
} as const;

export type IconName = keyof typeof ICONS;

/** A mask-icon span. Sizing/colour come from the surrounding chat CSS context. */
export function Ic({
  name,
  className,
  title,
}: {
  name: IconName;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(styles.ic, className)}
      style={{ "--i": ICONS[name] } as CSSProperties}
      title={title}
      aria-hidden="true"
    />
  );
}

/** Peoplor tri-square brand mark. Inline so CSS can drive fill + per-path anim. */
export function ChatMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M3 7.5C3 9.98528 5.01474 12 7.5 12C8.96564 12 11.6249 12 11.9999 12C12 11.25 12 9 12 7.5C12 5.01472 9.98526 3 7.5 3C5.01474 3 3 5.01472 3 7.5Z" />
      <path fill="currentColor" d="M16.9999 3.02659C14.5147 3.04125 12.5118 5.05263 12.5264 7.51909C12.535 8.97363 12.5509 11.6808 12.5531 12.0529C13.3031 12.0486 15.4115 12.036 17.0531 12.0264C19.5383 12.0117 21.5408 9.93243 21.5262 7.46598C21.5117 4.99953 19.4852 3.01192 16.9999 3.02659Z" />
      <path fill="currentColor" d="M3 17.053C3 14.5677 4.99953 12.553 7.46604 12.553C8.92061 12.553 11.6278 12.553 12 12.553C12.0001 13.303 12 15.553 12 17.053C12 19.5383 9.93254 21.553 7.46604 21.553C4.99953 21.553 3 19.5383 3 17.053Z" />
    </svg>
  );
}

/** Globe used inside the language dropdown trigger (inline, as in the prototype). */
export function LangGlobe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
      <path d="M12 3a13.5 13.5 0 010 18M12 3a13.5 13.5 0 000 18" />
    </svg>
  );
}

/** Down caret for the language dropdown (inline). */
export function LangCaret({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Tick shown beside the active language option (inline). */
export function LangTick({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
