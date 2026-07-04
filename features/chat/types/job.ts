/**
 * Normalised job-card model. The Job Finder specialist calls two tools —
 * `findJobs` (platform vacancies) and `findMoreJobs` (broadened web search) —
 * whose outputs differ slightly; both are mapped to this single shape for
 * rendering. By design the user is never told which source a job came from, so
 * the card carries no source label — only the role and the employer's own
 * direct contact channels.
 */

/** The employer's direct contact channels. Every channel is nullable. */
export interface JobContact {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  website: string | null;
  contactForm: string | null;
}

export interface JobCardData {
  /** Platform vacancy id (apply/save/react in-app), or null for web results. */
  id: string | null;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  skills: string[];
  isRemote: boolean;
  jobType: string | null;
  /** Posting detail, used to power the per-job AI tools. */
  description: string | null;
  /** "What you'll do" — the role's day-to-day duties. */
  responsibilities: string[];
  /** "What you'll need" — the role's requirements. */
  requirements: string[];
  contact: JobContact;
  /** Profile fit 0–100 → the "N% match" pill (null until the backend scores it). */
  matchScore: number | null;
  /** ISO posting date → the card's "Posted {when}" line (null when unknown). */
  postedAt: string | null;
  /** Original posting / apply URL for sourced jobs (deep-link Apply). */
  applyUrl?: string | null;
  /** Source board label for sourced jobs (e.g. "LinkedIn"). */
  source?: string | null;
  /** True for Peoplor-posted jobs (one-tap in-app apply); false for sourced. */
  isPlatform?: boolean;
}

/** A platform vacancy, as returned by the `findJobs` tool. */
interface InternalVacancyOutput {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  type: string | null;
  isRemote: boolean;
  salary: string | null;
  skills: string[];
  description?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  contact: Partial<JobContact> | null;
  matchScore?: number | null;
  postedAt: string | null;
  isPlatform?: boolean;
  applyUrl?: string | null;
  source?: string | null;
}

/** A broadened web result, as returned by the `findMoreJobs` tool. */
interface ExternalJobOutput {
  title: string;
  company: string;
  location: string;
  skills?: string[];
  salary?: string;
  jobType?: string;
  isRemote?: boolean;
  description?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  contact: Partial<JobContact> | null;
  matchScore?: number | null;
  postedAt?: string | null;
  applyUrl?: string | null;
  sourceBoard?: string | null;
}

const EMPTY_CONTACT: JobContact = {
  email: null,
  phone: null,
  whatsapp: null,
  telegram: null,
  website: null,
  contactForm: null,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Coerce a possibly-partial contact payload into the full, null-filled shape. */
function normaliseContact(
  raw: Partial<JobContact> | null | undefined,
): JobContact {
  if (!raw) return EMPTY_CONTACT;
  return {
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    whatsapp: raw.whatsapp ?? null,
    telegram: raw.telegram ?? null,
    website: raw.website ?? null,
    contactForm: raw.contactForm ?? null,
  };
}

function normaliseInternal(item: InternalVacancyOutput): JobCardData {
  return {
    id: item.id,
    title: item.title,
    company: item.company,
    location: item.location,
    salary: item.salary,
    skills: item.skills ?? [],
    isRemote: item.isRemote,
    jobType: item.type,
    description: item.description ?? null,
    responsibilities: item.responsibilities ?? [],
    requirements: item.requirements ?? [],
    contact: normaliseContact(item.contact),
    matchScore: item.matchScore ?? null,
    postedAt: item.postedAt ?? null,
    isPlatform: item.isPlatform ?? true,
    applyUrl: item.applyUrl ?? null,
    source: item.source ?? null,
  };
}

function normaliseExternal(item: ExternalJobOutput): JobCardData {
  return {
    id: null,
    title: item.title,
    company: item.company,
    location: item.location,
    salary: item.salary ?? null,
    skills: item.skills ?? [],
    isRemote: item.isRemote ?? /remote/i.test(item.location ?? ""),
    jobType: item.jobType ?? null,
    description: item.description ?? null,
    responsibilities: item.responsibilities ?? [],
    requirements: item.requirements ?? [],
    contact: normaliseContact(item.contact),
    matchScore: item.matchScore ?? null,
    postedAt: item.postedAt ?? null,
    isPlatform: false,
    applyUrl: item.applyUrl ?? null,
    source: item.sourceBoard ?? null,
  };
}

/**
 * Pull job cards out of a tool part's output. Returns `[]` for any tool that
 * isn't a job search or whose output isn't yet available — callers can render
 * unconditionally.
 */
export function extractJobs(toolType: string, output: unknown): JobCardData[] {
  if (!isObject(output)) return [];

  if (toolType === "tool-findJobs") {
    const vacancies = output.vacancies;
    if (!Array.isArray(vacancies)) return [];
    return vacancies.map((v) => normaliseInternal(v as InternalVacancyOutput));
  }

  if (toolType === "tool-findMoreJobs") {
    const jobs = output.jobs;
    if (!Array.isArray(jobs)) return [];
    return jobs.map((j) => normaliseExternal(j as ExternalJobOutput));
  }

  return [];
}

/** Whether a tool part type is one of the job-search tools. */
export function isJobSearchTool(toolType: string): boolean {
  return toolType === "tool-findJobs" || toolType === "tool-findMoreJobs";
}

/** Longest a `salary` string can be and still read as a salary (vs. prose). */
const MAX_SALARY_LENGTH = 40;

/**
 * Whether a salary string is concise enough to show in a prominent slot (the
 * card pill / the sheet's big salary line). Web-sourced jobs sometimes return a
 * whole sentence in `salary` ("Often published as a transparent band…"); those
 * are omitted (graceful) rather than rendered as giant text — the backend should
 * return a concise salary or null (see docs/api/job-search-chat.md).
 */
export function isConciseSalary(salary: string | null): salary is string {
  if (!salary) return false;
  const trimmed = salary.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_SALARY_LENGTH;
}
