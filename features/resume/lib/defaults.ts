import type {
  ResumeSection,
  ResumeTemplateId,
  SectionType,
  StyleConfig,
} from "@/interfaces/resume.interface";

/** Short client id for new sections/items (browser context — not a workflow). */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Default style for a new resume (matches the backend default). */
export const DEFAULT_STYLE: StyleConfig = {
  template: "modern",
  layout: "single",
  fontFamily: "Inter",
  fontScale: 1,
  primaryColor: "#0f172a",
  accentColor: "#2f8f5b",
  lineHeight: 1.5,
  sectionSpacing: 22,
  margin: "md",
  headerStyle: "left",
  showIcons: true,
  showPhoto: false,
  pageSize: "a4",
};

/** Fonts offered in the design panel (all common/websafe or system stacks). */
export const FONT_OPTIONS = [
  "Inter",
  "DM Sans",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Roboto",
  "Merriweather",
] as const;

/**
 * Full style presets, one per template. Clicking a template applies the whole
 * preset instantly (the user can then recolor). "ats" is deliberately the most
 * machine-readable: single column, no icons, no photo, standard serif-free type.
 */
export const TEMPLATE_PRESETS: Record<ResumeTemplateId, StyleConfig> = {
  modern: {
    ...DEFAULT_STYLE,
    template: "modern",
    layout: "single",
    headerStyle: "left",
    accentColor: "#2f8f5b",
  },
  creative: {
    ...DEFAULT_STYLE,
    template: "creative",
    layout: "two-column",
    headerStyle: "banner",
    fontFamily: "DM Sans",
    primaryColor: "#1e1b4b",
    accentColor: "#6d5ae0",
    showIcons: true,
  },
  executive: {
    ...DEFAULT_STYLE,
    template: "executive",
    layout: "single",
    headerStyle: "center",
    fontFamily: "Georgia",
    primaryColor: "#111827",
    accentColor: "#1f4e79",
    sectionSpacing: 26,
  },
  minimal: {
    ...DEFAULT_STYLE,
    template: "minimal",
    layout: "single",
    headerStyle: "left",
    fontFamily: "Inter",
    primaryColor: "#111111",
    accentColor: "#111111",
    showIcons: false,
    sectionSpacing: 20,
  },
  ats: {
    ...DEFAULT_STYLE,
    template: "ats",
    layout: "single",
    headerStyle: "left",
    fontFamily: "Arial",
    primaryColor: "#000000",
    accentColor: "#000000",
    showIcons: false,
    showPhoto: false,
  },
  academic: {
    ...DEFAULT_STYLE,
    template: "academic",
    layout: "single",
    headerStyle: "center",
    fontFamily: "Times New Roman",
    primaryColor: "#1a1a1a",
    accentColor: "#7a1f1f",
    sectionSpacing: 24,
  },
};

/** Default title (English fallback) for a freshly-added section. */
export const SECTION_DEFAULT_TITLE: Record<SectionType, string> = {
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  references: "References",
  custom: "Custom Section",
};

/** A blank item for a section of the given type. */
export function newItem(type: SectionType): ResumeSection["items"][number] {
  switch (type) {
    case "experience":
      return {
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        highlights: [],
      };
    case "education":
      return {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      };
    case "skills":
      return "";
    case "projects":
      return {
        name: "",
        role: "",
        url: "",
        startDate: "",
        endDate: "",
        description: "",
        highlights: [],
      };
    case "certifications":
      return { name: "", issuer: "", date: "", url: "" };
    case "languages":
      return { language: "", proficiency: "" };
    case "awards":
      return { title: "", issuer: "", date: "", description: "" };
    case "references":
      return { name: "", relation: "", contact: "" };
    case "custom":
      return {
        title: "",
        subtitle: "",
        date: "",
        description: "",
        highlights: [],
      };
  }
}

/** A blank section of the given type, with one starter item where useful. */
export function newSection(type: SectionType): ResumeSection {
  const base = {
    id: genId(),
    title: SECTION_DEFAULT_TITLE[type],
    visible: true,
  };
  if (type === "skills") return { ...base, type, items: [] };
  return { ...base, type, items: [newItem(type)] } as ResumeSection;
}
