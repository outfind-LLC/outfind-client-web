/**
 * Vacancy-engagement contracts — bookmarks, reactions, and comments.
 * Mirror of the backend engagement module's views. Dates are ISO strings over
 * the wire (backend `Date` → JSON string).
 */
import type { ReactionType } from "./enums";

export interface Bookmark {
  id: string;
  vacancyId: string;
  note: string | null;
  createdAt: string;
  vacancy: {
    id: string;
    title: string;
    country: string;
    city: string | null;
    employerId: string | null;
  };
}

export interface ListBookmarksQuery {
  limit?: number;
  cursor?: string;
}

/** A worker's like/dislike on a vacancy (backend `ReactionView`). */
export interface Reaction {
  vacancyId: string;
  type: ReactionType;
  updatedAt: string;
}

/** A comment on a vacancy (backend `CommentView`). `userId` identifies the
 * author so the client can offer delete on the caller's own comments. */
export interface VacancyComment {
  id: string;
  userId: string;
  vacancyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
}

export interface ListCommentsQuery {
  limit?: number;
  cursor?: string;
}

/** Body for `POST /worker/vacancies/:id/bookmark`. */
export interface BookmarkPayload {
  note?: string | null;
}
