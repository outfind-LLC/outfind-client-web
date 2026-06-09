"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { recommendationsService } from "@/features/recommendations/services/recommendations.service";
import type { RecommendedVacancy } from "@/interfaces/vacancy.interface";

/** Worker: vacancies recommended from the profile (enabled for worker accounts). */
export function useRecommendations(enabled = true) {
  return useQuery<RecommendedVacancy[]>({
    queryKey: qk.recommendations,
    queryFn: () => recommendationsService.list({ limit: 12 }),
    enabled,
  });
}
