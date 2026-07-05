"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { accessService } from "@/features/billing/services/access.service";
import type { FeatureKey, MyAccess } from "@/interfaces/access.interface";

/**
 * The caller's Pro-access map (`GET /me/access`). Short cache so a checkout
 * return or plan change is picked up quickly.
 */
export function useMyAccess() {
  return useQuery<MyAccess>({
    queryKey: qk.myAccess,
    queryFn: () => accessService.getMyAccess(),
    staleTime: 60 * 1000,
  });
}

export interface FeatureState {
  /** Optimistic while loading — the backend 403 is the real enforcement. */
  allowed: boolean;
  /**
   * True only once the access map has loaded AND says the feature is not
   * allowed — the ONLY signal that may render a lock. While loading (or on
   * fetch error) access is unknown, so nothing flashes locked.
   */
  locked: boolean;
  limit: number | null;
  used: number | null;
  /** Whether the access map has actually loaded. */
  isLoaded: boolean;
}

/**
 * One feature's access state. Unknown-while-loading by design: surfaces render
 * unlocked until the data proves otherwise (abuse is still stopped by the
 * backend's 403 `FEATURE_LOCKED`); a missing key after load means locked.
 */
export function useFeature(key: FeatureKey): FeatureState {
  const { data, isSuccess } = useMyAccess();
  const feature = data?.features[key];
  const allowed = isSuccess ? (feature?.allowed ?? false) : true;
  return {
    allowed,
    locked: isSuccess && !allowed,
    limit: feature?.limit ?? null,
    used: feature?.used ?? null,
    isLoaded: isSuccess,
  };
}
