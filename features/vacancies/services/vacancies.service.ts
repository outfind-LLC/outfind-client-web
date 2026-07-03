import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  CreateVacancyPayload,
  ListVacanciesQuery,
  PublicVacancy,
  UpdateVacancyPayload,
  UpdateVacancyStatusPayload,
  Vacancy,
} from "@/interfaces/vacancy.interface";

/**
 * Result of `POST /employer/vacancies/parse` — a spoken/typed job brief mapped
 * to create-vacancy wizard fields. All nullable (only stated fields populated).
 * The full response mirrors the create schema; these are the fields the wizard
 * prefills directly (enum/option fields are completed by the employer).
 */
export type ParsedVacancy = {
  title: string | null;
  profession: string | null;
  category: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  paymentNote: string | null;
  teamSize: number | null;
  skillsRequired: string[] | null;
  description: string | null;
};

/**
 * Body of `POST /employer/vacancies/generate-description` — the structured
 * facts the wizard has collected, as plain human-readable labels. The AI writes
 * the description from these; the employer reviews and edits before saving.
 */
export type GenerateDescriptionInput = {
  title: string;
  kind?: "REGULAR" | "DAILY";
  profession?: string | null;
  category?: string | null;
  country?: string | null;
  city?: string | null;
  workFormat?: string | null;
  workArrangement?: string | null;
  workSchedule?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  education?: string | null;
  teamSize?: number | null;
  probationMonths?: number | null;
  paymentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  paymentFrequency?: string | null;
  skills?: string[];
  languages?: { language: string; level: string }[];
  benefits?: string[];
  workDate?: string | null;
  shiftHours?: string | null;
};

/** Employer vacancies API service: full CRUD plus status lifecycle. */
export const vacanciesService = {
  async listOwn(query: ListVacanciesQuery = {}): Promise<Vacancy[]> {
    return api.get<Vacancy[]>(`/employer/vacancies${buildQuery(query)}`);
  },

  /** Public detail of one vacancy — used when a worker opens a recommendation. */
  async getPublic(id: string): Promise<PublicVacancy> {
    return api.get<PublicVacancy>(`/vacancies/${id}`);
  },

  async getOwn(id: string): Promise<Vacancy> {
    return api.get<Vacancy>(`/employer/vacancies/${id}`);
  },

  async create(payload: CreateVacancyPayload): Promise<Vacancy> {
    return api.post<Vacancy>("/employer/vacancies", payload);
  },

  /**
   * Map a spoken/typed job brief into create-vacancy wizard fields for autofill.
   * Persists nothing — the employer reviews/completes the wizard, then saves.
   */
  async parseVacancy(text: string): Promise<ParsedVacancy> {
    return api.post<ParsedVacancy>("/employer/vacancies/parse", { text });
  },

  /**
   * Generate the vacancy description with AI from the wizard's structured
   * facts. Returns editable text; persists nothing.
   */
  async generateDescription(
    input: GenerateDescriptionInput,
  ): Promise<{ description: string }> {
    return api.post<{ description: string }>(
      "/employer/vacancies/generate-description",
      input,
    );
  },

  async update(id: string, payload: UpdateVacancyPayload): Promise<Vacancy> {
    return api.patch<Vacancy>(`/employer/vacancies/${id}`, payload);
  },

  async updateStatus(
    id: string,
    payload: UpdateVacancyStatusPayload,
  ): Promise<Vacancy> {
    return api.patch<Vacancy>(`/employer/vacancies/${id}/status`, payload);
  },

  async remove(id: string): Promise<null> {
    return api.delete<null>(`/employer/vacancies/${id}`);
  },
};
