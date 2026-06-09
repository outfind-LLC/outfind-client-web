import type { SelectOption } from "@/components/form/form-fields";
import {
  DOMAIN_LABELS,
  DRIVING_CATEGORY_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/features/profile/constants/worker-profile.constants";

/** Vacancy employment types (distinct from worker EMPLOYMENT_TYPE — has SEASONAL). */
export const VACANCY_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  SEASONAL: "Seasonal",
  INTERNSHIP: "Internship",
};

function toOptions(labels: Record<string, string>): SelectOption[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export const VACANCY_TYPE_OPTIONS = toOptions(VACANCY_TYPE_LABELS);
export const VACANCY_EXPERIENCE_OPTIONS = toOptions(EXPERIENCE_LEVEL_LABELS);
export const VACANCY_DOMAIN_OPTIONS = toOptions(DOMAIN_LABELS);
export const DRIVING_CATEGORY_OPTIONS = toOptions(DRIVING_CATEGORY_LABELS);
