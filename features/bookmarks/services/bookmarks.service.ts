import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type {
  Bookmark,
  BookmarkPayload,
  ListBookmarksQuery,
  SaveExternalJobPayload,
} from "@/interfaces/engagement.interface";

/** Bookmarks (saved vacancies) API service for the worker side. */
export const bookmarksService = {
  async list(query: ListBookmarksQuery = {}): Promise<Bookmark[]> {
    return api.get<Bookmark[]>(`/worker/bookmarks${buildQuery(query)}`);
  },

  /** Save a live-web job (no vacancy id yet): persist + bookmark it. */
  async saveExternal(payload: SaveExternalJobPayload): Promise<Bookmark> {
    return api.post<Bookmark>("/worker/jobs/save-external", payload);
  },

  /** Add or update the bookmark for a vacancy (idempotent server-side). */
  async add(
    vacancyId: string,
    payload: BookmarkPayload = {},
  ): Promise<Bookmark> {
    return api.post<Bookmark>(
      `/worker/vacancies/${vacancyId}/bookmark`,
      payload,
    );
  },

  async remove(vacancyId: string): Promise<null> {
    return api.delete<null>(`/worker/vacancies/${vacancyId}/bookmark`);
  },
};
