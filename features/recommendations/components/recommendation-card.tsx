"use client";

import { useState } from "react";
import { Building2, ChevronRight, MapPin } from "lucide-react";

import { ApplyDialog } from "@/features/jobs/components/apply-dialog";
import { JobDetailSheet } from "@/features/jobs/components/job-detail-sheet";
import { useJobActions } from "@/features/jobs/hooks/use-job-actions";
import { useVacancyDetail } from "@/features/recommendations/hooks/use-vacancy-detail";
import { recommendationToJobCard } from "@/features/recommendations/lib/recommendation-to-job-card";
import { formatRelativeTime } from "@/lib/format";
import type { RecommendedVacancy } from "@/interfaces/vacancy.interface";
import { Badge } from "@/ui/badge";

/**
 * A recommended vacancy. The card is a tappable summary; clicking it opens the
 * full detail view (vacancy + company info, AI tools, and apply with a cover
 * letter) — the same surface as chat results, so the worker gets a consistent,
 * source-blind experience.
 */
export function RecommendationCard({
  vacancy,
}: {
  vacancy: RecommendedVacancy;
}) {
  const actions = useJobActions(vacancy.id);
  const [open, setOpen] = useState(false);
  // Fetch the full detail only once the worker opens this recommendation.
  const { data: full } = useVacancyDetail(vacancy.id, open);
  const job = recommendationToJobCard(vacancy, full);
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border/70 bg-card hover:border-brand/40 focus-visible:ring-ring/40 flex h-full w-full flex-col gap-3 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-2"
      >
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h4 className="min-w-0 truncate leading-tight font-semibold">
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

        <span className="text-brand mt-auto inline-flex items-center gap-1 text-xs font-medium">
          View details &amp; apply
          <ChevronRight className="size-3.5" />
        </span>
      </button>

      <JobDetailSheet
        open={open}
        onOpenChange={setOpen}
        job={job}
        vacancyId={vacancy.id}
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
