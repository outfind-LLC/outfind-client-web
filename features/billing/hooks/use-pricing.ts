"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { planService } from "@/features/billing/services/plan.service";
import type { PublicPlan } from "@/interfaces/plan.interface";
import type { PlanAudience } from "@/interfaces/enums";

/** Public pricing plans for an audience (worker / employer). Long cache. */
export function usePublicPricing(audience?: PlanAudience) {
  return useQuery<PublicPlan[]>({
    queryKey: qk.pricing(audience),
    queryFn: () => planService.getPublicPricing(audience),
    staleTime: 10 * 60 * 1000,
  });
}
