import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type { MyEntitlements, PublicPlan } from "@/interfaces/plan.interface";
import type { PlanAudience } from "@/interfaces/enums";

/**
 * Plan / entitlement service.
 * - `getPublicPricing` is public (pricing page).
 * - `getMyEntitlements` is the signed-in user's annotated feature catalog,
 *   used for the plan badge and per-feature lock states.
 */
export const planService = {
  async getPublicPricing(audience?: PlanAudience): Promise<PublicPlan[]> {
    return api.get<PublicPlan[]>(`/plans${buildQuery({ audience })}`);
  },

  async getMyEntitlements(): Promise<MyEntitlements> {
    return api.get<MyEntitlements>("/plans/me");
  },
};
