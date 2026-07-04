/**
 * Peoplor chat-app icons. Glyph data now lives in the central registry
 * (`@/components/icons`, one file per icon); this module keeps the dashboard's
 * local names + the feature `.ic` CSS context, plus the few inline/structural
 * marks (brand mark, language-dropdown chrome) that aren't mask icons.
 */
import type { CSSProperties } from "react";

import { ICONS as REG } from "@/components/icons";
import styles from "@/features/dashboard/styles/peoplor-app.module.css";
import { cn } from "@/lib/utils";

/** Dashboard icon names → central registry entries. */
export const ICONS = {
  panel: REG.panel,
  plus: REG.plus,
  bookmark: REG.bookmark,
  docCheck: REG.docCheck,
  user: REG.user,
  briefcase: REG.briefcase,
  fileText: REG.fileText,
  users: REG.users,
  messages: REG.messages,
  search: REG.search,
  company: REG.company,
  route: REG.route,
  zap: REG.zap,
  settings: REG.settings,
  help: REG.help,
  logout: REG.logout,
  menu: REG.menu,
  close: REG.close,
  mic: REG.mic,
  arrowUp: REG.arrowUp,
  chevronDown: REG.chevronDown,
  checkThin: REG.checkThin,
  checkBold: REG.checkBold,
  globe: REG.globe,
  sparkle: REG.sparkle,
  type: REG.type,
  clock: REG.clock,
  cal: REG.calendar,
  pin: REG.pin,
  phone: REG.phone,
  mail: REG.mail,
  verified: REG.verified,
  stop: REG.stop,
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
      <path
        fill="currentColor"
        d="M3 7.5C3 9.98528 5.01474 12 7.5 12C8.96564 12 11.6249 12 11.9999 12C12 11.25 12 9 12 7.5C12 5.01472 9.98526 3 7.5 3C5.01474 3 3 5.01472 3 7.5Z"
      />
      <path
        fill="currentColor"
        d="M16.9999 3.02659C14.5147 3.04125 12.5118 5.05263 12.5264 7.51909C12.535 8.97363 12.5509 11.6808 12.5531 12.0529C13.3031 12.0486 15.4115 12.036 17.0531 12.0264C19.5383 12.0117 21.5408 9.93243 21.5262 7.46598C21.5117 4.99953 19.4852 3.01192 16.9999 3.02659Z"
      />
      <path
        fill="currentColor"
        d="M3 17.053C3 14.5677 4.99953 12.553 7.46604 12.553C8.92061 12.553 11.6278 12.553 12 12.553C12.0001 13.303 12 15.553 12 17.053C12 19.5383 9.93254 21.553 7.46604 21.553C4.99953 21.553 3 19.5383 3 17.053Z"
      />
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tick shown beside the active language option (inline). */
export function LangTick({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
