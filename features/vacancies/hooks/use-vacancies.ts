"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import {
  vacanciesService,
  type GenerateDescriptionInput,
} from "@/features/vacancies/services/vacancies.service";
import type {
  CreateVacancyPayload,
  UpdateVacancyPayload,
  UpdateVacancyStatusPayload,
  Vacancy,
} from "@/interfaces/vacancy.interface";
import type { VacancyStatus } from "@/interfaces/enums";

/**
 * Employer: list own vacancies, optionally filtered by status. `enabled` lets
 * callers hold the request until the employer has a company profile.
 */
export function useVacancies(status?: VacancyStatus, enabled = true) {
  return useQuery<Vacancy[]>({
    queryKey: qk.vacancies(status),
    queryFn: () => vacanciesService.listOwn(status ? { status } : {}),
    enabled,
  });
}

/** Employer: fetch one owned vacancy by id. */
export function useVacancy(id: string) {
  return useQuery<Vacancy>({
    queryKey: qk.vacancy(id),
    queryFn: () => vacanciesService.getOwn(id),
    enabled: Boolean(id),
  });
}

/** Employer: create a new vacancy. Refreshes the vacancy list on success. */
export function useCreateVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVacancyPayload) =>
      vacanciesService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacancies"] }),
  });
}

/**
 * Employer: parse a spoken/typed job brief into wizard fields for autofill.
 * Persists nothing — the wizard prefills from the result.
 */
export function useParseVacancy() {
  return useMutation({
    mutationFn: (text: string) => vacanciesService.parseVacancy(text),
  });
}

/**
 * Employer: generate the vacancy description with AI from the wizard's
 * structured facts. Returns editable text — nothing persists until save.
 */
export function useGenerateVacancyDescription() {
  return useMutation({
    mutationFn: (input: GenerateDescriptionInput) =>
      vacanciesService.generateDescription(input),
  });
}

/** Employer: update an owned vacancy. Refreshes the list + that detail. */
export function useUpdateVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdateVacancyPayload }) =>
      vacanciesService.update(vars.id, vars.payload),
    onSuccess: (_vacancy, vars) => {
      queryClient.invalidateQueries({ queryKey: ["vacancies"] });
      queryClient.invalidateQueries({ queryKey: qk.vacancy(vars.id) });
    },
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
