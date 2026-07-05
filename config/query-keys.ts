/**
 * Single source of truth for React Query cache keys.
 * Keeping them centralised avoids typo-driven cache misses and makes
 * invalidation explicit (`queryClient.invalidateQueries({ queryKey: qk.session })`).
 */
export const qk = {
  session: ["session"] as const,
  myEntitlements: ["plan", "entitlements"] as const,
  /** Pro-feature access map (`GET /me/access`) — drives lock indicators. */
  myAccess: ["access", "me"] as const,
  pricing: (audience?: string) =>
    ["plan", "pricing", audience ?? "all"] as const,
  subscription: ["billing", "subscription"] as const,

  conversations: (audience?: string) =>
    ["chat", "conversations", audience ?? "all"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (conversationId: string) =>
    ["chat", "messages", conversationId] as const,

  aiModels: (audience?: string) => ["ai-models", audience ?? "all"] as const,

  applications: (status?: string) => ["applications", status ?? "all"] as const,
  applicationMessages: (applicationId: string) =>
    ["application", applicationId, "messages"] as const,
  candidateProfile: (applicationId: string) =>
    ["application", applicationId, "candidate"] as const,
  bookmarks: ["bookmarks"] as const,
  myFeedback: ["feedback", "mine"] as const,
  vacancyComments: (vacancyId: string) =>
    ["vacancy", vacancyId, "comments"] as const,

  vacancies: (status?: string) => ["vacancies", status ?? "all"] as const,
  vacancy: (id: string) => ["vacancy", id] as const,
  recommendations: ["recommendations"] as const,
  applicants: (vacancyId?: string) =>
    ["applicants", vacancyId ?? "all"] as const,
  shortlist: ["employer", "shortlist"] as const,

  workerProfile: ["profile", "worker"] as const,
  resumes: ["resumes"] as const,
  resume: (id: string) => ["resume", id] as const,
  employerProfile: ["profile", "employer"] as const,
  userSettings: ["settings", "me"] as const,

  /** Per-job AI tool result, cached so reopening a tool doesn't re-spend quota. */
  jobAiTool: (tool: string, jobKey: string) =>
    ["worker-ai", "job-tool", tool, jobKey] as const,

  /** Visa guide: the wizard bootstrap (citizenships/destinations/professions),
   * a country's checklist, and the user's saved selection. */
  visaBootstrap: ["visa", "bootstrap"] as const,
  visaChecklist: (key: string) => ["visa", "checklist", key] as const,
  visaPreference: ["visa", "preference"] as const,
} as const;
