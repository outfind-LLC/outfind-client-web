"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Flag,
  MapPin,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { ConversationDialog } from "@/features/applications/components/conversation-dialog";
import { ReportEmployerDialog } from "@/features/trust/components/report-employer-dialog";
import {
  useApplications,
  useWithdrawApplication,
} from "@/features/applications/hooks/use-applications";
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
} from "@/features/applications/constants/status";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Application } from "@/interfaces/application.interface";
import type { ApplicationStatus } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Worker applications, filterable by status, with withdraw. */
export function ApplicationsList() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const { data, isLoading, isError } = useApplications(status ?? undefined);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={status === null} onClick={() => setStatus(null)}>
          All
        </FilterChip>
        {APPLICATION_STATUS_ORDER.map((value) => (
          <FilterChip
            key={value}
            active={status === value}
            onClick={() => setStatus(value)}
          >
            {APPLICATION_STATUS_META[value].label}
          </FilterChip>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load your applications. Please try again.
        </p>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Find a job through chat and apply — it'll show up here."
          action={
            <Button asChild variant="brand" size="sm">
              <Link href={routes.chat}>Find jobs</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {data.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const withdraw = useWithdrawApplication();
  const [convoOpen, setConvoOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const meta = APPLICATION_STATUS_META[application.status];
  const { vacancy } = application;
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");

  const onWithdraw = () => {
    withdraw.mutate(application.id, {
      onSuccess: () => toast.success("Application withdrawn"),
      onError: () => toast.error("Couldn't withdraw application"),
    });
  };

  return (
    <li className="border-border/60 bg-card flex items-start justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0 space-y-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 truncate font-medium">{vacancy.title}</h3>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {vacancy.companyName ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" />
              <span className="min-w-0 break-words">{vacancy.companyName}</span>
            </span>
          ) : null}
          {location ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="min-w-0 break-words">{location}</span>
            </span>
          ) : null}
          <span>
            Applied{" "}
            {formatRelativeTime(application.sentAt ?? application.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Messages"
          onClick={() => setConvoOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="size-4" />
        </Button>
        {vacancy.employerId ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Report employer"
            onClick={() => setReportOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Withdraw application"
          onClick={onWithdraw}
          disabled={withdraw.isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <ConversationDialog
        open={convoOpen}
        onOpenChange={setConvoOpen}
        scope="worker"
        applicationId={application.id}
        title={vacancy.title}
        subtitle={vacancy.companyName ?? undefined}
      />

      {vacancy.employerId ? (
        <ReportEmployerDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          employerId={vacancy.employerId}
          companyName={vacancy.companyName}
        />
      ) : null}
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

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}
