/**
 * Resume builder contracts — mirror of the backend `cv` module. The backend
 * stores and serves DATA only; every rendering (templates, download, public
 * page) is built on the frontend from these shapes.
 */

export const RESUME_TEMPLATES = [
  "modern",
  "creative",
  "executive",
  "minimal",
  "ats",
  "academic",
] as const;
export type ResumeTemplateId = (typeof RESUME_TEMPLATES)[number];

export const SECTION_TYPES = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
  "references",
  "custom",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export interface SocialLink {
  label: string;
  url: string;
}

export interface ResumeBasics {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photoUrl: string | null;
  summary: string;
  socials: SocialLink[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}
export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}
export interface ProjectItem {
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}
export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  url: string;
}
export interface LanguageItem {
  language: string;
  proficiency: string;
}
export interface AwardItem {
  title: string;
  issuer: string;
  date: string;
  description: string;
}
export interface ReferenceItem {
  name: string;
  relation: string;
  contact: string;
}
export interface CustomItem {
  title: string;
  subtitle: string;
  date: string;
  description: string;
  highlights: string[];
}

interface BaseSection {
  id: string;
  title: string;
  visible: boolean;
}
export interface ExperienceSection extends BaseSection {
  type: "experience";
  items: ExperienceItem[];
}
export interface EducationSection extends BaseSection {
  type: "education";
  items: EducationItem[];
}
export interface SkillsSection extends BaseSection {
  type: "skills";
  items: string[];
}
export interface ProjectsSection extends BaseSection {
  type: "projects";
  items: ProjectItem[];
}
export interface CertificationsSection extends BaseSection {
  type: "certifications";
  items: CertificationItem[];
}
export interface LanguagesSection extends BaseSection {
  type: "languages";
  items: LanguageItem[];
}
export interface AwardsSection extends BaseSection {
  type: "awards";
  items: AwardItem[];
}
export interface ReferencesSection extends BaseSection {
  type: "references";
  items: ReferenceItem[];
}
export interface CustomSection extends BaseSection {
  type: "custom";
  items: CustomItem[];
}

export type ResumeSection =
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificationsSection
  | LanguagesSection
  | AwardsSection
  | ReferencesSection
  | CustomSection;

export interface ResumeDocument {
  basics: ResumeBasics;
  sections: ResumeSection[];
}

export interface StyleConfig {
  template: ResumeTemplateId;
  layout: "single" | "two-column";
  fontFamily: string;
  fontScale: number;
  primaryColor: string;
  accentColor: string;
  lineHeight: number;
  sectionSpacing: number;
  margin: "sm" | "md" | "lg";
  headerStyle: "left" | "center" | "banner";
  showIcons: boolean;
  showPhoto: boolean;
  pageSize: "a4" | "letter";
}

export interface ResumeSummary {
  id: string;
  name: string;
  template: string;
  isPublic: boolean;
  slug: string | null;
  updatedAt: string;
}

export interface ResumeView extends ResumeSummary {
  showContacts: boolean;
  document: ResumeDocument;
  style: StyleConfig;
  primaryLanguage: string;
}

export interface PublicResume {
  document: ResumeDocument;
  style: StyleConfig;
  name: string;
}

export interface CreateResumePayload {
  name?: string;
  fromProfile?: boolean;
}
export interface UpdateResumePayload {
  name?: string;
  document?: ResumeDocument;
  style?: StyleConfig;
  isPublic?: boolean;
  showContacts?: boolean;
}
