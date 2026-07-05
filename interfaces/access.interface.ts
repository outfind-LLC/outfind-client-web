/**
 * Pro-access contract — mirror of the backend's `GET /me/access` response.
 * One boolean plan gate (`isPro`) plus a per-feature map used to render lock
 * indicators; protected APIs still enforce server-side with 403
 * `FEATURE_LOCKED` / `LIMIT_REACHED`.
 */

/** Every gateable feature key the backend exposes on `/me/access`. */
export type FeatureKey =
  | "ai_cv_builder"
  | "ai_job_search"
  | "ai_assistant"
  | "visa_guidance"
  | "ai_messages_monthly"
  | "cv_limit";

/** One feature's access row: boolean gate plus optional metering. */
export interface FeatureAccess {
  allowed: boolean;
  /** Metered features only (e.g. ai_messages_monthly, cv_limit). */
  limit: number | null;
  used: number | null;
}

/** The single Pro plan's current price (one-time for now; may change). */
export interface AccessPlan {
  name: string;
  priceUsd: number;
  interval: "one_time";
  note: "price_may_change";
}

/** `GET /me/access` — the caller's plan + per-feature access map. */
export interface MyAccess {
  isPro: boolean;
  plan: AccessPlan | null;
  features: Record<string, FeatureAccess>;
}
