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
  { label: "New chat", href: routes.assistant, icon: "plus", newChat: true },
  { label: "Vacancies", href: routes.vacancies, icon: "briefcase" },
  { label: "Applicants", href: routes.applicants, icon: "users" },
  { label: "Profile", href: routes.profile, icon: "user" },
];

/** Sidebar nav for the given account type (admins see the worker layout). */
export function getNavItems(accountType: AccountType): NavItem[] {
  return accountType === ACCOUNT_TYPE.EMPLOYER ? EMPLOYER_NAV : WORKER_NAV;
}
