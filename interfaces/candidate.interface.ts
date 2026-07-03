/**
 * Employer candidate directory contracts — mirror of the backend
 * `CandidateCardView` (`GET /employer/shortlist`, `findCandidates` chat tool).
 * `id` is the worker's PROFILE id — the identity shortlist entries key on.
 */
import type { WorkerStatus } from "./enums";

export interface ShortlistCandidate {
  id: string;
  name: string;
  title: string | null;
  location: string | null;
  /** Expected salary, pre-formatted by the backend. */
  salary: string | null;
  skills: string[];
  years: number | null;
  /** Raw worker status (ACTIVE / PASSIVE / OFFLINE) — map to a label in the UI. */
  availability: WorkerStatus;
  verified: boolean;
  matchScore: number | null;
}
