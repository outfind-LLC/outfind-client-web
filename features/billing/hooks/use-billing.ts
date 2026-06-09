"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { billingService } from "@/features/billing/services/billing.service";
import type {
  CreateCheckoutPayload,
  CreatePaygCheckoutPayload,
  MySubscription,
} from "@/interfaces/billing.interface";

/** The caller's current subscription (source of truth: our DB). */
export function useSubscription() {
  return useQuery<MySubscription>({
    queryKey: qk.subscription,
    queryFn: () => billingService.getMySubscription(),
  });
}

/** Open the Polar customer portal (manage / cancel) in the same tab. */
export function useBillingPortal() {
  return useMutation({
    mutationFn: () => billingService.getPortal(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

/** Start a hosted checkout and redirect to the Polar-hosted URL. */
export function useCheckout() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutPayload) =>
      billingService.createCheckout(payload),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}

/** Start a one-time pay-as-you-go vacancy checkout and redirect to Polar. */
export function usePaygCheckout() {
  return useMutation({
    mutationFn: (payload: CreatePaygCheckoutPayload) =>
      billingService.createPaygCheckout(payload),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}
