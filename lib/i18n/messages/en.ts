/**
 * English message catalogue — the **canonical shape**. Every other locale is
 * typed as `Messages` (this file's shape), so a missing or misspelled key is a
 * compile error, not a silent fallback. Keys are grouped by namespace; add new
 * namespaces here first, then mirror them in `ru.ts` / `uz.ts`.
 *
 * Strings transcribed from the `_Peoplor_Design` prototype's `i18n.js` so the
 * wording matches the design exactly across en / ru / uz.
 */
export const en = {
  common: {
    language: "Language",
    upgrade: "Upgrade",
    freePlan: "Free plan",
    comingSoon: "Coming soon",
  },
  nav: {
    newJob: "New job",
    newSearch: "New search",
    savedApplied: "Saved & applied",
    candidates: "Candidates",
    profile: "Profile",
    company: "Company",
    careerMigration: "Career & migration",
    globalHiring: "Global hiring",
  },
  sidebar: {
    recent: "Recent",
    noSearches: "No searches yet",
    noChats: "No chats yet",
  },
  accountMenu: {
    upgradePlan: "Upgrade plan",
    account: "Account",
    settings: "Settings",
    help: "Help",
    logout: "Logout",
  },
};

/**
 * The canonical message shape every locale must satisfy. Leaves are `string`
 * (no `as const`) so other locales conform on **shape**, not on the English
 * wording — a missing/misspelled key still fails the build via `ru`/`uz` being
 * typed as `Messages`.
 */
export type Messages = typeof en;
