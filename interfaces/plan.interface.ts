/**
 * Plan / entitlement contracts — mirror of the backend plan module's
 * `PublicPlanView` (pricing page) and `MyEntitlementsView` (the caller's
 * annotated feature catalog).
 */
import type {
  EntitlementPeriod,
  FeatureType,
  ModelTier,
  PlanAudience,
  PlanType,
} from "./enums";

/** One feature row rendered on a public pricing plan. */
export interface PublicFeatureLine {
  key: string;
  name: string;
  category: string | null;
  type: FeatureType;
  included: boolean;
  /** Human-rendered value, e.g. "5 / month", "Priority", "—". */
  value: string;
}

/** A public pricing-page plan with its rendered feature lines. */
export interface PublicPlan {
  code: string;
  planType: PlanType;
  audience: PlanAudience;
  name: string;
  tagline: string | null;
  description: string | null;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  currency: string;
  trialDays: number;
  modelTier: ModelTier;
  isFeatured: boolean;
  features: PublicFeatureLine[];
}

/** One feature row for the current user: visible to all, locked if not in plan. */
export interface AnnotatedFeature {
  key: string;
  name: string;
  category: string | null;
  type: FeatureType;
  unit: string | null;
  /** False → render a lock icon; not selectable. */
  allowed: boolean;
  limit: number | null;
  period: EntitlementPeriod | null;
  used: number | null;
  remaining: number | null;
  textValue: string | null;
  /** When locked, the lowest tier that unlocks it (for "Upgrade to X"). */
  unlockedByPlanType: PlanType | null;
}

/** The authenticated user's full feature catalog (`GET /plans/me`). */
export interface MyEntitlements {
  plan: {
    planType: PlanType;
    code: string;
    name: string;
    audience: PlanAudience;
    modelTier: ModelTier;
  };
  features: AnnotatedFeature[];
}
