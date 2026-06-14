"use client";

import { useState } from "react";
import { Building2, ChevronRight, MapPin, Wallet } from "lucide-react";

import { ApplyDialog } from "@/features/jobs/components/apply-dialog";
import { JobDetailSheet } from "@/features/jobs/components/job-detail-sheet";
import { useJobActions } from "@/features/jobs/hooks/use-job-actions";
import type { JobCardData } from "@/features/chat/types/job";
import { Badge } from "@/ui/badge";

/**
 * A single job result inside an assistant message. The card is a compact, tappable
 * summary; everything else — full details, company info, AI tools, and applying —
 * lives behind it in the detail view. Every role uses the exact same card and
 * detail layout, so the worker is never shown where a role came from.
 */
export function JobCard({ job }: { job: JobCardData }) {
  return job.id ? (
    <InternalJobCard job={job} vacancyId={job.id} />
  ) : (
    <ExternalJobCard job={job} />
  );
}

/** Platform role — can be applied to, saved, and discussed in-app. */
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
    <>
      <JobCardSummary job={job} onOpen={() => setDetailsOpen(true)} />

      <JobDetailSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        job={job}
        vacancyId={vacancyId}
        actions={actions}
      />

      <ApplyDialog
        open={actions.applyDialogOpen}
        onOpenChange={(next) =>
          next ? actions.openApplyDialog() : actions.closeApplyDialog()
        }
        job={job}
        submitting={actions.applyPending}
        onSubmit={actions.confirmApply}
      />
    </>
  );
}

/** Role handled through the employer's own channels — same summary + detail. */
function ExternalJobCard({ job }: { job: JobCardData }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <JobCardSummary job={job} onOpen={() => setDetailsOpen(true)} />
      <JobDetailSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        job={job}
      />
    </>
  );
}

/** Tappable summary shared by every job — opens the detail view. */
function JobCardSummary({
  job,
  onOpen,
}: {
  job: JobCardData;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="border-border/70 bg-card hover:border-primary/40 focus-visible:ring-ring/40 flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-2"
    >
      <div className="min-w-0 space-y-1">
        <h4 className="min-w-0 leading-tight font-semibold break-words">
          {job.title}
        </h4>
        {job.company ? (
          <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
            <Building2 className="size-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
        ) : null}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        {job.location ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="min-w-0 break-words">{job.location}</span>
          </span>
        ) : null}
        {job.salary ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <Wallet className="size-3.5 shrink-0" />
            <span className="min-w-0 break-words">{job.salary}</span>
          </span>
        ) : null}
        {job.isRemote ? <Badge variant="success">Remote</Badge> : null}
        {job.jobType ? (
          <Badge variant="outline" className="max-w-full">
            <span className="truncate">{job.jobType}</span>
          </Badge>
        ) : null}
      </div>

      {job.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="max-w-full font-normal whitespace-normal break-words"
            >
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {job.description ? (
        <p className="text-muted-foreground line-clamp-2 text-sm break-words">
          {job.description}
        </p>
      ) : null}

      <span className="text-brand mt-0.5 inline-flex items-center gap-1 text-xs font-medium">
        View details &amp; apply
        <ChevronRight className="size-3.5" />
      </span>
    </button>
  );
}
