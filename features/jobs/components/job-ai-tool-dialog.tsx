"use client";

import Link from "next/link";
import {
  AlertCircle,
  ClipboardList,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import {
  isProfileUsable,
  profileGaps,
} from "@/features/profile/lib/profile-complete";
import {
  jobAiToolDef,
  type AiToolId,
} from "@/features/jobs/constants/job-ai-tools";
import {
  useJobAiTool,
  type JobAiResult,
} from "@/features/jobs/hooks/use-job-ai-tool";
import type { JobCardData } from "@/features/chat/types/job";
import { isApiClientError } from "@/lib/api/error";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  CoverLetterResultView,
  CvResult,
  InsightsResult,
  InterviewPrepResultView,
  MatchScoreResultView,
} from "./job-ai-results";

interface JobAiToolDialogProps {
  tool: AiToolId | null;
  job: JobCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function JobAiToolDialog({
  tool,
  job,
  open,
  onOpenChange,
}: JobAiToolDialogProps) {
  const { isWorker } = useSession();
  const def = tool ? jobAiToolDef(tool) : null;

  // Profile drives the gate; only fetch while the dialog is open.
  const profileQuery = useWorkerProfile(open && Boolean(isWorker));
  const profileLoading = open && profileQuery.isLoading;
  const profileFailed =
    profileQuery.isError &&
    !(isApiClientError(profileQuery.error) && profileQuery.error.status === 404);
  const usable = isProfileUsable(profileQuery.data);

  // Run the tool only once the profile is known and usable.
  const ready = open && Boolean(tool) && !profileLoading && !profileFailed && usable;
  const toolQuery = useJobAiTool(tool ?? "cv", job, ready);

  const Icon = def?.icon ?? Sparkles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon className="text-brand size-4 shrink-0" />
            <span className="min-w-0 break-words">
              {def?.title ?? "AI tool"}
            </span>
          </DialogTitle>
          <DialogDescription className="truncate text-xs">
            {job.title}
            {job.company ? ` · ${job.company}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-5">
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
              onClose={() => onOpenChange(false)}
            />
          ) : toolQuery.isLoading || toolQuery.isFetching ? (
            <GeneratingState label={def?.title ?? "result"} />
          ) : toolQuery.isError ? (
            <ToolError
              error={toolQuery.error}
              onRetry={() => void toolQuery.refetch()}
              onClose={() => onOpenChange(false)}
            />
          ) : toolQuery.data ? (
            renderResult(toolQuery.data)
          ) : null}
        </div>

        {ready && toolQuery.data && !toolQuery.isFetching ? (
          <div className="flex items-center justify-between gap-3 border-t p-4">
            <p className="text-muted-foreground hidden text-xs sm:block">
              {def?.blurb}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => void toolQuery.refetch()}
            >
              <RefreshCw className="size-3.5" />
              Regenerate
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
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
        <Sparkles className="text-brand size-6 animate-pulse" />
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
          and you’re ready to generate.
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
          {isLimit ? "You’ve hit your plan limit" : "Couldn’t generate"}
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
