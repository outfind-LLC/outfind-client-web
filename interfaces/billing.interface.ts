/**
 * Billing contracts — mirror of the backend billing module. Checkout and portal
 * return Polar-hosted URLs the frontend redirects to; the subscription view is
 * read straight from our DB (the source of truth).
 */
import type { BillingInterval, PlanType, SubscriptionStatus } from "./enums";

/** Result of `POST /billing/checkout`. */
export interface CheckoutResult {
  url: string;
  checkoutId: string;
}

/** Result of `GET /billing/portal`. */
export interface PortalResult {
  url: string;
}

/** The caller's current subscription (`GET /billing/subscription`). */
export interface MySubscription {
  planType: PlanType;
  planName: string | null;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
}

/** Body for `POST /billing/checkout`. Interval lowercase to match Polar. */
export interface CreateCheckoutPayload {
  planCode: string;
  interval?: "month" | "year";
}
