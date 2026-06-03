"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { modelsService } from "@/features/models/services/models.service";
import type {
  ListModelsQuery,
  ModelProvider,
} from "@/interfaces/ai-model.interface";

/** AI model catalog grouped by provider. Long cache — the catalog is static. */
export function useModels(query: ListModelsQuery = {}) {
  return useQuery<ModelProvider[]>({
    queryKey: [...qk.aiModels(), query],
    queryFn: () => modelsService.listProviders(query),
    staleTime: 30 * 60 * 1000,
  });
}
