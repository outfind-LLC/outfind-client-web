/**
 * Company profile option sets — the ONE source for the industry categories and
 * size buckets offered at company creation (setup modal) AND in the company
 * page's edit modals, so the two surfaces can never drift apart. The stored
 * value is the localized label (matches what creation has always saved).
 */
import type { MessageKey } from "@/lib/i18n/translate";

export const COMPANY_INDUSTRY_KEYS: readonly MessageKey[] = [
  "employerVerify.indLogistics",
  "employerVerify.indManufacturing",
  "employerVerify.indRetail",
  "employerVerify.indConstruction",
  "employerVerify.indHospitality",
  "employerVerify.indIT",
  "employerVerify.indHealthcare",
  "employerVerify.indAgriculture",
  "employerVerify.indOther",
];

export const COMPANY_SIZE_KEYS: readonly MessageKey[] = [
  "employerVerify.size1",
  "employerVerify.size2",
  "employerVerify.size3",
  "employerVerify.size4",
  "employerVerify.size5",
];
