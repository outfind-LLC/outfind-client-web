import type {
  ExperienceSection,
  ResumeDocument,
  SkillsSection,
  StyleConfig,
} from "@/interfaces/resume.interface";
import type { MessageKey } from "@/lib/i18n/translate";

export interface AtsCheck {
  key: MessageKey;
  ok: boolean;
  weight: number;
}
export interface AtsResult {
  /** 0–100 machine-readability + completeness score. */
  score: number;
  checks: AtsCheck[];
}

function wordCount(document: ResumeDocument): number {
  const parts: string[] = [document.basics.summary];
  for (const section of document.sections) {
    if (section.type === "skills") {
      parts.push(section.items.join(" "));
    } else {
      for (const item of section.items) {
        parts.push(Object.values(item).filter(isText).join(" "));
      }
    }
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}
function isText(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Deterministic, client-side ATS score. Rewards a complete, machine-readable
 * resume: real contact details, a summary, enough skills, quantified impact,
 * standard headings, sensible length, and an ATS-friendly single-column,
 * photo-free layout. Runs instantly on every edit — no server round-trip.
 */
export function computeAts(
  document: ResumeDocument,
  style: StyleConfig,
): AtsResult {
  const experience = document.sections.find(
    (s): s is ExperienceSection => s.type === "experience",
  );
  const skills = document.sections.find(
    (s): s is SkillsSection => s.type === "skills",
  );

  const hasQuantified = Boolean(
    experience?.items.some((item) => item.highlights.some((h) => /\d/.test(h))),
  );
  const titles = new Set(document.sections.map((s) => s.type));
  const words = wordCount(document);

  const checks: AtsCheck[] = [
    {
      key: "cv.atsEmail",
      ok: document.basics.email.trim().length > 3,
      weight: 10,
    },
    {
      key: "cv.atsPhone",
      ok: document.basics.phone.trim().length > 5,
      weight: 8,
    },
    {
      key: "cv.atsSummary",
      ok: document.basics.summary.trim().length >= 150,
      weight: 12,
    },
    {
      key: "cv.atsSkills",
      ok: (skills?.items.filter((s) => s.trim()).length ?? 0) >= 5,
      weight: 12,
    },
    {
      key: "cv.atsExperience",
      ok: (experience?.items.length ?? 0) >= 1,
      weight: 15,
    },
    { key: "cv.atsQuantified", ok: hasQuantified, weight: 10 },
    {
      key: "cv.atsHeadings",
      ok:
        titles.has("experience") &&
        titles.has("education") &&
        titles.has("skills"),
      weight: 8,
    },
    { key: "cv.atsLength", ok: words >= 200 && words <= 900, weight: 10 },
    { key: "cv.atsSingleColumn", ok: style.layout === "single", weight: 8 },
    { key: "cv.atsNoPhoto", ok: !style.showPhoto, weight: 7 },
  ];

  const score = checks.reduce((sum, c) => (c.ok ? sum + c.weight : sum), 0);
  return { score, checks };
}
