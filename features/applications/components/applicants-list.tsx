"use client";

import { Users } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import {
  useUpdateApplicationStatus,
  useVacancyApplicants,
} from "@/features/applications/hooks/use-applications";
import { APPLICATION_STATUS_META } from "@/features/applications/constants/status";
import { formatRelativeTime } from "@/lib/format";
import type { EmployerApplication } from "@/interfaces/application.interface";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";

/** Statuses an employer can assign to an applicant. */
const TRIAGE_STATUSES: ApplicationStatus[] = [
  APPLICATION_STATUS.VIEWED,
  APPLICATION_STATUS.ACCEPTED,
  APPLICATION_STATUS.REJECTED,
];

/** Applicants for one owned vacancy, ranked, with status triage. */
export function ApplicantsList({ vacancyId }: { vacancyId: string }) {
  const { data, isLoading, isError } = useVacancyApplicants(vacancyId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load applicants. Please try again.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applicants yet"
        description="When candidates apply to this role, they'll appear here ranked by fit."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((application) => (
        <ApplicantCard
          key={application.id}
          application={application}
          vacancyId={vacancyId}
        />
      ))}
    </ul>
  );
}

function ApplicantCard({
  application,
  vacancyId,
}: {
  application: EmployerApplication;
  vacancyId: string;
}) {
  const updateStatus = useUpdateApplicationStatus(vacancyId);
  const meta = APPLICATION_STATUS_META[application.status];
  const { applicant } = application;

  const setStatus = (status: ApplicationStatus) => {
    updateStatus.mutate(
      { applicationId: application.id, payload: { status } },
      {
        onSuccess: () => toast.success("Applicant updated"),
        onError: () => toast.error("Couldn't update applicant"),
      },
    );
  };

  return (
    <li className="border-border/60 bg-card flex items-center gap-4 rounded-xl border p-4">
      <UserAvatar
        name={applicant.name}
        avatarUrl={applicant.avatarUrl}
        className="size-10"
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{applicant.name}</p>
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {application.matchScore !== null ? (
            <Badge variant="brand">{application.matchScore}% match</Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {applicant.profession ?? "Candidate"} · applied{" "}
          {formatRelativeTime(application.sentAt ?? application.createdAt)}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={updateStatus.isPending}>
            Set status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {TRIAGE_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => setStatus(status)}
              disabled={application.status === status}
            >
              {APPLICATION_STATUS_META[status].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
