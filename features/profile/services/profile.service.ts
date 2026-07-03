import { api } from "@/lib/api/client";
import type {
  CompanyLocationItem,
  CreateEmployerProfilePayload,
  EmployerProfile,
  UpdateEmployerProfilePayload,
} from "@/interfaces/employer-profile.interface";
import type {
  WorkerProfile,
  WorkerLanguage,
  WorkerExperience,
  WorkerEducation,
} from "@/interfaces/worker-profile.interface";

export type UpdateJobSearchInfoInput = {
  profession: string;
  targetCountries: string[];
  experienceYears: number;
  abroadExperience: boolean;
  skills: string[];
  expectedSalaryMin: number;
};

export type UpdateProfileInfoInput = {
  // ── Identity (résumé header) ──
  firstName?: string | null;
  lastName?: string | null;
  gender?: "MALE" | "FEMALE" | null;
  dateOfBirth?: string | null;
  citizenship?: { countries?: string[]; primaryCountry?: string | null } | null;
  workPermit?: {
    countries?: string[];
    eligibleAbroad?: boolean;
    note?: string | null;
  } | null;
  // ── Contact (shown on the CV) ──
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactTelegram?: string | null;
  contactWhatsapp?: string | null;
  // ── Professional roles + skills ──
  profession?: string | null;
  additionalProfessions?: string[];
  skills?: string[];
  currentCountry?: string | null;
  currentCity?: string | null;
  targetCities?: string[];
  hasDrivingLicense?: boolean;
  drivingCategories?: string[];
  domainExperience?: string[];
  employmentTypes?: string[];
  workFormats?: string[];
  summary?: string | null;
  workerStatus?: "ACTIVE" | "PASSIVE" | "OFFLINE";
  uploadedCvLink?: string | null;
  videoIntroUrl?: string | null;
};

export type ExperienceEntryInput = {
  companyName: string;
  position: string;
  domain: string;
  startDate: string;
  endDate: string | null;
  skills?: string[];
  workFormat: string;
  employmentType: string;
  description?: string | null;
};

export type EducationEntryInput = {
  institutionName?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate: string | null;
  description?: string | null;
  skills?: string[];
  educationLevel?: string | null;
};

export type LanguageInput = {
  language: string;
  proficiency: string;
};

/**
 * Result of `POST /employer/profile/parse` — a spoken/typed company description
 * mapped to onboarding-form fields. Every field is null except what was stated.
 */
export type ParsedCompanyProfile = {
  companyName: string | null;
  tagline: string | null;
  industry: string | null;
  companySize: string | null;
  foundedYear: number | null;
  taxId: string | null;
  country: string | null;
  city: string | null;
  registeredAddress: string | null;
  contactName: string | null;
  corporateEmail: string | null;
  phone: string | null;
  website: string | null;
  /** Editable "about the company" paragraph. */
  description: string | null;
};

export const profileService = {
  async getWorkerProfile(): Promise<WorkerProfile> {
    return api.get<WorkerProfile>("/worker/profile");
  },

  async getEmployerProfile(): Promise<EmployerProfile> {
    return api.get<EmployerProfile>("/employer/profile");
  },

  async createEmployerProfile(
    payload: CreateEmployerProfilePayload,
  ): Promise<EmployerProfile> {
    return api.post<EmployerProfile>("/employer/profile", payload);
  },

  async updateEmployerProfile(
    payload: UpdateEmployerProfilePayload,
  ): Promise<EmployerProfile> {
    return api.patch<EmployerProfile>("/employer/profile", payload);
  },

  async setEmployerProfileActive(isActive: boolean): Promise<EmployerProfile> {
    return api.patch<EmployerProfile>("/employer/profile/active", { isActive });
  },

  /**
   * Map a spoken/typed company description into onboarding-form fields for
   * autofill. Persists nothing — the employer reviews/edits, then saves.
   */
  async parseCompanyProfile(text: string): Promise<ParsedCompanyProfile> {
    return api.post<ParsedCompanyProfile>("/employer/profile/parse", { text });
  },

  async deleteEmployerProfile(): Promise<null> {
    return api.delete<null>("/employer/profile");
  },

  // ─── Company locations (extra sites, separate from HQ) ─────────────────────
  async createCompanyLocation(dto: {
    city: string;
    address: string;
  }): Promise<CompanyLocationItem> {
    return api.post<CompanyLocationItem>("/employer/profile/locations", dto);
  },

  async updateCompanyLocation(
    id: string,
    dto: { city?: string; address?: string },
  ): Promise<CompanyLocationItem> {
    return api.patch<CompanyLocationItem>(
      `/employer/profile/locations/${id}`,
      dto,
    );
  },

  async deleteCompanyLocation(id: string): Promise<null> {
    return api.delete<null>(`/employer/profile/locations/${id}`);
  },

  async updateJobSearchInfo(
    dto: UpdateJobSearchInfoInput,
  ): Promise<WorkerProfile> {
    return api.patch<WorkerProfile>("/worker/profile/job-search", dto);
  },

  async updateProfileInfo(dto: UpdateProfileInfoInput): Promise<WorkerProfile> {
    return api.patch<WorkerProfile>("/worker/profile", dto);
  },

  async upsertLanguages(languages: LanguageInput[]): Promise<WorkerLanguage[]> {
    return api.post<WorkerLanguage[]>("/worker/profile/languages", {
      languages,
    });
  },

  async deleteLanguages(ids: string[]): Promise<void> {
    return api.delete<void>("/worker/profile/languages", { body: { ids } });
  },

  async createExperiences(
    experiences: ExperienceEntryInput[],
  ): Promise<WorkerExperience[]> {
    return api.post<WorkerExperience[]>("/worker/profile/experiences", {
      experiences,
    });
  },

  async updateExperience(
    id: string,
    dto: Partial<ExperienceEntryInput>,
  ): Promise<WorkerExperience> {
    return api.patch<WorkerExperience>(
      `/worker/profile/experiences/${id}`,
      dto,
    );
  },

  async deleteExperiences(ids: string[]): Promise<void> {
    return api.delete<void>("/worker/profile/experiences", { body: { ids } });
  },

  async createEducation(
    education: EducationEntryInput[],
  ): Promise<WorkerEducation[]> {
    return api.post<WorkerEducation[]>("/worker/profile/education", {
      education,
    });
  },

  async updateEducation(
    id: string,
    dto: Partial<EducationEntryInput>,
  ): Promise<WorkerEducation> {
    return api.patch<WorkerEducation>(`/worker/profile/education/${id}`, dto);
  },

  async deleteEducation(ids: string[]): Promise<void> {
    return api.delete<void>("/worker/profile/education", { body: { ids } });
  },
};
