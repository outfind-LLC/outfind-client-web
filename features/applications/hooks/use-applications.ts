"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { applicationsService } from "@/features/applications/services/applications.service";
import type {
  Application,
  ApplyToVacancyPayload,
  EmployerApplication,
  UpdateApplicationStatusPayload,
} from "@/interfaces/application.interface";
import type { ApplicationStatus } from "@/interfaces/enums";

/** Worker: list own applications, optionally filtered by status. */
export function useApplications(status?: ApplicationStatus) {
  return useQuery<Application[]>({
    queryKey: qk.applications(status),
    queryFn: () => applicationsService.listOwn(status ? { status } : {}),
  });
}

/** Worker: apply to a vacancy by id. Refreshes the applications list. */
export function useApplyToVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      vacancyId: string;
      payload?: ApplyToVacancyPayload;
    }) => applicationsService.apply(vars.vacancyId, vars.payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

/** Worker: withdraw (hard-delete) an application. */
export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsService.withdraw(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}

/** Employer: list applicants for one owned vacancy (with match score). */
export function useVacancyApplicants(vacancyId: string) {
  return useQuery<EmployerApplication[]>({
    queryKey: qk.applicants(vacancyId),
    queryFn: () => applicationsService.listApplicants(vacancyId),
    enabled: Boolean(vacancyId),
  });
}

/** Employer: flat list of all applicants across the employer's vacancies
 * (Candidates inbox) — `GET /employer/applications`. */
export function useEmployerApplications() {
  return useQuery<EmployerApplication[]>({
    queryKey: ["applicants", "all"],
    queryFn: () => applicationsService.listAllApplicants(),
  });
}

/** Employer: change an applicant's status. */
export function useUpdateApplicationStatus(vacancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      applicationId: string;
      payload: UpdateApplicationStatusPayload;
    }) => applicationsService.updateStatus(vars.applicationId, vars.payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.applicants(vacancyId) }),
  });
}
