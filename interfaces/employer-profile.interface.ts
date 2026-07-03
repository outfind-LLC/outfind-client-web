/**
 * Employer profile contracts — mirror of the backend `EmployerProfileView`.
 * Dates are ISO strings over the wire.
 */
import type { EmployerVerificationStatus } from "./enums";

/** An extra company site (office / branch), separate from the HQ on the profile. */
export interface CompanyLocationItem {
  id: string;
  city: string;
  address: string;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  companyUrl: string;
  companyLogoUrl: string | null;
  tagline: string | null;
  companySize: string | null;
  industry: string | null;
  foundedYear: number | null;
  taxId: string | null;
  country: string | null;
  city: string | null;
  registeredAddress: string | null;
  description: string | null;
  corporateEmail: string;
  contactName: string | null;
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
  locations: CompanyLocationItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Body for `POST /employer/profile`. `companyName`, `companyUrl`, and
 * `corporateEmail` are required; the rest are optional.
 */
export interface CreateEmployerProfilePayload {
  companyName: string;
  companyUrl: string;
  corporateEmail: string;
  companyLogoUrl?: string | null;
  tagline?: string | null;
  companySize?: string | null;
  industry?: string | null;
  foundedYear?: number | null;
  taxId?: string | null;
  country?: string | null;
  city?: string | null;
  registeredAddress?: string | null;
  description?: string | null;
  contactName?: string | null;
  phone?: string | null;
  website?: string | null;
  verificationDocs?: string[];
}

/**
 * Body for `PATCH /employer/profile` — any subset of the create fields except
 * `corporateEmail`, which is fixed once the profile exists.
 */
export type UpdateEmployerProfilePayload = Partial<
  Omit<CreateEmployerProfilePayload, "corporateEmail">
>;
