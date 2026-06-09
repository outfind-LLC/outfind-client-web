import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type { RecommendedVacancy } from "@/interfaces/vacancy.interface";

export interface ListRecommendationsQuery {
  limit?: number;
  cursor?: string;
}

/** Worker recommendations service — vacancies matched to the worker's profile. */
export const recommendationsService = {
  async list(
    query: ListRecommendationsQuery = {},
  ): Promise<RecommendedVacancy[]> {
    return api.get<RecommendedVacancy[]>(
      `/worker/recommendations${buildQuery(query)}`,
    );
  },
};
