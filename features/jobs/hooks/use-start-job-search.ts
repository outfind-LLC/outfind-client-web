"use client";

import { routes } from "@/config/routes";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { AI_SPECIALIST } from "@/interfaces/enums";

export interface JobSearchParams {
  profession: string;
  city: string;
  model: string | null;
}

/** Compose the opening prompt sent to the Job Finder specialist. */
function buildPrompt({ profession, city }: JobSearchParams): string {
  const where = city.trim() ? ` in ${city.trim()}` : "";
  return `Find me ${profession.trim()} jobs${where}. Show the best matches with key details for each role.`;
}

/**
 * Seed a Job Finder conversation from the search modal: pin the composer to the
 * JOB_FINDER specialist and chosen model, then create the conversation and route
 * to its thread under `/jobs/<id>` (where the seeded prompt auto-sends).
 */
export function useStartJobSearch() {
  const setModel = useComposerStore((s) => s.setModel);
  const setSpecialist = useComposerStore((s) => s.setSpecialist);
  const start = useStartConversation(routes.jobsThread);

  const startSearch = (
    params: JobSearchParams,
    onError?: (error: unknown) => void,
  ) => {
    setSpecialist(AI_SPECIALIST.JOB_FINDER);
    if (params.model) setModel(params.model);
    start.mutate(
      { message: buildPrompt(params), specialist: AI_SPECIALIST.JOB_FINDER },
      { onError },
    );
  };

  return { startSearch, isPending: start.isPending };
}
