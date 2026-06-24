import { routes } from "@/config/routes";
import { ACCOUNT_TYPE, type AccountType } from "@/interfaces/enums";
import type { IconName } from "@/features/dashboard/components/app-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  /** First item renders as the borderless "new" affordance (plus icon). */
  newChat?: boolean;
  /** Highlight only on exact match (e.g. a tab root shouldn't match its threads). */
  exact?: boolean;
}

const WORKER_NAV: NavItem[] = [
  { label: "New job", href: routes.jobs, icon: "plus", newChat: true },
  { label: "Saved & applied", href: routes.applications, icon: "bookmark" },
  { label: "Profile", href: routes.profile, icon: "user" },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: "New search", href: routes.assistant, icon: "search", newChat: true },
  { label: "Candidates", href: routes.applicants, icon: "users" },
  { label: "Company", href: routes.employerProfile, icon: "company" },
];

/** Sidebar nav for the given account type (admins see the worker layout). */
export function getNavItems(accountType: AccountType): NavItem[] {
  return accountType === ACCOUNT_TYPE.EMPLOYER ? EMPLOYER_NAV : WORKER_NAV;
}
