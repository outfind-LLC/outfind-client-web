"use client";

import { Building2, ChevronRight, MapPin } from "lucide-react";

import { useJobDetailPanelStore } from "@/features/jobs/store/job-detail-panel.store";
import { thinJobFromRecommendation } from "@/features/jobs/lib/vacancy-to-job";
import { formatRelativeTime } from "@/lib/format";
import type { RecommendedVacancy } from "@/interfaces/vacancy.interface";
import { Badge } from "@/ui/badge";

/**
 * A recommended vacancy — a tappable summary. Clicking it opens the shared detail
 * panel (full vacancy + company info, AI tools, and apply with a cover letter),
 * the same source-blind surface as chat results. The panel loads the full detail
 * from its id.
 */
export function RecommendationCard({
  vacancy,
}: {
  vacancy: RecommendedVacancy;
}) {
  const openDetail = useJobDetailPanelStore((s) => s.openDetail);
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      onClick={() => openDetail(thinJobFromRecommendation(vacancy), vacancy.id)}
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
  );
}
