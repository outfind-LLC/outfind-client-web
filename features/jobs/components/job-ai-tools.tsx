"use client";

import { Wand2 } from "lucide-react";

import { toolsForContext, type JobAiContext } from "@/features/jobs/constants/job-ai-tools";
import { useJobToolPanelStore } from "@/features/jobs/store/job-tool-panel.store";
import type { JobCardData } from "@/features/chat/types/job";
import { cn } from "@/lib/utils";

interface JobAiToolsProps {
  job: JobCardData;
  /** Which set of tools to show (defaults to search-result cards). */
  context?: JobAiContext;
  /** Heading copy above the tool grid. */
  label?: string;
}

/**
 * The per-job toolkit. Which tools appear is driven entirely by `JOB_AI_TOOLS`
 * (see constants) filtered by `context` — search-result cards get the resume,
 * cover letter, match, and insights tools, while already-applied jobs get
 * interview prep. Tapping a tool opens the docked AI-tool panel (a right-side
 * drawer, like chat) which checks profile completeness, then generates and
 * renders the result. Available for every job, on- or off-platform.
 */
export function JobAiTools({ job, context = "search", label }: JobAiToolsProps) {
  const openTool = useJobToolPanelStore((s) => s.openTool);
  const tools = toolsForContext(context);
  const oddCount = tools.length % 2 === 1;
  const heading =
    label ?? (context === "applied" ? "Get interview-ready" : "Tools for this job");

  if (tools.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Wand2 className="text-brand size-3.5" />
        {heading}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {tools.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openTool(item.id, job)}
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
    </div>
  );
}
