/**
 * Single source of truth for React Query cache keys.
 * Keeping them centralised avoids typo-driven cache misses and makes
 * invalidation explicit (`queryClient.invalidateQueries({ queryKey: qk.session })`).
 */
export const qk = {
  session: ["session"] as const,
  myEntitlements: ["plan", "entitlements"] as const,
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
  bookmarks: ["bookmarks"] as const,

  vacancies: (status?: string) => ["vacancies", status ?? "all"] as const,
  vacancy: (id: string) => ["vacancy", id] as const,
  applicants: (vacancyId?: string) =>
    ["applicants", vacancyId ?? "all"] as const,

  workerProfile: ["profile", "worker"] as const,
  employerProfile: ["profile", "employer"] as const,
} as const;
