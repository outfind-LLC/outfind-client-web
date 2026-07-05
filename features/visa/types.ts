/** Visa-guide types — mirror the backend worker view models (`worker/visa/*`). */

export type VisaRegion =
  | "EUROPE"
  | "MIDDLE_EAST"
  | "ASIA"
  | "OCEANIA"
  | "AMERICAS";

export type VisaAccess = "FREE" | "PREMIUM";

export type VisaDocTag =
  | "REQUIRED"
  | "ONSITE"
  | "IMPORTANT_2026"
  | "RECOMMENDED"
  | "PAYABLE";

export type VisaDataStatus = "VERIFIED" | "NEEDS_CHECK";

export interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
}

export interface VisaCitizenship {
  id: string;
  code: string;
  slug: string;
  flag: string;
  name: LocalizedText;
}

export interface VisaProfession {
  id: string;
  slug: string;
  icon: string;
  name: LocalizedText;
}

export interface VisaDestinationSummary {
  id: string;
  code: string;
  slug: string;
  flag: string;
  name: LocalizedText;
  region: VisaRegion;
  salaryFromEur: number | null;
  schengen: boolean;
}

export interface VisaBootstrap {
  citizenships: VisaCitizenship[];
  destinations: VisaDestinationSummary[];
  professions: VisaProfession[];
  disclaimer: LocalizedText;
}

export interface VisaDestinationDetail extends VisaDestinationSummary {
  visaType: LocalizedText | null;
  visaCode: string | null;
  visaFee: string | null;
  visaFeeNote: LocalizedText | null;
  visaProcessing: LocalizedText | null;
  docsTotal: number;
  applyChannel: string | null;
  applyCenterName: LocalizedText | null;
  applyCity: string | null;
  applyAddress: string | null;
  applyPhone: string | null;
  applyWebsite: string | null;
  applyNote: LocalizedText | null;
  officialSourceName: LocalizedText | null;
  officialSourceUrl: string | null;
  lastUpdated: string | null;
  dataStatus: VisaDataStatus;
}

export interface VisaJobSite {
  id: string;
  name: string;
  url: string;
}

export interface VisaDocument {
  id: string;
  docKey: string;
  tag: VisaDocTag;
  title: LocalizedText;
  description: LocalizedText | null;
  tip: LocalizedText | null;
  checked: boolean;
}

export interface VisaSection {
  id: string;
  sectionKey: string;
  icon: string | null;
  access: VisaAccess;
  title: LocalizedText;
  locked: boolean;
  documentsCount: number;
  documents: VisaDocument[];
}

export interface VisaChecklist {
  destination: VisaDestinationDetail;
  sections: VisaSection[];
  jobSites: VisaJobSite[];
  progress: { ready: number; total: number };
  entitled: boolean;
  disclaimer: LocalizedText;
}

export interface VisaPreference {
  citizenship: VisaCitizenship | null;
  destination: VisaDestinationSummary | null;
  profession: VisaProfession | null;
}

export interface UpdateVisaPreferencePayload {
  citizenshipId?: string | null;
  destinationId?: string | null;
  professionId?: string | null;
}
