/**
 * Vacancy contracts — mirror of the backend vacancy module's `VacancyView`.
 * Display-only enum-ish fields (domain, source, driving categories) are typed as
 * strings here since the UI only renders them. Dates are ISO strings.
 */
import type { ExperienceLevel, VacancyStatus, VacancyType } from "./enums";

export interface DomainRequirement {
  domain: string;
  minYears: number;
}

export interface Vacancy {
  id: string;
  employerId: string | null;
  sourceType: string;

  title: string;
  type: VacancyType | null;

  country: string;
  city: string | null;
  isRemote: boolean;

  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryRaw: string | null;

  experienceRequired: ExperienceLevel | null;
  minExperienceYears: number | null;
  vacancyDomain: string | null;
  languagesRequired: string[];
  drivingRequired: string[];
  skillsRequired: string[];

  housingProvided: boolean;
  visaSponsorshipAvailable: boolean;
  relocationAssistance: boolean;

  hrEmail: string | null;
  hrPhone: string | null;
  hrWhatsapp: string | null;
  hrLinkedin: string | null;
  hrTelegram: string | null;
  applicationUrl: string | null;

  responsibilities: string[] | null;
  requirements: string[] | null;
  niceToHave: string[] | null;
  benefits: string[] | null;
  recruitmentProcess: string[] | null;
  requiredDomainExperience: DomainRequirement[] | null;

  status: VacancyStatus;
  postedAt: string | null;
  expiresAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ListVacanciesQuery {
  status?: VacancyStatus;
  limit?: number;
  cursor?: string;
}

/** Full vacancy detail as seen by a worker (`GET /vacancies/:id`). */
export interface PublicVacancy extends Vacancy {
  companyName: string | null;
  /** AI-written role summary shown as the "About this role" blurb. */
  description: string | null;
}

/** A vacancy recommended to a worker (`GET /worker/recommendations`). */
export interface RecommendedVacancy {
  id: string;
  title: string;
  country: string;
  city: string | null;
  status: VacancyStatus;
  employerId: string | null;
  companyName: string | null;
  matchScore: number | null;
  isBestMatch: boolean;
  postedAt: string | null;
}

/** Body for `PATCH /employer/vacancies/:id/status`. */
export interface UpdateVacancyStatusPayload {
  status: VacancyStatus;
}

/**
 * Body for `POST /employer/vacancies`. Only `title` + `country` are required;
 * everything else is optional and mirrors the backend create schema.
 */
export interface CreateVacancyPayload {
  title: string;
  type?: VacancyType | null;
  country: string;
  city?: string | null;
  isRemote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  salaryRaw?: string | null;
  experienceRequired?: ExperienceLevel | null;
  minExperienceYears?: number | null;
  vacancyDomain?: string | null;
  languagesRequired?: string[];
  drivingRequired?: string[];
  skillsRequired?: string[];
  housingProvided?: boolean;
  visaSponsorshipAvailable?: boolean;
  relocationAssistance?: boolean;
  hrEmail?: string | null;
  hrPhone?: string | null;
  hrWhatsapp?: string | null;
  hrLinkedin?: string | null;
  hrTelegram?: string | null;
  applicationUrl?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  niceToHave?: string[] | null;
  benefits?: string[] | null;
  recruitmentProcess?: string[] | null;
  requiredDomainExperience?: DomainRequirement[] | null;
  expiresAt?: string | null;
}

/** Body for `PATCH /employer/vacancies/:id` — any subset of the create fields. */
export type UpdateVacancyPayload = Partial<CreateVacancyPayload>;
