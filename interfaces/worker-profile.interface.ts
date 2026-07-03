/**
 * Worker profile contracts — mirror of the backend `WorkerProfileFull`. Enum-ish
 * fields used only for display are typed loosely; the few we render with logic
 * use the shared enum unions. Dates are ISO strings.
 */
import type {
  EducationLevel,
  EmploymentType,
  ExperienceLevel,
  WorkFormat,
  WorkerStatus,
} from "./enums";

export interface SalaryRange {
  min: number;
  max: number | null;
  currency: string;
}

export type Gender = "MALE" | "FEMALE";

/** Citizenship — flexible shape mirrored from the backend Json column. */
export interface Citizenship {
  countries?: string[];
  primaryCountry?: string | null;
}

/** Work permit — flexible shape mirrored from the backend Json column. */
export interface WorkPermit {
  countries?: string[];
  eligibleAbroad?: boolean;
  note?: string | null;
}

export interface WorkerLanguage {
  id: string;
  language: string;
  proficiency: string;
}

export interface WorkerExperience {
  id: string;
  companyName: string;
  position: string;
  domain: string;
  startDate: string;
  endDate: string | null;
  skills: string[];
  workFormat: WorkFormat;
  employmentType: EmploymentType;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerEducation {
  id: string;
  institutionName: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  skills: string[];
  educationLevel: EducationLevel | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  workerStatus: WorkerStatus;
  // ── Personal identity (résumé header) — persisted server-side ──
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  citizenship: Citizenship | null;
  workPermit: WorkPermit | null;
  // ── Contact (shown on the CV; may differ from the login email) ──
  contactPhone: string | null;
  contactEmail: string | null;
  contactTelegram: string | null;
  contactWhatsapp: string | null;
  profession: string | null;
  additionalProfessions: string[];
  experienceLevel: ExperienceLevel | null;
  experienceYears: number | null;
  currentCountry: string | null;
  currentCity: string | null;
  targetCountries: string[];
  targetCities: string[];
  skills: string[];
  hasDrivingLicense: boolean;
  drivingCategories: string[];
  photoUrl: string | null;
  videoIntroUrl: string | null;
  uploadedCvLink: string | null;
  domainExperience: string[];
  employmentTypes: EmploymentType[];
  workFormats: WorkFormat[];
  summary: string | null;
  abroadExperience: boolean;
  expectedSalaryRange: SalaryRange | null;
  completenessScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  languages: WorkerLanguage[];
  experiences: WorkerExperience[];
  education: WorkerEducation[];
}
