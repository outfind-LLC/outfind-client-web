/**
 * Vacancy-engagement contracts — bookmarks (and, later, reactions/comments).
 * Mirror of the backend engagement module. Dates are ISO strings over the wire.
 */
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
