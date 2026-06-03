/**
 * AI model catalog contracts — mirror of the backend `/models` projection.
 *
 * Note: this endpoint returns `{ success, data: ModelProvider[], total }` rather
 * than the standard `{ data, meta }` envelope. The shared `parseEnvelope` still
 * unwraps `data` correctly because it keys off `success`.
 */
import type { ModelTier } from "./enums";

export interface ModelCost {
  input?: number;
  output?: number;
  cache_read?: number;
  cache_write?: number;
}

export interface ModelModalities {
  input: string[];
  output: string[];
}

export interface ModelLimit {
  context?: number;
  input?: number;
  output?: number;
}

/** A single selectable AI model. `id` is the gateway sdk model id (e.g. "openai/gpt-4.1"). */
export interface AiModel {
  id: string;
  name: string | null;
  family: string | null;
  attachment: boolean;
  reasoning: boolean;
  toolCall: boolean;
  temperature: boolean;
  knowledge: string | null;
  releaseDate: string | null;
  lastUpdated: string | null;
  modalities: ModelModalities | null;
  cost: ModelCost | null;
  limit: ModelLimit | null;
  description: string | null;
  recommendedFor: string | null;
  shortOrder: string | null;
  isFree: boolean;
  isPaid: boolean;
  openWweights: boolean;
  tier: ModelTier;
}

/** Models grouped under their provider, as returned by `GET /models`. */
export interface ModelProvider {
  id: string;
  provider: string;
  image: string | null;
  models: AiModel[];
}

/** Query params accepted by `GET /models`. */
export interface ListModelsQuery {
  search?: string;
  provider?: string;
  isFree?: boolean;
  isPaid?: boolean;
  tier?: ModelTier;
  /** Cumulative: every model a plan at this tier may select (at or below). */
  planTier?: ModelTier;
}
