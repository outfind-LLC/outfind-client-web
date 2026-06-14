/**
 * Candidate profile contract — the employer's read view of an applicant, joining
 * the application with the worker's profile.
 *
 * PROPOSED backend endpoint: `GET /employer/applications/:applicationId/candidate`.
 * It does not exist yet; the frontend consumes it with graceful fallback (the
 * candidate page renders from the applicant-list data until this lands). Built to
 * mirror the existing `WorkerProfileFull` projection so the backend can fill it
 * from data it already has. Contact is returned only when the candidate has
 * consented to share it — `null` otherwise, and the UI hides that section.
 */
import type { ApplicationStatus } from "./enums";
import type { MatchScoreResult } from "./worker-ai.interface";
import type {
  SalaryRange,
  WorkerEducation,
  WorkerExperience,
  WorkerLanguage,
} from "./worker-profile.interface";

export interface CandidateContact {
  email: string | null;
  phone: string | null;
  website: string | null;
}

export interface CandidateProfile {
  // Application context
  applicationId: string;
  status: ApplicationStatus;
  matchScore: number | null;
  /** Detailed match breakdown, when the backend computes one. */
  matchBreakdown: MatchScoreResult | null;
  coverLetter: string | null;
  appliedAt: string | null;
  lastMessageAt: string | null;

  // Identity
  name: string;
  profession: string | null;
  photoUrl: string | null;
  currentCountry: string | null;
  currentCity: string | null;
  summary: string | null;

  // Profile detail
  skills: string[];
  experiences: WorkerExperience[];
  education: WorkerEducation[];
  languages: WorkerLanguage[];
  expectedSalaryRange: SalaryRange | null;

  // Portfolio / documents
  videoIntroUrl: string | null;
  uploadedCvLink: string | null;

  /** Present only when the candidate has shared contact details. */
  contact: CandidateContact | null;
}
