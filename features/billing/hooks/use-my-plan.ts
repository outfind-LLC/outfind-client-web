"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { planService } from "@/features/billing/services/plan.service";
import type { MyEntitlements } from "@/interfaces/plan.interface";

/**
 * The caller's current plan (name + tier) for the sidebar badge and gating.
 * Tolerant: a failure (e.g. catalog not yet seeded) leaves `plan` null so the
 * shell still renders — it never blocks the dashboard.
 */
export function useMyPlan() {
  const query = useQuery<MyEntitlements>({
    queryKey: qk.myEntitlements,
    queryFn: () => planService.getMyEntitlements(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    plan: query.data?.plan ?? null,
    features: query.data?.features ?? [],
    isLoading: query.isLoading,
  };
}
