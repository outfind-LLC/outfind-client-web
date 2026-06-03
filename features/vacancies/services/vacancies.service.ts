import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  ListVacanciesQuery,
  UpdateVacancyStatusPayload,
  Vacancy,
} from "@/interfaces/vacancy.interface";

/** Employer vacancies API service (list, detail, status, delete). Creation and
 * editing happen through the Vacancy Creation AI specialist in chat. */
export const vacanciesService = {
  async listOwn(query: ListVacanciesQuery = {}): Promise<Vacancy[]> {
    return api.get<Vacancy[]>(`/employer/vacancies${buildQuery(query)}`);
  },

  async getOwn(id: string): Promise<Vacancy> {
    return api.get<Vacancy>(`/employer/vacancies/${id}`);
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
