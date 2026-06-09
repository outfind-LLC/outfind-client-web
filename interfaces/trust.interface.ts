/**
 * Employer-trust contracts — reporting an employer and submitting a
 * post-interaction behaviour signal.
 */

/** Body for `POST /employers/report`. */
export interface ReportEmployerPayload {
  employerId: string;
  reason: string;
  details?: string | null;
}

/** Behaviour signal a worker can leave after interacting with an employer. */
export type EmployerSignalType = "SAFE" | "SUSPICIOUS" | "SCAM";

/** Body for `POST /employers/{employerId}/signal`. */
export interface EmployerSignalPayload {
  type: EmployerSignalType;
  note?: string | null;
}
