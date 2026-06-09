import { api } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import type { ReactionType } from "@/interfaces/enums";
import type {
  ListCommentsQuery,
  Reaction,
  VacancyComment,
} from "@/interfaces/engagement.interface";

/**
 * Worker vacancy-engagement service: reactions (like/dislike) and comments.
 * Bookmarks live in the bookmarks feature and applies in the applications
 * feature; this covers the remaining engagement surface.
 */
export const engagementService = {
  // ─── Reactions ─────────────────────────────────────────────────────────────
  async setReaction(vacancyId: string, type: ReactionType): Promise<Reaction> {
    return api.put<Reaction>(`/worker/vacancies/${vacancyId}/reaction`, {
      type,
    });
  },

  async clearReaction(vacancyId: string): Promise<null> {
    return api.delete<null>(`/worker/vacancies/${vacancyId}/reaction`);
  },

  // ─── Comments ────────────────────────────────────────────────────────────────
  /** Public to any authenticated active user. */
  async listComments(
    vacancyId: string,
    query: ListCommentsQuery = {},
  ): Promise<VacancyComment[]> {
    return api.get<VacancyComment[]>(
      `/vacancies/${vacancyId}/comments${buildQuery(query)}`,
    );
  },

  async createComment(
    vacancyId: string,
    content: string,
  ): Promise<VacancyComment> {
    return api.post<VacancyComment>(
      `/worker/vacancies/${vacancyId}/comments`,
      { content },
    );
  },

  async deleteComment(commentId: string): Promise<null> {
    return api.delete<null>(`/worker/comments/${commentId}`);
  },
};
