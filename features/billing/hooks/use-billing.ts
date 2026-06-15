"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { billingService } from "@/features/billing/services/billing.service";
import { BILLING_PENDING_KEY } from "@/features/settings/constants/sounds";
import { playEventSound } from "@/features/settings/lib/play-sound";
import { isApiClientError } from "@/lib/api/error";
import type {
  CreateCheckoutPayload,
  CreatePaygCheckoutPayload,
  MySubscription,
} from "@/interfaces/billing.interface";

/** Surface a friendly billing error (never the raw backend/provider message). */
function notifyBillingError(error: unknown, fallback: string) {
  playEventSound("billingError");
  toast.error(isApiClientError(error) ? error.message : fallback);
}

/** Mark that a checkout is in flight so we can cue the result on return. */
function markBillingPending() {
  try {
    sessionStorage.setItem(BILLING_PENDING_KEY, "1");
  } catch {
    // Storage disabled — the success cue just won't fire.
  }
}

/** The caller's current subscription (source of truth: our DB). */
export function useSubscription(enabled = true) {
  return useQuery<MySubscription>({
    queryKey: qk.subscription,
    queryFn: () => billingService.getMySubscription(),
    enabled,
  });
}

/** Open the Polar customer portal (manage / cancel) in the same tab. */
export function useBillingPortal() {
  return useMutation({
    mutationFn: () => billingService.getPortal(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error) =>
      notifyBillingError(error, "Couldn't open the billing portal. Please try again."),
  });
}

/** Start a hosted checkout and redirect to the Polar-hosted URL. */
export function useCheckout() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutPayload) =>
      billingService.createCheckout(payload),
    onSuccess: ({ url }) => {
      markBillingPending();
      window.location.href = url;
    },
    onError: (error) =>
      notifyBillingError(error, "Couldn't start checkout. Please try again."),
  });
}

/** Start a one-time pay-as-you-go vacancy checkout and redirect to Polar. */
export function usePaygCheckout() {
  return useMutation({
    mutationFn: (payload: CreatePaygCheckoutPayload) =>
      billingService.createPaygCheckout(payload),
    onSuccess: ({ url }) => {
      markBillingPending();
      window.location.href = url;
    },
    onError: (error) =>
      notifyBillingError(error, "Couldn't start checkout. Please try again."),
  });
}
