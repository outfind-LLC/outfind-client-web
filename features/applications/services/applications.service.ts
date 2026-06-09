import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  Application,
  ApplyToVacancyPayload,
  EmployerApplication,
  ListApplicationsQuery,
  UpdateApplicationStatusPayload,
} from "@/interfaces/application.interface";

/**
 * Applications API service. Worker routes manage the caller's own applications;
 * employer routes list and triage applicants per owned vacancy.
 */
export const applicationsService = {
  // ─── Worker ──────────────────────────────────────────────────────────────
  async listOwn(query: ListApplicationsQuery = {}): Promise<Application[]> {
    return api.get<Application[]>(`/worker/applications${buildQuery(query)}`);
  },

  /** Apply to a vacancy (internal, or a saved external job — recorded either way). */
  async apply(
    vacancyId: string,
    payload: ApplyToVacancyPayload = {},
  ): Promise<Application> {
    return api.post<Application>(
      `/worker/vacancies/${vacancyId}/apply`,
      payload,
    );
  },

  async getOwn(id: string): Promise<Application> {
    return api.get<Application>(`/worker/applications/${id}`);
  },

  async withdraw(id: string): Promise<null> {
    return api.delete<null>(`/worker/applications/${id}`);
  },

  // ─── Employer ────────────────────────────────────────────────────────────
  async listApplicants(
    vacancyId: string,
    query: ListApplicationsQuery = {},
  ): Promise<EmployerApplication[]> {
    return api.get<EmployerApplication[]>(
      `/employer/vacancies/${vacancyId}/applications${buildQuery(query)}`,
    );
  },

  async updateStatus(
    applicationId: string,
    payload: UpdateApplicationStatusPayload,
  ): Promise<EmployerApplication> {
    return api.patch<EmployerApplication>(
      `/employer/applications/${applicationId}/status`,
      payload,
    );
  },
};
