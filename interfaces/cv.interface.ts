/**
 * CV contracts — mirror of the backend `cv` module. The backend stores and
 * serves DATA only; every rendering (templates, download, public page) is
 * built on the frontend from these shapes.
 */
import type { GeneratedCv } from "./worker-ai.interface";

export const CV_TEMPLATES = ["classic", "modern", "compact"] as const;
export type CvTemplateId = (typeof CV_TEMPLATES)[number];

/** Owner's view of their CV (GET /cv/mine, POST /cv/generate, PATCH /cv/mine). */
export interface CvView {
  id: string;
  title: string | null;
  template: CvTemplateId;
  isPublic: boolean;
  slug: string | null;
  showContacts: boolean;
  primaryLanguage: string;
  content: GeneratedCv;
  updatedAt: string;
}

/** Public projection (GET /cv/public/:slug) — whitelisted data only. */
export interface PublicCv extends GeneratedCv {
  template: CvTemplateId;
}

/** Body for PATCH /cv/mine. */
export interface UpdateCvPayload {
  title?: string;
  template?: CvTemplateId;
  isPublic?: boolean;
  showContacts?: boolean;
  content?: GeneratedCv;
}
