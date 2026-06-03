/**
 * Employer profile contracts — mirror of the backend `EmployerProfileView`.
 * Dates are ISO strings over the wire.
 */
import type { EmployerVerificationStatus } from "./enums";

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  companyUrl: string;
  companyLogoUrl: string | null;
  companySize: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  corporateEmail: string;
  phone: string | null;
  website: string | null;
  verificationStatus: EmployerVerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  verificationDocs: string[];
  moderationStatus: string;
  trustScore: number;
  totalVacanciesPosted: number;
  totalApplications: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
