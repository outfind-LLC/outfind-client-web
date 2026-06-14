"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { vacanciesService } from "@/features/vacancies/services/vacancies.service";
import type { PublicVacancy } from "@/interfaces/vacancy.interface";

/**
 * Full detail of one vacancy, fetched only when needed (e.g. while a worker has a
 * recommendation's detail view open). Cached by vacancy id and shared with any
 * other consumer of `qk.vacancy(id)`.
 */
export function useVacancyDetail(id: string, enabled: boolean) {
  return useQuery<PublicVacancy>({
    queryKey: qk.vacancy(id),
    queryFn: () => vacanciesService.getPublic(id),
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
