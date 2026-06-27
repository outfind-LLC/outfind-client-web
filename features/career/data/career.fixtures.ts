/**
 * Career & migration / Global hiring — **mock fixtures**.
 *
 * These power the pixel-perfect screens today. They are NOT fabricated user data:
 * every record is a typed placeholder mirroring the prototype's seed, ready to be
 * swapped for a real service call once the backend ships the endpoints documented
 * in `docs/api/career-and-global-hiring.md`. Localized text lives in the i18n
 * `career.*` namespace; these consts hold only the non-localized shape (ids,
 * brand colours, scores) plus the MessageKeys to render.
 */
import type { MessageKey } from "@/lib/i18n/translate";

export type CountryId = "UK" | "DE" | "KZ" | "US";
export type StepId = "cv" | "lang" | "docs" | "cert" | "apply" | "interview";
export type StepAction = "openCv" | "docs" | "cert" | "apply";
export type CareerIconName =
  | "menu"
  | "check"
  | "arrow"
  | "cv"
  | "doc"
  | "badge"
  | "spark";

/** Matched destination country (score = migration compatibility 0–100). */
export interface CareerCountry {
  id: CountryId;
  color: string;
  score: number;
  demand: "high" | "med";
}

/** A roadmap step definition (state lives in the localStorage seam). */
export interface RoadmapStep {
  id: StepId;
  /** Action button glyph + behaviour; null = no action button. */
  act: StepAction | null;
}

/** A recommended role abroad. */
export interface CareerRec {
  id: string;
  roleKey: MessageKey;
  company: string;
  country: CountryId;
  color: string;
  match: number;
  tagKey: MessageKey;
}

/** An international talent market (employer Global hiring). */
export interface HiringMarket {
  id: CountryId;
  color: string;
  score: number;
  supply: "high" | "med";
  /** Candidates open to international work. */
  count: number;
}

/** A migration-ready candidate (employer Global hiring). */
export interface MigrationCandidate {
  id: string;
  name: string;
  role: string;
  country: CountryId;
  color: string;
  score: number;
}

/* ---------------- worker data ---------------- */
export const CAREER_COUNTRIES: CareerCountry[] = [
  { id: "UK", color: "#3158f6", score: 92, demand: "high" },
  { id: "DE", color: "#0f0f10", score: 88, demand: "high" },
  { id: "KZ", color: "#22a06b", score: 84, demand: "med" },
  { id: "US", color: "#e0532e", score: 76, demand: "med" },
];

export const ROADMAP_STEPS: RoadmapStep[] = [
  { id: "cv", act: "openCv" },
  { id: "lang", act: null },
  { id: "docs", act: "docs" },
  { id: "cert", act: "cert" },
  { id: "apply", act: "apply" },
  { id: "interview", act: null },
];

export const CAREER_RECS: CareerRec[] = [
  { id: "r1", roleKey: "career.recR1Role", company: "Nuvora Logistics", country: "UK", color: "#3158f6", match: 94, tagKey: "career.recR1Tag" },
  { id: "r2", roleKey: "career.recR2Role", company: "BrightPath Foods", country: "DE", color: "#22a06b", match: 89, tagKey: "career.recR2Tag" },
  { id: "r3", roleKey: "career.recR3Role", company: "Almaty Freight Co.", country: "KZ", color: "#e0532e", match: 86, tagKey: "career.recR3Tag" },
];

/* ---------------- employer data ---------------- */
export const HIRING_MARKETS: HiringMarket[] = [
  { id: "UK", color: "#3158f6", score: 94, supply: "high", count: 1280 },
  { id: "DE", color: "#0f0f10", score: 90, supply: "high", count: 960 },
  { id: "KZ", color: "#22a06b", score: 85, supply: "med", count: 540 },
  { id: "US", color: "#e0532e", score: 79, supply: "med", count: 610 },
];

export const MIGRATION_CANDIDATES: MigrationCandidate[] = [
  { id: "g1", name: "Marcus Webb", role: "HGV Driver", country: "UK", color: "#3158f6", score: 95 },
  { id: "g2", name: "Dilnoza Karimova", role: "Warehouse Operative", country: "DE", color: "#22a06b", score: 91 },
  { id: "g3", name: "Otabek Yusupov", role: "Forklift Driver", country: "KZ", color: "#e0532e", score: 88 },
];

/* ---------------- localized key maps (typed, no loose casts) ---------------- */
export const COUNTRY_NAME: Record<CountryId, MessageKey> = {
  UK: "career.countryUK",
  DE: "career.countryDE",
  KZ: "career.countryKZ",
  US: "career.countryUS",
};
export const COUNTRY_REASON: Record<CountryId, MessageKey> = {
  UK: "career.reasonUK",
  DE: "career.reasonDE",
  KZ: "career.reasonKZ",
  US: "career.reasonUS",
};
export const COUNTRY_CHIPS: Record<CountryId, MessageKey[]> = {
  UK: ["career.chipUK1", "career.chipUK2", "career.chipUK3"],
  DE: ["career.chipDE1", "career.chipDE2", "career.chipDE3"],
  KZ: ["career.chipKZ1", "career.chipKZ2", "career.chipKZ3"],
  US: ["career.chipUS1", "career.chipUS2", "career.chipUS3"],
};
export const COUNTRY_LANG: Record<CountryId, MessageKey> = {
  UK: "career.langUK",
  DE: "career.langDE",
  KZ: "career.langKZ",
  US: "career.langUS",
};
export const COUNTRY_LEVEL: Record<CountryId, MessageKey> = {
  UK: "career.levelUK",
  DE: "career.levelDE",
  KZ: "career.levelKZ",
  US: "career.levelUS",
};

export const STEP_TITLE: Record<StepId, MessageKey> = {
  cv: "career.stepCvT",
  lang: "career.stepLangT",
  docs: "career.stepDocsT",
  cert: "career.stepCertT",
  apply: "career.stepApplyT",
  interview: "career.stepInterviewT",
};
export const STEP_DESC: Record<StepId, MessageKey> = {
  cv: "career.stepCvD",
  lang: "career.stepLangD",
  docs: "career.stepDocsD",
  cert: "career.stepCertD",
  apply: "career.stepApplyD",
  interview: "career.stepInterviewD",
};
export const STEP_ACTION_LABEL: Partial<Record<StepId, MessageKey>> = {
  cv: "career.stepCvA",
  docs: "career.stepDocsA",
  cert: "career.stepCertA",
  apply: "career.stepApplyA",
};
/** Action → glyph + "coming soon" toast key (openCv navigates instead). */
export const ACTION_ICON: Record<StepAction, CareerIconName> = {
  openCv: "cv",
  docs: "doc",
  cert: "badge",
  apply: "spark",
};
export const ACTION_TOAST: Record<Exclude<StepAction, "openCv">, MessageKey> = {
  docs: "career.toastDocs",
  cert: "career.toastCert",
  apply: "career.toastApply",
};
export const DEMAND_LABEL: Record<"high" | "med", MessageKey> = {
  high: "career.demandHigh",
  med: "career.demandMed",
};
export const SUPPLY_LABEL: Record<"high" | "med", MessageKey> = {
  high: "career.supplyHigh",
  med: "career.supplyMed",
};
