import { routes } from "@/config/routes";
import { ACCOUNT_TYPE, type AccountType } from "@/interfaces/enums";
import type { IconName } from "@/features/dashboard/components/app-icons";
import type { MessageKey } from "@/lib/i18n/translate";

export interface NavItem {
  /** i18n key resolved at render so the label is localised (en / ru / uz). */
  labelKey: MessageKey;
  href: string;
  icon: IconName;
  /** First item renders as the borderless "new" affordance (plus icon). */
  newChat?: boolean;
  /** Highlight only on exact match (e.g. a tab root shouldn't match its threads). */
  exact?: boolean;
}

/** Worker sidebar — mirrors the prototype: New job · Saved & applied · Profile ·
 * Career & migration. */
const WORKER_NAV: NavItem[] = [
  { labelKey: "nav.newJob", href: routes.jobs, icon: "plus", newChat: true },
  { labelKey: "nav.savedApplied", href: routes.applications, icon: "docCheck" },
  { labelKey: "nav.profile", href: routes.profile, icon: "user" },
  { labelKey: "nav.careerMigration", href: routes.career, icon: "route" },
];

/** Employer sidebar — the same four positions: New search · Candidates · Company ·
 * Global hiring (Global hiring shares the Career screen + `route` glyph). */
const EMPLOYER_NAV: NavItem[] = [
  { labelKey: "nav.newSearch", href: routes.assistant, icon: "search", newChat: true },
  { labelKey: "nav.candidates", href: routes.applicants, icon: "users" },
  { labelKey: "nav.company", href: routes.employerProfile, icon: "company" },
  { labelKey: "nav.globalHiring", href: routes.career, icon: "route" },
];

/** Sidebar nav for the given account type (admins see the worker layout). */
export function getNavItems(accountType: AccountType): NavItem[] {
  return accountType === ACCOUNT_TYPE.EMPLOYER ? EMPLOYER_NAV : WORKER_NAV;
}
