/**
 * Normalised job-card model. The Job Finder specialist calls two tools
 * (`searchInternalVacancies`, `searchExternalJobs`) whose outputs differ; both
 * are mapped to this single shape for rendering.
 */
export interface JobCardData {
  id: string | null;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  skills: string[];
  url: string | null;
  isRemote: boolean;
  jobType: string | null;
  source: string;
}

interface InternalVacancyOutput {
  id: string;
  title: string;
  company: string | null;
  country: string;
  city: string | null;
  type: string | null;
  isRemote: boolean;
  salary: string | null;
  skills: string[];
  url: string | null;
  source: string;
  postedAt: string | null;
}

interface ExternalJobOutput {
  title: string;
  company: string;
  location: string;
  skills?: string[];
  url: string;
  salary?: string;
  jobType?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function joinLocation(city: string | null, country: string): string {
  return [city, country].filter(Boolean).join(", ");
}

function normaliseInternal(item: InternalVacancyOutput): JobCardData {
  return {
    id: item.id,
    title: item.title,
    company: item.company,
    location: joinLocation(item.city, item.country),
    salary: item.salary,
    skills: item.skills ?? [],
    url: item.url,
    isRemote: item.isRemote,
    jobType: item.type,
    source: item.source || "Jobsterr",
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
    url: item.url,
    isRemote: /remote/i.test(item.location),
    jobType: item.jobType ?? null,
    source: "External",
  };
}

/**
 * Pull job cards out of a tool part's output. Returns `[]` for any tool that
 * isn't a job search or whose output isn't yet available — callers can render
 * unconditionally.
 */
export function extractJobs(toolType: string, output: unknown): JobCardData[] {
  if (!isObject(output)) return [];

  if (toolType === "tool-searchInternalVacancies") {
    const vacancies = output.vacancies;
    if (!Array.isArray(vacancies)) return [];
    return vacancies.map((v) => normaliseInternal(v as InternalVacancyOutput));
  }

  if (toolType === "tool-searchExternalJobs") {
    const jobs = output.jobs;
    if (!Array.isArray(jobs)) return [];
    return jobs.map((j) => normaliseExternal(j as ExternalJobOutput));
  }

  return [];
}

/** Whether a tool part type is one of the job-search tools. */
export function isJobSearchTool(toolType: string): boolean {
  return (
    toolType === "tool-searchInternalVacancies" ||
    toolType === "tool-searchExternalJobs"
  );
}
