import type { JobCardData } from "@/features/chat/types/job";
import type { JobContextPayload } from "@/interfaces/worker-ai.interface";

/** Backend caps the description at 8000 chars; keep us comfortably under. */
const MAX_DESCRIPTION = 7000;

/** A stable key for caching a job's AI results across tool reopens. */
export function jobKey(job: JobCardData): string {
  return job.id ?? `${job.title}::${job.company ?? ""}::${job.location ?? ""}`;
}

/**
 * Compose the richest job-description text a job card can offer, so the per-job
 * AI tools always have meaningful, non-empty context to work with (the backend
 * requires a non-empty description).
 */
export function toJobContextPayload(job: JobCardData): JobContextPayload {
  const parts: string[] = [];
  if (job.description) parts.push(job.description);
  if (job.requirements.length > 0) {
    parts.push(
      `Requirements:\n${job.requirements.map((r) => `- ${r}`).join("\n")}`,
    );
  }
  const facts = [
    job.company && `Company: ${job.company}`,
    job.location && `Location: ${job.location}`,
    job.jobType && `Employment type: ${job.jobType}`,
    job.salary && `Salary: ${job.salary}`,
    job.isRemote && "Remote: yes",
    job.skills.length > 0 && `Key skills: ${job.skills.join(", ")}`,
  ].filter(Boolean);
  if (facts.length > 0) parts.push(facts.join("\n"));

  // Always non-empty: at minimum, describe the role from its title.
  const jobDescription =
    parts.join("\n\n").trim().slice(0, MAX_DESCRIPTION) || `${job.title} role.`;

  return {
    jobTitle: job.title,
    companyName: job.company ?? undefined,
    location: job.location ?? undefined,
    salary: job.salary ?? undefined,
    jobType: job.jobType ?? undefined,
    jobDescription,
    requiredSkills: job.skills.length > 0 ? job.skills : undefined,
  };
}
