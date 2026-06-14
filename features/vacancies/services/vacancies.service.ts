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
