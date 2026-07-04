"use client";

import { routes } from "@/config/routes";
import { useStartConversation } from "@/features/chat/hooks/use-conversations";
import { useComposerStore } from "@/features/chat/store/composer.store";
import { AI_SPECIALIST } from "@/interfaces/enums";

export interface JobSearchParams {
  profession: string;
  city: string;
}

/** Compose the opening prompt sent to the Job Finder specialist. */
function buildPrompt({ profession, city }: JobSearchParams): string {
  return `Find me ${profession.trim()} jobs in ${city.trim()}. Show the best matches with key details for each role.`;
}

/**
 * A specific conversation title from the search — "{profession} · {city}" (e.g.
 * "Forklift driver · Tashkent"), or just the profession for worldwide/remote
 * searches. Replaces the generic "Job search" name in the sidebar.
 */
function buildTitle({ profession, city }: JobSearchParams): string {
  const prof = profession.trim();
  const place = city.trim();
  if (!place || /^(worldwide|remote|anywhere|global)$/i.test(place))
    return prof;
  return `${prof} · ${place}`;
}

/**
 * Seed a Job Finder conversation from the search modal: pin the composer to the
 * JOB_FINDER specialist, then create the conversation and route to its thread
 * under `/jobs/<id>` (where the seeded prompt auto-sends). The model is chosen
 * server-side by plan tier.
 */
export function useStartJobSearch() {
  const setSpecialist = useComposerStore((s) => s.setSpecialist);
  const setJobSearch = useComposerStore((s) => s.setJobSearch);
  const start = useStartConversation(routes.jobsThread);

  const startSearch = (
    params: JobSearchParams,
    onError?: (error: unknown) => void,
  ) => {
    setSpecialist(AI_SPECIALIST.JOB_FINDER);
    start.mutate(
      {
        message: buildPrompt(params),
        specialist: AI_SPECIALIST.JOB_FINDER,
        title: buildTitle(params),
      },
      {
        // Stash the structured inputs against the new conversation so the chat
        // transport sends profession + city (the Job Finder requires them).
        onSuccess: (conversation) =>
          setJobSearch(conversation.id, {
            profession: params.profession.trim(),
            city: params.city.trim(),
          }),
        onError,
      },
    );
  };

  return { startSearch, isPending: start.isPending };
}
