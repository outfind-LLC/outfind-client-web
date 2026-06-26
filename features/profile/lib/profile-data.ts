/**
 * Pure helpers that shape the real `WorkerProfile` into the prototype's profile
 * sections (résumé facts, grouped work history, contact tiles, search settings,
 * driving summary). Fields the backend doesn't have yet (DOB, phone, WhatsApp,
 * per-category driving record) are gracefully omitted — see docs/api/profile.md.
 */
import {
  EMPLOYMENT_TYPE,
  WORK_FORMAT,
  type EmploymentType,
  type WorkFormat,
} from "@/interfaces/enums";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { SessionUser } from "@/interfaces/auth.interface";
import type { Resume } from "@/features/profile/types/resume";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";

const EMP_KEY: Record<EmploymentType, MessageKey> = {
  [EMPLOYMENT_TYPE.FULL_TIME]: "profile.empFullTime",
  [EMPLOYMENT_TYPE.PART_TIME]: "profile.empPartTime",
  [EMPLOYMENT_TYPE.CONTRACT]: "profile.empContract",
  [EMPLOYMENT_TYPE.FREELANCE]: "profile.empFreelance",
  [EMPLOYMENT_TYPE.INTERNSHIP]: "profile.empInternship",
};
const WORK_KEY: Record<WorkFormat, MessageKey> = {
  [WORK_FORMAT.ONSITE]: "profile.workOnsite",
  [WORK_FORMAT.REMOTE]: "profile.workRemote",
  [WORK_FORMAT.HYBRID]: "profile.workHybrid",
};

export function employmentLabel(profile: WorkerProfile, t: TranslateFn): string | null {
  const e = profile.employmentTypes[0];
  const w = profile.workFormats[0];
  return (
    [e ? t(EMP_KEY[e]) : null, w ? t(WORK_KEY[w]) : null].filter(Boolean).join(" · ") || null
  );
}

export function salaryLabel(profile: WorkerProfile, t: TranslateFn, locale: string): string | null {
  if (!profile.expectedSalaryRange) return null;
  const { min, currency } = profile.expectedSalaryRange;
  return t("profile.salaryFromMonth", { amount: `${min.toLocaleString(locale)} ${currency}` });
}

/** Derives the single résumé the overview shows (mock seam for `/resumes`). */
export function deriveResume(profile: WorkerProfile, t: TranslateFn, locale: string): Resume | null {
  if (!profile.profession && profile.experiences.length === 0) return null;
  return {
    id: profile.id,
    title: profile.profession ?? t("profile.myResumes"),
    specialization: profile.profession ?? null,
    salary: salaryLabel(profile, t, locale),
    employment: employmentLabel(profile, t),
    location: [profile.currentCity, profile.currentCountry].filter(Boolean).join(", ") || null,
    experience: profile.experienceYears != null ? t("profile.yearsOfExp", { n: profile.experienceYears }) : null,
    isVisibleInSearch: profile.isActive,
    updatedAt: profile.updatedAt,
  };
}

function monthYear(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}
function yearsOf(start: string, end: string | null): number {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return Math.max(1, Math.round(months / 12));
}

export interface WorkRole {
  id: string;
  role: string;
  dates: string;
  bullets: string[];
}
export interface CompanyGroup {
  company: string;
  years: number;
  roles: WorkRole[];
}

/** Groups experiences by company (preserving the API's newest-first order). */
export function groupExperiences(
  profile: WorkerProfile,
  t: TranslateFn,
  locale: string,
): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  for (const exp of profile.experiences) {
    const yrs = yearsOf(exp.startDate, exp.endDate);
    const dates = `${monthYear(exp.startDate, locale)} — ${
      exp.endDate ? monthYear(exp.endDate, locale) : t("profile.present")
    } · ${yrs} ${t("profile.yrsShort")}`;
    const role: WorkRole = {
      id: exp.id,
      role: exp.position,
      dates,
      bullets: exp.description ? exp.description.split(/\n+/).map((b) => b.trim()).filter(Boolean) : [],
    };
    const last = groups[groups.length - 1];
    if (last && last.company === exp.companyName) {
      last.roles.push(role);
      last.years += yrs;
    } else {
      groups.push({ company: exp.companyName, years: yrs, roles: [role] });
    }
  }
  return groups;
}

export interface EduItem {
  id: string;
  org: string;
  field: string | null;
  meta: string | null;
}
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export function educationItems(profile: WorkerProfile): EduItem[] {
  return profile.education.map((ed) => {
    const yearSrc = ed.endDate ?? ed.startDate;
    const year = yearSrc ? new Date(yearSrc).getFullYear() : null;
    const level = ed.educationLevel ? titleCase(ed.educationLevel) : null;
    const meta = [year ? String(year) : null, level].filter(Boolean).join(" · ") || null;
    return {
      id: ed.id,
      org: ed.institutionName ?? ed.degree ?? "",
      field: ed.fieldOfStudy,
      meta,
    };
  });
}

export function languageLevel(proficiency: string, t: TranslateFn): string {
  switch (proficiency) {
    case "NATIVE":
      return t("profile.native");
    case "PROFESSIONAL":
      return t("profile.langProfessional");
    case "CONVERSATIONAL":
      return t("profile.langConversational");
    case "BASIC":
      return t("profile.langBasic");
    default:
      return proficiency;
  }
}

export interface SearchSettings {
  live: string | null;
  search: string | null;
}
export function searchSettings(profile: WorkerProfile, t: TranslateFn): SearchSettings {
  const live = profile.currentCity ? `${profile.currentCity} · ${t("profile.areaNot")}` : null;
  let search: string | null = null;
  if (profile.targetCities.length > 0) search = profile.targetCities.join(", ");
  else if (profile.currentCity) search = `${profile.currentCity}, ${t("profile.allAreas")}`;
  else if (profile.targetCountries.length > 0) search = profile.targetCountries.join(", ");
  return { live, search };
}

function categoryLabel(cat: string): string {
  return cat === "CE" ? "C+E" : cat;
}
/** "Categories B, C, C+E" — clean-record + per-category years are a NEW backend field. */
export function drivingSummary(profile: WorkerProfile, t: TranslateFn): string | null {
  if (!profile.hasDrivingLicense && profile.drivingCategories.length === 0) return null;
  if (profile.drivingCategories.length === 0) return null;
  return `${t("profile.categoriesLabel")} ${profile.drivingCategories.map(categoryLabel).join(", ")}`;
}

export interface ContactTile {
  key: "phone" | "email" | "telegram" | "whatsapp";
  label: MessageKey;
  value: string;
  brand?: "telegram" | "whatsapp";
}
/** The contact tiles we can fill from the session (phone/WhatsApp are NEW — shown
 *  as the empty "add" tile until `MeUser.phoneNumber` / WhatsApp ship). */
export function contactTiles(user: SessionUser): { filled: ContactTile[]; empty: ContactTile["key"][] } {
  const filled: ContactTile[] = [];
  if (user.email) filled.push({ key: "email", label: "profile.email", value: user.email });
  if (user.telegramUsername)
    filled.push({ key: "telegram", label: "profile.telegram", value: `@${user.telegramUsername}`, brand: "telegram" });
  return { filled, empty: ["whatsapp"] };
}
