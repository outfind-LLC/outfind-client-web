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
  applications: {
    title: "Saved & applied",
    tabApplied: "Applied",
    tabSaved: "Saved",
    onlyUnread: "Only unread",
    emptyNoUnread: "No unread chats",
    emptyNoUnreadDesc: "You're all caught up.",
    emptyNoApps: "No applications yet",
    emptyNoAppsDesc:
      "When you apply to a job, your chat with the employer shows up here.",
    emptyNoSaved: "Nothing saved",
    emptyNoSavedDesc: "Tap the bookmark on any job to keep it here for later.",
    viewJob: "View job",
    applyMessage: "Apply & message",
    statusInterview: "Interview invite",
    statusReply: "New reply",
    statusApplied: "Applied to vacancy",
    statusViewed: "Viewed by employer",
    statusInReview: "In review",
    statusRejected: "Not selected",
    pinApplied: "Applied to vacancy",
    composerPlaceholder: "Message…",
    quickThanks: "Thank you!",
    quickAvailable: "I'm available this week",
    quickLocation: "What's the location?",
    quickRemote: "Can it be remote?",
    quickNext: "What are the next steps?",
    appliedOn: "You applied on {date}",
    noMessages: "No messages yet — say hello.",
    loadingConversation: "Loading conversation…",
    removeSaved: "Remove from saved",
    toastRemoved: "Removed from saved",
    toastAppSent: "Application sent",
    toastCalling: "Voice calls are coming soon",
    toastConvOptions: "Conversation options coming soon",
    toastAttach: "Attachments are coming soon",
    errorSend: "Couldn't send the message",
    errorApply: "Couldn't apply to this job",
    salaryFrom: "From {amount}",
    typeFullTime: "Full-time",
    typePartTime: "Part-time",
    typeContract: "Contract",
    typeSeasonal: "Seasonal",
    typeInternship: "Internship",
    workOnSite: "On-site",
    workRemote: "Remote",
    dayToday: "Today",
    dayYesterday: "Yesterday",
    ariaOpenMenu: "Open menu",
    ariaBack: "Back",
    ariaCall: "Call",
    ariaMore: "More",
    ariaSend: "Send",
    ariaAttach: "Attach",
  },
};

/**
 * The canonical message shape every locale must satisfy. Leaves are `string`
 * (no `as const`) so other locales conform on **shape**, not on the English
 * wording — a missing/misspelled key still fails the build via `ru`/`uz` being
 * typed as `Messages`.
 */
export type Messages = typeof en;
