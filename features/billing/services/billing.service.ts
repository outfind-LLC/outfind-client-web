import { api } from "@/lib/api/client";
import type {
  CheckoutResult,
  CreateCheckoutPayload,
  CreatePaygCheckoutPayload,
  MySubscription,
  PortalResult,
} from "@/interfaces/billing.interface";

/**
 * Billing service. Checkout and portal return Polar-hosted URLs the frontend
 * redirects the browser to; the subscription view is read from our own DB.
 */
export const billingService = {
  async createCheckout(
    payload: CreateCheckoutPayload,
  ): Promise<CheckoutResult> {
    return api.post<CheckoutResult>("/billing/checkout", payload);
  },

  async createPaygCheckout(
    payload: CreatePaygCheckoutPayload,
  ): Promise<CheckoutResult> {
    return api.post<CheckoutResult>("/billing/checkout/payg", payload);
  },

  async getPortal(): Promise<PortalResult> {
    return api.get<PortalResult>("/billing/portal");
  },

  async getMySubscription(): Promise<MySubscription> {
    return api.get<MySubscription>("/billing/subscription");
  },
};
