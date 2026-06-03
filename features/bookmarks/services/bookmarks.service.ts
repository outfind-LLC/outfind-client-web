import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  Bookmark,
  ListBookmarksQuery,
} from "@/interfaces/engagement.interface";

/** Bookmarks (saved vacancies) API service for the worker side. */
export const bookmarksService = {
  async list(query: ListBookmarksQuery = {}): Promise<Bookmark[]> {
    return api.get<Bookmark[]>(`/worker/bookmarks${buildQuery(query)}`);
  },

  async remove(vacancyId: string): Promise<null> {
    return api.delete<null>(`/worker/vacancies/${vacancyId}/bookmark`);
  },
};
