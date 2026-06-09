/**
 * Centralised route table — never hardcode path strings in components.
 * `chat(id)` etc. are helpers so links stay type-safe and refactorable.
 */
export const routes = {
  home: "/",
  auth: "/auth",
  signup: "/auth?mode=signup",
  onboarding: "/onboarding",

  // Worker
  /** Session-aware dispatcher → redirects to the account's default tab. */
  chat: "/chat",
  chatThread: (id: string) => `/chat/${id}`,
  // The two primary tabs that replace the old single chat surface.
  jobs: "/jobs",
  jobsThread: (id: string) => `/jobs/${id}`,
  assistant: "/assistant",
  assistantThread: (id: string) => `/assistant/${id}`,
  applications: "/applications",
  bookmarks: "/bookmarks",
  profile: "/profile",
  profileCv: "/profile/cv",

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
  upgrade: "/upgrade",
} as const;

/** Routes that require an authenticated session (enforced in proxy.ts). */
export const PROTECTED_PREFIXES = [
  "/chat",
  "/jobs",
  "/assistant",
  "/applications",
  "/bookmarks",
  "/profile",
  "/vacancies",
  "/applicants",
  "/history",
  "/settings",
  "/help",
  "/upgrade",
  "/onboarding",
] as const;
