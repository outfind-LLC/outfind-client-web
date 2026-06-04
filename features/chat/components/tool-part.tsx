import { Loader2, Search } from "lucide-react";
import type { ToolUIPart, DynamicToolUIPart } from "ai";

import { extractJobs, isJobSearchTool } from "@/features/chat/types/job";
import { JobCard } from "./job-card";

/** Render a tool invocation part. Job-search tools become a grid of job cards;
 * other tools (none today) show a minimal status line. */
export function ToolPart({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const toolType =
    part.type === "dynamic-tool" ? `tool-${part.toolName}` : part.type;

  // External job results are intentionally not surfaced in the chat.
  if (toolType === "tool-searchExternalJobs") return null;
  if (!isJobSearchTool(toolType)) return null;

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Searching for jobs…
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <p className="text-destructive text-sm">
        Job search failed. {part.errorText}
      </p>
    );
  }

  if (part.state !== "output-available") return null;

  const jobs = extractJobs(toolType, part.output);
  if (jobs.length === 0) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Search className="size-4" />
        No matching roles found.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {jobs.map((job, index) => (
        <JobCard key={job.id ?? `${job.title}-${index}`} job={job} />
      ))}
    </div>
  );
}
