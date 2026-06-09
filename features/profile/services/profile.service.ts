import { api } from "@/lib/api/client";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
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
  additionalProfessions?: string[];
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

export const profileService = {
  async getWorkerProfile(): Promise<WorkerProfile> {
    return api.get<WorkerProfile>("/worker/profile");
  },

  async getEmployerProfile(): Promise<EmployerProfile> {
    return api.get<EmployerProfile>("/employer/profile");
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
