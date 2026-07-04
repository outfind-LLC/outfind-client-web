/**
 * Centralised route table — never hardcode path strings in components.
 * `chat(id)` etc. are helpers so links stay type-safe and refactorable.
 */
export const routes = {
  home: "/",
  /** Deprecated standalone auth page — now a redirect (auth is modal-first). */
  auth: "/auth",
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
  tools: "/tools",
  applications: "/applications",
  bookmarks: "/bookmarks",
  profile: "/profile",
  /** Resume manager (list of the worker's resumes). */
  profileCv: "/profile/cv",
  /** Resume editor for one resume. */
  resumeEditor: (id: string) => `/profile/cv/${id}`,
  /** Career & migration — worker only. */
  career: "/career",
  /** Visa & work-permit guidance — worker only. */
  visa: "/visa",

  // Employer (employer-only routes — role-guarded by the (employer) group layout)
  /** Company profile — create/edit + detail. Replaces the old /profile/company. */
  company: "/company",
  /** Global hiring — international talent markets + migration-ready candidates. */
  globalHiring: "/global-hiring",
  vacancies: "/vacancies",
  vacancyNew: "/vacancies/new",
  vacancy: (id: string) => `/vacancies/${id}`,
  vacancyEdit: (id: string) => `/vacancies/${id}/edit`,
  /** Candidates inbox (employer). */
  candidates: "/candidates",
  vacancyApplicants: (id: string) => `/candidates/${id}`,
  candidateProfile: (vacancyId: string, applicationId: string) =>
    `/candidates/${vacancyId}/${applicationId}`,

  // Shared
  history: "/history",
  settings: "/settings",
  help: "/help",
  /** Public help center / FAQ (marketing). */
  faq: "/faq",
  pricing: "/pricing",
  upgrade: "/upgrade",
} as const;

/** Routes that require an authenticated session (enforced in proxy.ts). */
export const PROTECTED_PREFIXES = [
  "/chat",
  "/jobs",
  "/assistant",
  "/tools",
  "/applications",
  "/bookmarks",
  "/profile",
  "/career",
  "/visa",
  "/company",
  "/global-hiring",
  "/vacancies",
  "/candidates",
  "/history",
  "/settings",
  "/help",
  "/upgrade",
  "/onboarding",
] as const;
