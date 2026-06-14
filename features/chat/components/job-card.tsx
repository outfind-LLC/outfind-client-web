"use client";

import { Building2, ChevronRight, MapPin, Wallet } from "lucide-react";

import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import type { JobCardData } from "@/features/chat/types/job";
import { Badge } from "@/ui/badge";

/**
 * A single job result inside an assistant message — a compact, tappable summary.
 * Everything else (full details, company info, AI tools, applying) lives behind
 * it in the docked detail panel. Every role uses the exact same card + detail,
 * so the worker is never shown where a role came from.
 */
export function JobCard({ job }: { job: JobCardData }) {
  const openDetail = useJobDetailPanelStore((s) => s.openDetail);

  return (
    <button
      type="button"
      onClick={() => openDetail(job, job.id)}
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
