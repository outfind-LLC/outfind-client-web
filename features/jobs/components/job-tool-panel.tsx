"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ClipboardList, Loader2, RefreshCw, X } from "lucide-react";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import {
  isProfileUsable,
  profileGaps,
} from "@/features/profile/lib/profile-complete";
import { jobAiToolDef, type AiToolId } from "@/features/jobs/constants/job-ai-tools";
import {
  useJobAiTool,
  type JobAiResult,
} from "@/features/jobs/hooks/use-job-ai-tool";
import { jobKey } from "@/features/jobs/lib/job-context";
import { useJobToolPanelStore } from "@/features/jobs/store/job-tool-panel.store";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  CoverLetterResultView,
  CvResult,
  InsightsResult,
  InterviewPrepResultView,
  MatchScoreResultView,
} from "./job-ai-results";

function renderResult(result: JobAiResult) {
  switch (result.tool) {
    case "cv":
      return <CvResult cv={result.data} />;
    case "cover":
      return <CoverLetterResultView result={result.data} />;
    case "match":
      return <MatchScoreResultView result={result.data} />;
    case "insights":
      return <InsightsResult result={result.data} />;
    case "interview":
      return <InterviewPrepResultView result={result.data} />;
  }
}

/**
 * App-wide AI-tool panel, mounted once in `AppShell`. A per-job tool result opens
 * here as a non-blocking docked drawer on desktop/tablet and a full-screen sheet
 * on mobile — the same surface model as the chat panel, so the worker can keep
 * browsing while a result is open. Driven by `useJobToolPanelStore`.
 */
export function JobToolPanel() {
  const target = useJobToolPanelStore((s) => s.target);
  const close = useJobToolPanelStore((s) => s.close);

  useEffect(() => {
    if (!target) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, close]);

  useEffect(() => {
    if (!target) return;
    const mobile = window.matchMedia("(max-width: 639px)");
    if (!mobile.matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [target]);

  if (!target) return null;

  const def = jobAiToolDef(target.tool);
  const Icon = def.icon;

  return (
    <aside
      role="dialog"
      aria-label={def.title}
      className="bg-card animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l shadow-xl duration-200 sm:z-40 sm:max-w-[480px] lg:max-w-[560px]"
    >
      <header className="flex items-start gap-3 border-b p-4">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="flex items-center gap-2 text-base font-semibold">
            <Icon className="text-brand size-4 shrink-0" />
            <span className="min-w-0 break-words">{def.title}</span>
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {target.job.title}
            {target.job.company ? ` · ${target.job.company}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 shrink-0 rounded-md p-1.5 transition-colors"
        >
          <X className="size-4" />
        </button>
      </header>

      <JobToolContent
        key={`${target.tool}:${jobKey(target.job)}`}
        tool={target.tool}
        job={target.job}
        onClose={close}
      />
    </aside>
  );
}

/** Body + footer for one tool run: profile gate → generate → render. */
function JobToolContent({
  tool,
  job,
  onClose,
}: {
  tool: AiToolId;
  job: JobCardData;
  onClose: () => void;
}) {
  const { isWorker } = useSession();
  const def = jobAiToolDef(tool);

  const profileQuery = useWorkerProfile(Boolean(isWorker));
  const profileLoading = profileQuery.isLoading;
  const profileFailed =
    profileQuery.isError &&
    !(isApiClientError(profileQuery.error) && profileQuery.error.status === 404);
  const usable = isProfileUsable(profileQuery.data);

  const ready = !profileLoading && !profileFailed && usable;
  const toolQuery = useJobAiTool(tool, job, ready);

  const showRegenerate =
    ready && Boolean(toolQuery.data) && !toolQuery.isFetching;

  return (
    <>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {profileLoading ? (
          <CenteredSpinner />
        ) : profileFailed ? (
          <ErrorState
            message="We couldn't load your profile. Please try again."
            onRetry={() => void profileQuery.refetch()}
          />
        ) : !usable ? (
          <ProfileIncomplete
            gaps={profileGaps(profileQuery.data)}
            onClose={onClose}
          />
        ) : toolQuery.isLoading || toolQuery.isFetching ? (
          <GeneratingState label={def.title} />
        ) : toolQuery.isError ? (
          <ToolError
            error={toolQuery.error}
            onRetry={() => void toolQuery.refetch()}
            onClose={onClose}
          />
        ) : toolQuery.data ? (
          renderResult(toolQuery.data)
        ) : null}
      </div>

      {showRegenerate ? (
        <div className="bg-background/95 flex items-center justify-between gap-3 border-t p-4 backdrop-blur-sm">
          <p className="text-muted-foreground hidden text-xs sm:block">
            {def.blurb}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto w-full sm:w-auto"
            onClick={() => void toolQuery.refetch()}
          >
            <RefreshCw className="size-3.5" />
            Regenerate
          </Button>
        </div>
      ) : null}
    </>
  );
}

function CenteredSpinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="text-muted-foreground size-5 animate-spin" />
    </div>
  );
}

function GeneratingState({ label }: { label: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
      <span className="bg-brand/10 relative flex size-12 items-center justify-center rounded-2xl">
        <Loader2 className="text-brand size-6 animate-spin" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">Generating {label.toLowerCase()}…</p>
        <p className="text-muted-foreground text-xs">
          This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}

function ProfileIncomplete({
  gaps,
  onClose,
}: {
  gaps: string[];
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="bg-brand/10 flex size-12 items-center justify-center rounded-2xl">
        <ClipboardList className="text-brand size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-semibold">Complete your profile first</h3>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          The AI tools tailor every result to your background. Add a few details
          and you&apos;re ready to generate.
        </p>
      </div>
      {gaps.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {gaps.map((gap) => (
            <Badge key={gap} variant="outline" className="font-normal">
              {gap}
            </Badge>
          ))}
        </div>
      ) : null}
      <Button asChild variant="brand" onClick={onClose}>
        <Link href={routes.profile}>Complete your profile</Link>
      </Button>
    </div>
  );
}

function ToolError({
  error,
  onRetry,
  onClose,
}: {
  error: unknown;
  onRetry: () => void;
  onClose: () => void;
}) {
  // A late 422 (profile emptied between gate and call) routes to completion.
  if (isApiClientError(error) && error.status === 422) {
    return <ProfileIncomplete gaps={[]} onClose={onClose} />;
  }

  const isLimit =
    isApiClientError(error) && [402, 403, 429].includes(error.status);
  const message =
    isApiClientError(error) && error.message
      ? error.message
      : "Something went wrong while generating. Please try again.";

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="bg-destructive/10 flex size-12 items-center justify-center rounded-2xl">
        <AlertCircle className="text-destructive size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="font-semibold">
          {isLimit ? "You've hit your plan limit" : "Couldn't generate"}
        </h3>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm break-words">
          {message}
        </p>
      </div>
      {isLimit ? (
        <Button asChild variant="brand" onClick={onClose}>
          <Link href={routes.settings}>View plans</Link>
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <AlertCircle className="text-muted-foreground size-8" />
      <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
