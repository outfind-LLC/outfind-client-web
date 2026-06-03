"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { vacanciesService } from "@/features/vacancies/services/vacancies.service";
import type {
  UpdateVacancyStatusPayload,
  Vacancy,
} from "@/interfaces/vacancy.interface";
import type { VacancyStatus } from "@/interfaces/enums";

/** Employer: list own vacancies, optionally filtered by status. */
export function useVacancies(status?: VacancyStatus) {
  return useQuery<Vacancy[]>({
    queryKey: qk.vacancies(status),
    queryFn: () => vacanciesService.listOwn(status ? { status } : {}),
  });
}

/** Employer: change a vacancy's status (activate / pause / mark filled). */
export function useUpdateVacancyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdateVacancyStatusPayload }) =>
      vacanciesService.updateStatus(vars.id, vars.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacancies"] }),
  });
}

/** Employer: delete a vacancy (refused by the API if it has applications). */
export function useDeleteVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vacanciesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacancies"] }),
  });
}
