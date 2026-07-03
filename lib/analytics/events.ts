/**
 * Client-observed product-funnel events. This list MUST stay a subset of the
 * backend's `CLIENT_TRACKABLE_EVENTS` allow-list — the server rejects any batch
 * containing a name outside it, so `track()` also filters against these.
 * Server-authoritative events (signup_completed, application_submitted,
 * company_created, job_post_published, ai_profile_generated, candidate_action,
 * match_generated, notification_sent) are emitted server-side, never from here.
 */
export const ANALYTICS_EVENTS = {
  SIGNUP_STARTED: "signup_started",
  JOB_FEED_VIEWED: "job_feed_viewed",
  JOB_VIEWED: "job_viewed",
  PROFILE_STARTED: "profile_started",
  VOICE_RECORDING_COMPLETED: "voice_recording_completed",
  PROFILE_COMPLETED: "profile_completed",
  APPLICATION_STATUS_VIEWED: "application_status_viewed",
  JOB_POST_STARTED: "job_post_started",
  APPLICANTS_LIST_VIEWED: "applicants_list_viewed",
  CANDIDATE_PROFILE_VIEWED: "candidate_profile_viewed",
  ERROR_SHOWN: "error_shown",
  NOTIFICATION_OPENED: "notification_opened",
  FEATURE_ENGAGED_DEEP: "feature_engaged_deep",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
