import {
  Bookmark,
  Briefcase,
  FileText,
  MessageSquarePlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/config/routes";
import { ACCOUNT_TYPE, type AccountType } from "@/interfaces/enums";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Highlight only on exact match (e.g. "New chat" shouldn't match threads). */
  exact?: boolean;
}

const WORKER_NAV: NavItem[] = [
  {
    label: "New chat",
    href: routes.chat,
    icon: MessageSquarePlus,
    exact: true,
  },
  { label: "Applications", href: routes.applications, icon: FileText },
  { label: "Bookmarks", href: routes.bookmarks, icon: Bookmark },
  { label: "Profile", href: routes.profile, icon: UserRound },
];

const EMPLOYER_NAV: NavItem[] = [
  {
    label: "New chat",
    href: routes.chat,
    icon: MessageSquarePlus,
    exact: true,
  },
  { label: "Vacancies", href: routes.vacancies, icon: Briefcase },
  { label: "Applicants", href: routes.applicants, icon: Users },
  { label: "Profile", href: routes.profile, icon: UserRound },
];

/** Sidebar nav for the given account type (admins see the worker layout). */
export function getNavItems(accountType: AccountType): NavItem[] {
  return accountType === ACCOUNT_TYPE.EMPLOYER ? EMPLOYER_NAV : WORKER_NAV;
}
