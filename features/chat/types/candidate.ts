/**
 * Candidate results in the employer chat. The backend doesn't return candidate
 * cards from `/chat` yet — see api-need.md (a `findCandidates` tool / candidate
 * search endpoint). These types + extractors define the contract the UI expects,
 * so wiring is a one-line change once the API ships.
 */

export interface CandidateContact {
  email: string | null;
  phone: string | null;
  telegram: string | null;
  whatsapp: string | null;
  website: string | null;
}

export interface CandidateCardData {
  id: string;
  name: string;
  /** Headline role / profession. */
  title: string | null;
  location: string | null;
  /** Expected salary, pre-formatted for display. */
  salary: string | null;
  skills: string[];
  /** Human availability label, e.g. "Available now". */
  availability: string | null;
  years: number | null;
  /** 0–100 fit score, when the backend provides one. */
  matchScore: number | null;
  /** Verified-by-Outfind AI candidate (has a platform profile). */
  verified: boolean;
  summary: string | null;
  experience: string[];
  contact: CandidateContact;
}

/** Tool names whose output is a list of candidate cards. */
const CANDIDATE_TOOLS = new Set(["tool-findCandidates", "tool-searchCandidates"]);

export function isCandidateSearchTool(toolType: string): boolean {
  return CANDIDATE_TOOLS.has(toolType);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function normalizeContact(value: unknown): CandidateContact {
  const c = (value ?? {}) as Record<string, unknown>;
  return {
    email: asString(c.email),
    phone: asString(c.phone),
    telegram: asString(c.telegram),
    whatsapp: asString(c.whatsapp),
    website: asString(c.website),
  };
}

/** Defensively map a tool output to candidate cards (shape per api-need.md). */
export function extractCandidates(
  _toolType: string,
  output: unknown,
): CandidateCardData[] {
  const root = (output ?? {}) as Record<string, unknown>;
  const list = Array.isArray(root.candidates)
    ? root.candidates
    : Array.isArray(output)
      ? (output as unknown[])
      : [];

  return list
    .map((raw, index): CandidateCardData | null => {
      const c = (raw ?? {}) as Record<string, unknown>;
      const name = asString(c.name);
      if (!name) return null;
      return {
        id: asString(c.id) ?? `candidate-${index}`,
        name,
        title: asString(c.title) ?? asString(c.profession),
        location: asString(c.location) ?? asString(c.city),
        salary: asString(c.salary),
        skills: asStringArray(c.skills),
        availability: asString(c.availability),
        years: typeof c.years === "number" ? c.years : null,
        matchScore: typeof c.matchScore === "number" ? c.matchScore : null,
        verified: c.verified === true,
        summary: asString(c.summary),
        experience: asStringArray(c.experience),
        contact: normalizeContact(c.contact),
      };
    })
    .filter((c): c is CandidateCardData => c !== null);
}
