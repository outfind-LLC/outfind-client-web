"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { applicationsService } from "@/features/applications/services/applications.service";
import {
  EMPLOYER_MOCKS_ENABLED,
  mockEmployerApplications,
} from "@/features/applications/data/employer-mocks";
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
    mutationFn: (vars: { vacancyId: string; payload?: ApplyToVacancyPayload }) =>
      applicationsService.apply(vars.vacancyId, vars.payload),
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
 * (Candidates inbox). PROPOSED endpoint — `retry:false` so a 404 degrades to an
 * empty inbox instead of retrying/toasting. See api-need.md §2. */
export function useEmployerApplications() {
  return useQuery<EmployerApplication[]>({
    queryKey: ["applicants", "all"],
    queryFn: () => applicationsService.listAllApplicants(),
    retry: false,
    // Mock seam: seed the inbox so it's fully populated today; a live endpoint
    // result replaces it, and a 404 leaves the seed in place. Flip off in
    // employer-mocks.ts once the endpoint ships. See docs/api/candidates.md.
    initialData: EMPLOYER_MOCKS_ENABLED ? mockEmployerApplications() : undefined,
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
