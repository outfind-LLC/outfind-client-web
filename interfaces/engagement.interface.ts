/**
 * Vacancy-engagement contracts — bookmarks, reactions, and comments.
 * Mirror of the backend engagement module's views. Dates are ISO strings over
 * the wire (backend `Date` → JSON string).
 */
import type { ReactionType, VacancyType } from "./enums";

/** Vacancy fields shown on a saved-job card (title, company, salary, tags). */
export interface BookmarkVacancyPreview {
  id: string;
  title: string;
  country: string;
  city: string | null;
  employerId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryRaw: string | null;
  type: VacancyType | null;
  isRemote: boolean;
  // Source + apply so a saved sourced job renders like its search result.
  isPlatform: boolean;
  applyUrl: string | null;
  source: string | null;
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  contact: {
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    telegram: string | null;
    website: string | null;
    contactForm: string | null;
  };
}

export interface Bookmark {
  id: string;
  vacancyId: string;
  note: string | null;
  createdAt: string;
  vacancy: BookmarkVacancyPreview;
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

/** Body for `POST /worker/jobs/save-external` — a live-web job to persist + save. */
export interface SaveExternalJobPayload {
  title: string;
  company?: string | null;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  applyUrl?: string | null;
  source?: string | null;
  salary?: string | null;
  jobType?: string | null;
  isRemote?: boolean;
  description?: string | null;
  skills?: string[];
  responsibilities?: string[];
  requirements?: string[];
  contact?: {
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
    website?: string | null;
    contactForm?: string | null;
  };
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
