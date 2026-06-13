"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { routes } from "@/config/routes";
import {
  useDeleteVacancy,
  useUpdateVacancyStatus,
  useVacancy,
} from "@/features/vacancies/hooks/use-vacancies";
import { VACANCY_STATUS_META } from "@/features/vacancies/constants/status";
import {
  VACANCY_DOMAIN_OPTIONS,
  VACANCY_EXPERIENCE_OPTIONS,
  VACANCY_TYPE_LABELS,
} from "@/features/vacancies/constants/vacancy-options";
import { formatRelativeTime } from "@/lib/format";
import { isApiClientError } from "@/lib/api/error";
import { VACANCY_STATUS, type VacancyStatus } from "@/interfaces/enums";
import type { Vacancy } from "@/interfaces/vacancy.interface";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

const labelOf = (
  options: { value: string; label: string }[],
  value: string | null,
): string | null =>
  value ? (options.find((o) => o.value === value)?.label ?? value) : null;

/** Employer's full view of one owned vacancy, with lifecycle + edit + delete. */
export function VacancyDetail({ vacancyId }: { vacancyId: string }) {
  const { data: vacancy, isLoading, isError } = useVacancy(vacancyId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !vacancy) {
    return (
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t load this vacancy. It may have been removed.
      </p>
    );
  }

  return <VacancyDetailView vacancy={vacancy} />;
}

function VacancyDetailView({ vacancy }: { vacancy: Vacancy }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateStatus = useUpdateVacancyStatus();
  const deleteVacancy = useDeleteVacancy();

  const meta = VACANCY_STATUS_META[vacancy.status];
  const location = vacancy.isRemote
    ? "Remote"
    : [vacancy.city, vacancy.country].filter(Boolean).join(", ");
  const type = VACANCY_TYPE_LABELS[vacancy.type ?? ""] ?? null;
  const experience = labelOf(
    VACANCY_EXPERIENCE_OPTIONS,
    vacancy.experienceRequired,
  );
  const domain = labelOf(VACANCY_DOMAIN_OPTIONS, vacancy.vacancyDomain);
  const salary =
    vacancy.salaryRaw ??
    (vacancy.salaryMin || vacancy.salaryMax
      ? [vacancy.salaryMin, vacancy.salaryMax]
          .filter((n) => n != null)
          .join("–") + (vacancy.currency ? ` ${vacancy.currency}` : "")
      : null);

  const changeStatus = (status: VacancyStatus) => {
    if (status === vacancy.status) return;
    updateStatus.mutate(
      { id: vacancy.id, payload: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Couldn't update status"),
      },
    );
  };

  const remove = () =>
    deleteVacancy.mutate(vacancy.id, {
      onSuccess: () => {
        toast.success("Vacancy deleted");
        router.push(routes.vacancies);
      },
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : "Couldn't delete vacancy",
        ),
    });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl break-words">
                  {vacancy.title}
                </CardTitle>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {location ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="min-w-0 break-words">{location}</span>
                  </span>
                ) : null}
                {type ? <span className="break-words">{type}</span> : null}
                {salary ? (
                  <span className="break-words">{salary}</span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  Posted{" "}
                  {formatRelativeTime(vacancy.postedAt ?? vacancy.createdAt)}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.vacancyApplicants(vacancy.id)}>
                <Users className="size-4" />
                Applicants
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <StatusControls
            status={vacancy.status}
            pending={updateStatus.isPending}
            onChange={changeStatus}
          />
          <span className="bg-border mx-1 hidden h-6 w-px sm:block" />
          <Button asChild variant="outline" size="sm">
            <Link href={routes.vacancyEdit(vacancy.id)}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteVacancy.isPending}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <ListCard title="Responsibilities" items={vacancy.responsibilities} />
          <ListCard title="Requirements" items={vacancy.requirements} />
          <ListCard title="Nice to have" items={vacancy.niceToHave} />
          <ListCard title="Benefits" items={vacancy.benefits} />
          <ListCard
            title="Recruitment process"
            items={vacancy.recruitmentProcess}
          />
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Fact label="Experience" value={experience} />
              <Fact label="Domain" value={domain} />
              <TagFact label="Skills" items={vacancy.skillsRequired} />
              <TagFact label="Languages" items={vacancy.languagesRequired} />
              <TagFact label="Driving" items={vacancy.drivingRequired} />
              <Perks vacancy={vacancy} />
            </CardContent>
          </Card>

          <ContactsCard vacancy={vacancy} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete vacancy?"
        description={
          <>
            <span className="text-foreground font-medium">{vacancy.title}</span>{" "}
            will be permanently deleted. This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={deleteVacancy.isPending}
        onConfirm={remove}
      />
    </div>
  );
}

function StatusControls({
  status,
  pending,
  onChange,
}: {
  status: VacancyStatus;
  pending: boolean;
  onChange: (status: VacancyStatus) => void;
}) {
  const isActive = status === VACANCY_STATUS.ACTIVE;
  return (
    <>
      {isActive ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onChange(VACANCY_STATUS.PAUSED)}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Pause
        </Button>
      ) : (
        <Button
          variant="brand"
          size="sm"
          disabled={pending}
          onClick={() => onChange(VACANCY_STATUS.ACTIVE)}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Publish
        </Button>
      )}
      {status !== VACANCY_STATUS.FILLED ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onChange(VACANCY_STATUS.FILLED)}
        >
          Mark filled
        </Button>
      ) : null}
    </>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[] | null;
}) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-foreground/90 list-disc space-y-1.5 pl-5 text-sm">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function TagFact({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="max-w-full font-normal whitespace-normal break-words"
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Perks({ vacancy }: { vacancy: Vacancy }) {
  const perks = [
    vacancy.housingProvided ? "Housing provided" : null,
    vacancy.visaSponsorshipAvailable ? "Visa sponsorship" : null,
    vacancy.relocationAssistance ? "Relocation assistance" : null,
  ].filter(Boolean) as string[];
  if (perks.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <span className="text-muted-foreground">Perks</span>
      <div className="flex flex-wrap gap-1.5">
        {perks.map((perk) => (
          <Badge
            key={perk}
            variant="success"
            className="max-w-full font-normal whitespace-normal break-words"
          >
            {perk}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ContactsCard({ vacancy }: { vacancy: Vacancy }) {
  const contacts: { label: string; value: string; href?: string }[] = [
    vacancy.hrEmail
      ? { label: "Email", value: vacancy.hrEmail, href: `mailto:${vacancy.hrEmail}` }
      : null,
    vacancy.hrPhone ? { label: "Phone", value: vacancy.hrPhone } : null,
    vacancy.hrWhatsapp ? { label: "WhatsApp", value: vacancy.hrWhatsapp } : null,
    vacancy.hrTelegram ? { label: "Telegram", value: vacancy.hrTelegram } : null,
    vacancy.hrLinkedin
      ? { label: "LinkedIn", value: vacancy.hrLinkedin, href: vacancy.hrLinkedin }
      : null,
    vacancy.applicationUrl
      ? { label: "Apply URL", value: vacancy.applicationUrl, href: vacancy.applicationUrl }
      : null,
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  if (contacts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {contacts.map((contact) => (
          <div key={contact.label} className="flex justify-between gap-3">
            <span className="text-muted-foreground shrink-0">
              {contact.label}
            </span>
            {contact.href ? (
              <a
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                className="text-brand min-w-0 truncate text-right hover:underline"
              >
                {contact.value}
              </a>
            ) : (
              <span className="min-w-0 truncate text-right font-medium">
                {contact.value}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
