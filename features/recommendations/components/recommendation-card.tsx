"use client";

import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Loader2,
  MapPin,
} from "lucide-react";

import { useJobActions } from "@/features/jobs/hooks/use-job-actions";
import { formatRelativeTime } from "@/lib/format";
import type { RecommendedVacancy } from "@/interfaces/vacancy.interface";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

/** A recommended internal vacancy with quick apply/save actions. */
export function RecommendationCard({
  vacancy,
}: {
  vacancy: RecommendedVacancy;
}) {
  const actions = useJobActions(vacancy.id);
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  return (
    <div className="border-border/70 bg-card hover:border-brand/40 flex flex-col gap-3 rounded-xl border p-4 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate leading-tight font-semibold">
              {vacancy.title}
            </h4>
            {vacancy.isBestMatch ? (
              <Badge variant="brand" className="shrink-0">
                Best match
              </Badge>
            ) : null}
          </div>
          {vacancy.companyName ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{vacancy.companyName}</span>
            </p>
          ) : null}
        </div>
        {vacancy.matchScore !== null ? (
          <Badge variant="secondary" className="shrink-0">
            {vacancy.matchScore}% match
          </Badge>
        ) : null}
      </div>

      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {location}
          </span>
        ) : null}
        {vacancy.postedAt ? (
          <span>Posted {formatRelativeTime(vacancy.postedAt)}</span>
        ) : null}
      </div>

      <div className="border-border/50 mt-1 flex items-center gap-2 border-t pt-3">
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
      </div>
    </div>
  );
}
