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
import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import { JobAiTools } from "@/features/jobs/components/job-ai-tools";
import { ReportEmployerDialog } from "@/features/trust/components/report-employer-dialog";
import type { JobCardData } from "@/features/chat/types/job";
import type { ApplicationVacancyPreview } from "@/interfaces/application.interface";
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
  const openThread = useChatPanelStore((s) => s.openThread);
  const [reportOpen, setReportOpen] = useState(false);
  const meta = APPLICATION_STATUS_META[application.status];
  const { vacancy } = application;
  const location = [vacancy.city, vacancy.country].filter(Boolean).join(", ");
  const aiJob = toJobCardData(vacancy);

  const openConversation = () =>
    openThread({
      scope: "worker",
      applicationId: application.id,
      title: vacancy.title,
      subtitle: vacancy.companyName ?? undefined,
      coverLetter: application.coverLetterOriginal,
    });

  const onWithdraw = () => {
    withdraw.mutate(application.id, {
      onSuccess: () => toast.success("Application withdrawn"),
      onError: () => toast.error("Couldn't withdraw application"),
    });
  };

  return (
    <li className="border-border/60 bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 truncate font-medium">{vacancy.title}</h3>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {vacancy.companyName ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {vacancy.companyName}
                </span>
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
            onClick={openConversation}
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
      </div>

      <JobAiTools job={aiJob} context="applied" />

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

/**
 * Adapt an applied vacancy into the shape the per-job AI tools expect. The
 * preview is light (no skills/description), which is fine — interview prep leans
 * on the worker's own profile plus the role title and company.
 */
function toJobCardData(vacancy: ApplicationVacancyPreview): JobCardData {
  return {
    id: vacancy.id,
    title: vacancy.title,
    company: vacancy.companyName,
    location: [vacancy.city, vacancy.country].filter(Boolean).join(", ") || null,
    salary: null,
    skills: [],
    isRemote: false,
    jobType: null,
    description: null,
    requirements: [],
    contact: {
      email: null,
      phone: null,
      whatsapp: null,
      telegram: null,
      website: null,
      contactForm: null,
    },
  };
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
