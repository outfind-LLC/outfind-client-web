"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { billingService } from "@/features/billing/services/billing.service";
import { BILLING_PENDING_KEY } from "@/features/settings/constants/sounds";
import { playEventSound } from "@/features/settings/lib/play-sound";
import type {
  CreateCheckoutPayload,
  CreatePaygCheckoutPayload,
  MySubscription,
} from "@/interfaces/billing.interface";

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
    onError: () => playEventSound("billingError"),
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
    onError: () => playEventSound("billingError"),
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
    onError: () => playEventSound("billingError"),
  });
}
