/**
 * Application contracts — mirror of the backend application module's worker- and
 * employer-facing projections. Dates serialize to ISO strings over the wire.
 */
import type { ApplicationStatus, VacancyStatus } from "./enums";

/** Vacancy fields embedded inside a worker's application view. */
export interface ApplicationVacancyPreview {
  id: string;
  title: string;
  country: string;
  city: string | null;
  status: VacancyStatus;
  employerId: string | null;
  companyName: string | null;
}

/** Worker's view of their own application. */
export interface Application {
  id: string;
  userId: string;
  vacancyId: string;
  status: ApplicationStatus;
  sendMethod: string | null;
  coverLetterOriginal: string | null;
  sentAt: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  vacancy: ApplicationVacancyPreview;
}

/** Worker preview shown to the employer when listing applicants. */
export interface ApplicantPreview {
  userId: string;
  name: string;
  avatarUrl: string | null;
  workerProfileId: string | null;
  profession: string | null;
}

/** Employer's view of an application (with applicant + AI match score). */
export interface EmployerApplication {
  id: string;
  vacancyId: string;
  status: ApplicationStatus;
  coverLetterOriginal: string | null;
  sentAt: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicant: ApplicantPreview;
  matchScore: number | null;
}

export interface ListApplicationsQuery {
  status?: ApplicationStatus;
  limit?: number;
  cursor?: string;
}

/** Body for `PATCH /employer/applications/:id/status`. */
export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
}

/** Which side of an application conversation the caller is on. */
export type ConversationScope = "worker" | "employer";

/** Who sent an application message. */
export type ApplicationMessageSender = "WORKER" | "EMPLOYER";

/** A single message in an application conversation (backend `ApplicationMessageView`). */
export interface ApplicationMessage {
  id: string;
  applicationId: string;
  senderUserId: string;
  senderRole: ApplicationMessageSender;
  content: string;
  readByWorker: boolean;
  readByEmployer: boolean;
  createdAt: string;
}

export interface ListApplicationMessagesQuery {
  limit?: number;
  cursor?: string;
}

/** How an application is delivered to the employer. */
export type ApplicationSendMethod = "PLATFORM" | "DIRECT";

/** Body for `POST /worker/vacancies/:vacancyId/apply` (all fields optional). */
export interface ApplyToVacancyPayload {
  coverLetter?: string | null;
  coverLetterLang?: string | null;
  cvId?: string | null;
  sendMethod?: ApplicationSendMethod;
}
