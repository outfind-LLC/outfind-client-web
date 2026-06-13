"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import {
  toolsForContext,
  type AiToolId,
  type JobAiContext,
} from "@/features/jobs/constants/job-ai-tools";
import type { JobCardData } from "@/features/chat/types/job";
import { cn } from "@/lib/utils";
import { JobAiToolDialog } from "./job-ai-tool-dialog";

interface JobAiToolsProps {
  job: JobCardData;
  /** Which set of tools to show (defaults to search-result cards). */
  context?: JobAiContext;
  /** Heading copy above the tool grid. */
  label?: string;
}

/**
 * The per-job AI toolkit. Which tools appear is driven entirely by
 * `JOB_AI_TOOLS` (see constants) filtered by `context` — search-result cards get
 * CV/cover/match/insights, while already-applied jobs get interview prep. Each
 * tool opens a dialog that gates on profile completeness, then generates and
 * renders a formatted result.
 */
export function JobAiTools({
  job,
  context = "search",
  label = "AI tools for this job",
}: JobAiToolsProps) {
  const [tool, setTool] = useState<AiToolId | null>(null);
  const tools = toolsForContext(context);
  const oddCount = tools.length % 2 === 1;

  if (tools.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Sparkles className="text-brand size-3.5" />
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {tools.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={cn(
              "border-border/70 bg-background hover:border-brand/50 hover:bg-brand/5 focus-visible:ring-ring/40 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors outline-none focus-visible:ring-2",
              oddCount && index === tools.length - 1 && "col-span-2",
            )}
          >
            <item.icon className="text-brand size-4 shrink-0" />
            <span className="min-w-0 truncate">{item.label}</span>
          </button>
        ))}
      </div>

      <JobAiToolDialog
        tool={tool}
        job={job}
        open={tool !== null}
        onOpenChange={(open) => {
          if (!open) setTool(null);
        }}
      />
    </div>
  );
}
