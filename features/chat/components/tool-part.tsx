import type { ToolUIPart, DynamicToolUIPart } from "ai";

import { extractJobs, isJobSearchTool } from "@/features/chat/types/job";
import { JobCard } from "./job-card";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * Render a tool invocation part. Both job-search tools (`findJobs` and
 * `findMoreJobs`) become the prototype's stacked job-card block. In-progress
 * states render nothing — the assistant's animated mark signals "working".
 * Empty results render nothing either.
 */
export function ToolPart({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const toolType =
    part.type === "dynamic-tool" ? `tool-${part.toolName}` : part.type;

  if (!isJobSearchTool(toolType)) return null;

  if (part.state === "output-error") {
    // Never surface raw tool/provider error text (it can leak internal details).
    return (
      <p className={s["composer-foot"]} style={{ margin: "8px 0 0", textAlign: "left" }}>
        Job search is temporarily unavailable. Please try again in a moment.
      </p>
    );
  }

  if (part.state !== "output-available") return null;

  const jobs = extractJobs(toolType, part.output);
  if (jobs.length === 0) return null;

  return (
    <div className={s.jobs}>
      <div className={s["jobs-head"]}>
        <span className={s.ttl}>
          {jobs.length} {jobs.length === 1 ? "match" : "matches"}
        </span>
        <span className={s.sub}>ranked by fit</span>
      </div>
      {jobs.map((job, index) => (
        <JobCard key={job.id ?? `${job.title}-${index}`} job={job} />
      ))}
    </div>
  );
}
