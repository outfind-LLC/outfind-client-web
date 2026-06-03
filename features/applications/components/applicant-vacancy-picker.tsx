"use client";

import Link from "next/link";
import { Briefcase, ChevronRight, MapPin } from "lucide-react";

import { routes } from "@/config/routes";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { useVacancies } from "@/features/vacancies/hooks/use-vacancies";
import { VACANCY_STATUS_META } from "@/features/vacancies/constants/status";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Lists the employer's vacancies; selecting one opens its applicants. */
export function ApplicantVacancyPicker() {
  const { data, isLoading, isError } = useVacancies();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load your vacancies. Please try again.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No vacancies yet"
        description="Post a vacancy first, then review applicants here."
        action={
          <Button asChild variant="brand" size="sm">
            <Link href={routes.chat}>Create with AI</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((vacancy) => {
        const meta = VACANCY_STATUS_META[vacancy.status];
        const location = vacancy.isRemote
          ? "Remote"
          : [vacancy.city, vacancy.country].filter(Boolean).join(", ");
        return (
          <li key={vacancy.id}>
            <Link
              href={routes.vacancyApplicants(vacancy.id)}
              className="border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{vacancy.title}</h3>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                {location ? (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <MapPin className="size-3.5" />
                    {location}
                  </p>
                ) : null}
              </div>
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
