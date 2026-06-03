"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, MoreVertical, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import {
  useDeleteVacancy,
  useUpdateVacancyStatus,
  useVacancies,
} from "@/features/vacancies/hooks/use-vacancies";
import {
  VACANCY_STATUS_META,
  VACANCY_STATUS_ORDER,
} from "@/features/vacancies/constants/status";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isApiClientError } from "@/lib/api/error";
import type { Vacancy } from "@/interfaces/vacancy.interface";
import { VACANCY_STATUS, type VacancyStatus } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";

const STATUS_ACTIONS: { status: VacancyStatus; label: string }[] = [
  { status: VACANCY_STATUS.ACTIVE, label: "Mark active" },
  { status: VACANCY_STATUS.PAUSED, label: "Pause" },
  { status: VACANCY_STATUS.FILLED, label: "Mark filled" },
];

/** Employer's own vacancies, filterable by status, with status + delete. */
export function VacanciesList() {
  const [status, setStatus] = useState<VacancyStatus | null>(null);
  const { data, isLoading, isError } = useVacancies(status ?? undefined);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={status === null} onClick={() => setStatus(null)}>
          All
        </FilterChip>
        {VACANCY_STATUS_ORDER.map((value) => (
          <FilterChip
            key={value}
            active={status === value}
            onClick={() => setStatus(value)}
          >
            {VACANCY_STATUS_META[value].label}
          </FilterChip>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load your vacancies. Please try again.
        </p>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No vacancies yet"
          description="Create your first job post in chat with the Vacancy Creation assistant."
          action={
            <Button asChild variant="brand" size="sm">
              <Link href={routes.chat}>Create with AI</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {data.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const updateStatus = useUpdateVacancyStatus();
  const deleteVacancy = useDeleteVacancy();
  const meta = VACANCY_STATUS_META[vacancy.status];
  const location = vacancy.isRemote
    ? "Remote"
    : [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  const changeStatus = (status: VacancyStatus) => {
    if (status === vacancy.status) return;
    updateStatus.mutate(
      { id: vacancy.id, payload: { status } },
      {
        onSuccess: () => toast.success("Vacancy updated"),
        onError: () => toast.error("Couldn't update vacancy"),
      },
    );
  };

  const remove = () => {
    deleteVacancy.mutate(vacancy.id, {
      onSuccess: () => toast.success("Vacancy deleted"),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : "Couldn't delete vacancy",
        ),
    });
  };

  return (
    <li className="border-border/60 bg-card flex items-start justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{vacancy.title}</h3>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {location ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          ) : null}
          {vacancy.salaryRaw ? <span>{vacancy.salaryRaw}</span> : null}
          <span>
            Posted {formatRelativeTime(vacancy.postedAt ?? vacancy.createdAt)}
          </span>
        </div>
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href={routes.vacancyApplicants(vacancy.id)}>
            <Users className="size-3.5" />
            View applicants
          </Link>
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Vacancy actions"
            className="shrink-0"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Change status</DropdownMenuLabel>
          {STATUS_ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action.status}
              onClick={() => changeStatus(action.status)}
              disabled={
                updateStatus.isPending || vacancy.status === action.status
              }
            >
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={remove}
            disabled={deleteVacancy.isPending}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
