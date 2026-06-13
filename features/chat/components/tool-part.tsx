import type { ToolUIPart, DynamicToolUIPart } from "ai";

import { extractJobs, isJobSearchTool } from "@/features/chat/types/job";
import { JobCard } from "./job-card";

/**
 * Render a tool invocation part. Both job-search tools (`findJobs` and
 * `findMoreJobs`) become a responsive grid of job cards. In-progress states
 * render nothing — the assistant's logo loader signals "working" instead, so we
 * never expose tool plumbing. Empty results render nothing either; the model's
 * own text answer explains when there's nothing to show.
 */
export function ToolPart({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const toolType =
    part.type === "dynamic-tool" ? `tool-${part.toolName}` : part.type;

  if (!isJobSearchTool(toolType)) return null;

  if (part.state === "output-error") {
    // Never surface raw tool/provider error text (it can leak internal details).
    return (
      <p className="text-muted-foreground text-sm">
        Job search is temporarily unavailable. Please try again in a moment.
      </p>
    );
  }

  if (part.state !== "output-available") return null;

  const jobs = extractJobs(toolType, part.output);
  if (jobs.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {jobs.map((job, index) => (
        <JobCard key={job.id ?? `${job.title}-${index}`} job={job} />
      ))}
    </div>
  );
}
