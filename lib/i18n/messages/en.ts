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
  chat: {
    // Composer
    composerPlaceholder: "Search jobs…",
    composerListening: "Listening…",
    composerFoot:
      "Peoplor helps you find jobs and apply. It can make mistakes — always check job details before applying.",
    ariaUseVoice: "Use voice",
    ariaSend: "Send",
    ariaStop: "Stop",
    micBlocked: "Microphone blocked. Allow mic access in your browser settings.",
    micNoSpeech: "Didn't catch that — try speaking again.",
    micNoDevice: "No microphone found.",
    micNetwork: "Voice service is unavailable right now.",
    micGeneric: "Couldn't start voice input.",
    // Results header + states
    matchCount: "{n} matches",
    matchCountOne: "1 match",
    candidateCount: "{n} candidates",
    candidateCountOne: "1 candidate",
    rankedByFit: "ranked by fit",
    jobSearchUnavailable:
      "Job search is temporarily unavailable. Please try again in a moment.",
    working: "Working",
    // Job card
    postedOn: "Posted on Peoplor",
    verifiedEmployer: "Verified employer",
    remote: "Remote",
    cardMatch: "{n}% match",
    cardPosted: "Posted {when}",
    // Job-detail sheet
    jdFoundOnline: "Found online by Peoplor AI",
    jdMatchProfile: "{n}% match with your profile",
    jdAbout: "About this role",
    jdDuties: "What you'll do",
    jdReqs: "What you'll need",
    jdSkills: "Skills",
    jdHowApply: "How to apply",
    jdPlatformApply:
      "This role was posted on Peoplor, so you can apply in one tap — we'll send your CV tailored to this job.",
    jdOnlineApply:
      "Peoplor found this role online, so you apply with the employer directly.",
    jdOnlineContacts: " Here are their contact details:",
    jdOnlineNote:
      "Peoplor can't apply on your behalf for roles found online. Always verify the employer and never pay for a job or share documents before you're sure.",
    jdNoChannel: "No application channel was provided for this role.",
    close: "Close",
    save: "Save",
    saved: "Saved",
    applyCv: "Apply with my CV",
    done: "Done",
    email: "Email",
    callEmployer: "Call employer",
    applyExternal: "Apply",
    // Apply panel (cover letter)
    applyTo: "Apply to {title}",
    coverFor: "Add a cover letter for {company} — or generate one with AI.",
    coverGeneric: "Add a cover letter — or generate one with AI.",
    coverLetter: "Cover letter",
    optional: "(optional)",
    generateAi: "Generate with AI",
    generating: "Generating…",
    coverPlaceholder:
      "Introduce yourself and explain why you're a great fit for this role…",
    noDescHint:
      "AI generation isn't available for this role — it has no description. You can still write your own.",
    shareContactTitle: "Let the employer contact you directly",
    shareContactDesc:
      "Shares your email and phone with this employer so they can reach you outside the platform. You can leave this off and chat here instead.",
    cancel: "Cancel",
    sendApplication: "Send application",
    coverGenError: "Couldn't generate a cover letter",
    // Hero + new-chat
    heroTitle: "What kind of role are you looking for?",
    assistantTitle: "How can I help with your career?",
    employerTitle: "Who are you looking to hire?",
    assistantPlaceholder: "Ask anything…",
    employerPlaceholder: "Describe who you need…",
    startConvError: "Couldn't start the conversation",
    chipTruckDriver: "Truck driver",
    chipWarehouse: "Warehouse work",
    chipCourier: "Delivery courier",
    chipCleaner: "Cleaner",
    chipWelder: "Welder",
    chipCareAssistant: "Care assistant",
    chipBuildCv: "Build my CV",
    chipImproveResume: "Improve my resume",
    chipInterviewPrep: "Interview prep",
    chipCareerAdvice: "Career advice",
    chipTruckDrivers: "Truck drivers",
    chipWarehouseStaff: "Warehouse staff",
    chipDeliveryCouriers: "Delivery couriers",
    chipCleaners: "Cleaners",
    // Job-search modal
    searchTitle: "Find your next job",
    searchDesc:
      "Tell us what you're looking for. We search jobs from across the web and rank the best matches for you.",
    professionLabel: "Profession",
    professionPlaceholder: "e.g. Welder, Nurse, Driver",
    cityLabel: "City",
    cityPlaceholder: "e.g. Warsaw, Berlin, Remote",
    searchJobs: "Search jobs",
    starting: "Starting…",
    searchError: "Couldn't start the search",
  },
};

/**
 * The canonical message shape every locale must satisfy. Leaves are `string`
 * (no `as const`) so other locales conform on **shape**, not on the English
 * wording — a missing/misspelled key still fails the build via `ru`/`uz` being
 * typed as `Messages`.
 */
export type Messages = typeof en;
