"use client";

import { useState, type ReactNode } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Wallet,
} from "lucide-react";

import { JobDetailSheet } from "@/features/jobs/components/job-detail-sheet";
import { useJobActions } from "@/features/jobs/hooks/use-job-actions";
import type { JobCardData } from "@/features/chat/types/job";
import { cn } from "@/lib/utils";
import { REACTION_TYPE } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

/**
 * A single job result inside an assistant message. Internal vacancies (those
 * with an id) get the full action set; external listings — which have no
 * vacancy id to act on — keep a "View role" link out to the source.
 */
export function JobCard({ job }: { job: JobCardData }) {
  return job.id ? (
    <InternalJobCard job={job} vacancyId={job.id} />
  ) : (
    <ExternalJobCard job={job} />
  );
}

function InternalJobCard({
  job,
  vacancyId,
}: {
  job: JobCardData;
  vacancyId: string;
}) {
  const actions = useJobActions(vacancyId);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <JobCardShell job={job}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="brand"
          size="sm"
          onClick={actions.applyToJob}
          disabled={actions.applyPending || actions.applied}
        >
          {actions.applyPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {actions.applied ? "Applied" : "Apply"}
        </Button>

        <Button
          variant={actions.saved ? "secondary" : "outline"}
          size="sm"
          onClick={actions.toggleSave}
          disabled={actions.savePending}
        >
          {actions.saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
          {actions.saved ? "Saved" : "Save"}
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <IconToggle
            label="Like"
            active={actions.reaction === REACTION_TYPE.LIKE}
            disabled={actions.reactionPending}
            onClick={() => actions.react(REACTION_TYPE.LIKE)}
          >
            <ThumbsUp className="size-4" />
          </IconToggle>
          <IconToggle
            label="Dislike"
            active={actions.reaction === REACTION_TYPE.DISLIKE}
            disabled={actions.reactionPending}
            onClick={() => actions.react(REACTION_TYPE.DISLIKE)}
          >
            <ThumbsDown className="size-4" />
          </IconToggle>
          <IconToggle
            label="Comments and details"
            active={false}
            disabled={false}
            onClick={() => setDetailsOpen(true)}
          >
            <MessageSquare className="size-4" />
          </IconToggle>
        </div>
      </div>

      <JobDetailSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        job={job}
        vacancyId={vacancyId}
        actions={actions}
      />
    </JobCardShell>
  );
}

function ExternalJobCard({ job }: { job: JobCardData }) {
  return (
    <JobCardShell job={job}>
      {job.url ? (
        <Button asChild size="sm" variant="outline" className="w-fit">
          <a href={job.url} target="_blank" rel="noreferrer">
            View role
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      ) : null}
    </JobCardShell>
  );
}

/** Presentational shell shared by internal/external cards; `children` is the
 * action footer. */
function JobCardShell({
  job,
  children,
}: {
  job: JobCardData;
  children: ReactNode;
}) {
  return (
    <div className="border-border/70 bg-card hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h4 className="truncate leading-tight font-semibold">{job.title}</h4>
          {job.company ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{job.company}</span>
            </p>
          ) : null}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {job.source}
        </Badge>
      </div>

      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {job.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {job.location}
          </span>
        ) : null}
        {job.salary ? (
          <span className="flex items-center gap-1.5">
            <Wallet className="size-3.5" />
            {job.salary}
          </span>
        ) : null}
        {job.isRemote ? <Badge variant="success">Remote</Badge> : null}
        {job.jobType ? <Badge variant="outline">{job.jobType}</Badge> : null}
      </div>

      {job.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map((skill) => (
            <Badge key={skill} variant="outline" className="font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="border-border/50 mt-1 border-t pt-3">{children}</div>
    </div>
  );
}

function IconToggle({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && "text-brand")}
    >
      {children}
    </Button>
  );
}
