"use client";

import { useVacancy } from "@/features/vacancies/hooks/use-vacancies";
import { VacancyForm } from "@/features/vacancies/components/vacancy-form";
import { Skeleton } from "@/ui/skeleton";

/** Loads an owned vacancy and hands it to the form for editing. */
export function VacancyEditLoader({ id }: { id: string }) {
  const { data, isLoading, isError } = useVacancy(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load this vacancy. It may have been removed.
      </p>
    );
  }

  return <VacancyForm vacancy={data} />;
}
