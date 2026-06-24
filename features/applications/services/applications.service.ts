import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  Application,
  ApplicationMessage,
  ApplyToVacancyPayload,
  ConversationScope,
  EmployerApplication,
  ListApplicationMessagesQuery,
  ListApplicationsQuery,
  UpdateApplicationStatusPayload,
} from "@/interfaces/application.interface";
import type { CandidateProfile } from "@/interfaces/candidate-profile.interface";

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

  /** Flat list of every applicant across the employer's vacancies — powers the
   *  Candidates inbox. PROPOSED endpoint (see api-need.md §2); consumers degrade
   *  to an empty inbox if it isn't live yet. */
  async listAllApplicants(
    query: ListApplicationsQuery = {},
  ): Promise<EmployerApplication[]> {
    return api.get<EmployerApplication[]>(
      `/employer/applications${buildQuery(query)}`,
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

  /** Full candidate profile for an applicant (PROPOSED endpoint — see
   *  `CandidateProfile`). Consumers degrade gracefully if it's not yet live. */
  async getCandidateProfile(applicationId: string): Promise<CandidateProfile> {
    return api.get<CandidateProfile>(
      `/employer/applications/${applicationId}/candidate`,
    );
  },

  // ─── Conversation (both scopes share the same shape) ───────────────────────
  async listMessages(
    scope: ConversationScope,
    applicationId: string,
    query: ListApplicationMessagesQuery = {},
  ): Promise<ApplicationMessage[]> {
    return api.get<ApplicationMessage[]>(
      `/${scope}/applications/${applicationId}/messages${buildQuery(query)}`,
    );
  },

  async sendMessage(
    scope: ConversationScope,
    applicationId: string,
    content: string,
  ): Promise<ApplicationMessage> {
    return api.post<ApplicationMessage>(
      `/${scope}/applications/${applicationId}/messages`,
      { content },
    );
  },

  async markMessagesRead(
    scope: ConversationScope,
    applicationId: string,
  ): Promise<null> {
    return api.patch<null>(
      `/${scope}/applications/${applicationId}/messages/read`,
      {},
    );
  },
};
