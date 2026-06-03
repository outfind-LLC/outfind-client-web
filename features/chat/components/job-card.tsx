import { Building2, ExternalLink, MapPin, Wallet } from "lucide-react";

import type { JobCardData } from "@/features/chat/types/job";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

/** A single job result rendered as a card inside an assistant message. */
export function JobCard({ job }: { job: JobCardData }) {
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

      {job.url ? (
        <Button asChild size="sm" variant="outline" className="w-fit">
          <a href={job.url} target="_blank" rel="noreferrer">
            View role
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}
