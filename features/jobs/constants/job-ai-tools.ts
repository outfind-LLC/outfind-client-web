import {
  FileText,
  MessagesSquare,
  PenLine,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export type AiToolId = "cv" | "cover" | "match" | "insights" | "interview";

/**
 * Where a tool is offered:
 * - `search`  → job-search result cards (jobs you haven't applied to yet)
 * - `applied` → jobs you've already applied to (the Applications list)
 */
export type JobAiContext = "search" | "applied";

export interface JobAiToolDef {
  id: AiToolId;
  /** Short label for the in-card button. */
  label: string;
  /** Full title shown in the dialog header. */
  title: string;
  /** One-line description of what the tool produces. */
  blurb: string;
  icon: LucideIcon;
  /** Contexts this tool appears in. Edit here to move a tool around. */
  contexts: readonly JobAiContext[];
}

/**
 * The single source of truth for the per-job AI tools — labels, icons, copy,
 * and where each one shows. Add, remove, reorder, or re-home a tool by editing
 * this list (and, for a brand-new tool, wiring its API call in
 * `features/jobs/hooks/use-job-ai-tool.ts`).
 *
 * Interview Prep is intentionally `applied`-only: it only makes sense once the
 * user has actually applied to the role.
 */
export const JOB_AI_TOOLS: readonly JobAiToolDef[] = [
  {
    id: "cv",
    label: "Build CV",
    title: "CV tailored to this job",
    blurb: "A polished CV from your profile, tuned to this role’s requirements.",
    icon: FileText,
    contexts: ["search"],
  },
  {
    id: "cover",
    label: "Cover Letter",
    title: "Cover letter for this job",
    blurb: "A personalised cover letter grounded in your real experience.",
    icon: PenLine,
    contexts: ["search"],
  },
  {
    id: "match",
    label: "Match Score",
    title: "Your match for this job",
    blurb: "A compatibility score with your strengths, gaps, and next steps.",
    icon: Target,
    contexts: ["search"],
  },
  {
    id: "insights",
    label: "AI Insights",
    title: "AI insights for this job",
    blurb: "Key skills, requirements, salary read, and what to watch for.",
    icon: Sparkles,
    contexts: ["search"],
  },
  {
    id: "interview",
    label: "Interview Prep",
    title: "Interview preparation",
    blurb: "Likely questions with suggested answers built from your profile.",
    icon: MessagesSquare,
    contexts: ["applied"],
  },
] as const;

export function jobAiToolDef(id: AiToolId): JobAiToolDef {
  return JOB_AI_TOOLS.find((tool) => tool.id === id) ?? JOB_AI_TOOLS[0];
}

/** The tools offered in a given context, in display order. */
export function toolsForContext(context: JobAiContext): JobAiToolDef[] {
  return JOB_AI_TOOLS.filter((tool) => tool.contexts.includes(context));
}
