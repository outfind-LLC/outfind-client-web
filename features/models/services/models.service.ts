import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  ListModelsQuery,
  ModelProvider,
} from "@/interfaces/ai-model.interface";

/**
 * AI model catalog service. `GET /models` returns models grouped by provider;
 * pass `planTier` to get only the models the caller's plan may select.
 */
export const modelsService = {
  async listProviders(query: ListModelsQuery = {}): Promise<ModelProvider[]> {
    return api.get<ModelProvider[]>(`/models${buildQuery(query)}`);
  },
};
