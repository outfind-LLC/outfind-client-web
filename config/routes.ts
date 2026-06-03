/**
 * Centralised route table — never hardcode path strings in components.
 * `chat(id)` etc. are helpers so links stay type-safe and refactorable.
 */
export const routes = {
  home: "/",
  auth: "/auth",
  onboarding: "/onboarding",

  // Worker
  chat: "/chat",
  chatThread: (id: string) => `/chat/${id}`,
  applications: "/applications",
  bookmarks: "/bookmarks",
  profile: "/profile",

  // Employer
  vacancies: "/vacancies",
  vacancyNew: "/vacancies/new",
  vacancy: (id: string) => `/vacancies/${id}`,
  applicants: "/applicants",
  vacancyApplicants: (id: string) => `/applicants/${id}`,

  // Shared
  history: "/history",
  settings: "/settings",
  help: "/help",
  pricing: "/pricing",
} as const;

/** Routes that require an authenticated session (enforced in proxy.ts). */
export const PROTECTED_PREFIXES = [
  "/chat",
  "/applications",
  "/bookmarks",
  "/profile",
  "/vacancies",
  "/applicants",
  "/history",
  "/settings",
  "/help",
  "/onboarding",
] as const;

/** Routes only reachable when signed-out (redirect to app if authed). */
export const AUTH_ROUTES = ["/auth"] as const;
