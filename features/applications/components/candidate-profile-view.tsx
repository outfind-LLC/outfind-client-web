"use client";

import { useState } from "react";

import {
  Briefcase,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  UserX,
  Video,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/user-avatar";
import { FormSection } from "@/components/form/form-fields";
import { useI18n } from "@/providers/i18n-provider";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import { useCandidateProfile } from "@/features/applications/hooks/use-candidate-profile";
import { CandidateCvOverlay } from "@/features/applications/components/candidate-cv-overlay";
import {
  useUpdateApplicationStatus,
  useVacancyApplicants,
} from "@/features/applications/hooks/use-applications";
import { APPLICATION_STATUS_META } from "@/features/applications/constants/status";
import {
  formatDateRange,
  formatRelativeTime,
} from "@/lib/format";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/interfaces/enums";
import type { CandidateProfile } from "@/interfaces/candidate-profile.interface";
import type { MatchScoreResult } from "@/interfaces/worker-ai.interface";
import type {
  WorkerEducation,
  WorkerExperience,
  WorkerLanguage,
} from "@/interfaces/worker-profile.interface";
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

interface CandidateProfileViewProps {
  vacancyId: string;
  applicationId: string;
}

/**
 * Full ATS-style candidate view. Base data (name, match score, cover letter,
 * status, dates) comes from the applicant-list cache so it always renders; the
 * rich profile (skills, experience, education, …) comes from a proposed endpoint
 * and lights up its sections when available, degrading quietly otherwise.
 */
export function CandidateProfileView({
  vacancyId,
  applicationId,
}: CandidateProfileViewProps) {
  const { t } = useI18n();
  const { data: applicants, isLoading: baseLoading } =
    useVacancyApplicants(vacancyId);
  const application = applicants?.find((item) => item.id === applicationId);
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileUnavailable,
  } = useCandidateProfile(applicationId);

  const openThread = useChatPanelStore((s) => s.openThread);
  const updateStatus = useUpdateApplicationStatus(vacancyId);
  const [cvOpen, setCvOpen] = useState(false);

  // Loading the base record for the first time (e.g. a deep link).
  if (baseLoading && !application && !profile) {
    return <CandidateSkeleton />;
  }

  if (!application && !profile) {
    return (
      <EmptyState
        icon={UserX}
        title={t("candidates.notFoundTitle")}
        description={t("candidates.notFoundDesc")}
      />
    );
  }

  // Merge: prefer the rich profile, fall back to the applicant-list record.
  const name =
    profile?.name ?? application?.applicant.name ?? t("candidates.fallbackName");
  const profession =
    profile?.profession ?? application?.applicant.profession ?? null;
  const photoUrl = profile?.photoUrl ?? application?.applicant.avatarUrl ?? null;
  const matchScore = profile?.matchScore ?? application?.matchScore ?? null;
  const coverLetter =
    profile?.coverLetter ?? application?.coverLetterOriginal ?? null;
  const status = profile?.status ?? application?.status ?? null;
  const appliedAt =
    profile?.appliedAt ?? application?.sentAt ?? application?.createdAt ?? null;
  const lastMessageAt = profile?.lastMessageAt ?? application?.lastMessageAt ?? null;
  const location = [profile?.currentCity, profile?.currentCountry]
    .filter(Boolean)
    .join(", ");
  // The structured-CV viewer only makes sense once the rich profile has content.
  const cvContent = Boolean(
    profile &&
      (profile.summary ||
        profile.experiences.length ||
        profile.education.length ||
        profile.languages.length ||
        profile.skills.length),
  );

  const onMessage = () =>
    openThread({
      scope: "employer",
      applicationId,
      title: name,
      subtitle: profession ?? undefined,
      coverLetter,
    });

  const setStatus = (next: ApplicationStatus) =>
    updateStatus.mutate(
      { applicationId, payload: { status: next } },
      {
        onSuccess: () => toast.success(t("candidates.statusUpdated")),
        onError: () => toast.error(t("candidates.statusError")),
      },
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card flex flex-col gap-5 rounded-xl border p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar
              name={name}
              avatarUrl={photoUrl}
              className="size-14 shrink-0 sm:size-16"
            />
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-xl leading-tight font-semibold break-words">
                {name}
              </h1>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="break-words">
                  {profession ?? t("candidates.fallbackName")}
                </span>
                {location ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    {location}
                  </span>
                ) : null}
              </div>
              {status ? (
                <Badge variant={APPLICATION_STATUS_META[status].variant}>
                  {APPLICATION_STATUS_META[status].label}
                </Badge>
              ) : null}
            </div>
          </div>

          {matchScore !== null ? <MatchGauge score={matchScore} /> : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="brand"
            onClick={onMessage}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="size-4" />
            {t("candidates.messageBtn")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={updateStatus.isPending}
                className="w-full sm:w-auto"
              >
                {t("candidates.setStatus")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t("candidates.moveTo")}</DropdownMenuLabel>
              {TRIAGE_STATUSES.map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setStatus(value)}
                  disabled={status === value}
                >
                  {APPLICATION_STATUS_META[value].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {cvContent ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCvOpen(true)}
              className="w-full sm:w-auto"
            >
              <FileText className="size-4" />
              {t("candidates.viewCv")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Rich profile sections — present only when the endpoint is live. */}
      {profileLoading ? (
        <CandidateSkeleton />
      ) : profile ? (
        <RichSections profile={profile} />
      ) : null}

      {/* Cover letter — available from the application itself. */}
      {coverLetter ? (
        <FormSection title={t("candidates.coverLetter")}>
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {coverLetter}
          </p>
        </FormSection>
      ) : null}

      {/* Application history — available from the application itself. */}
      <FormSection title={t("candidates.application")}>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {status ? (
            <Field
              label={t("candidates.statusField")}
              value={APPLICATION_STATUS_META[status].label}
            />
          ) : null}
          {appliedAt ? (
            <Field
              label={t("candidates.applied")}
              value={formatRelativeTime(appliedAt)}
            />
          ) : null}
          {lastMessageAt ? (
            <Field
              label={t("candidates.lastMessage")}
              value={formatRelativeTime(lastMessageAt)}
            />
          ) : null}
        </dl>
      </FormSection>

      {/* Quiet note when the rich profile can't be loaded. */}
      {profileUnavailable ? (
        <p className="text-muted-foreground text-center text-xs">
          {t("candidates.profileHint")}
        </p>
      ) : null}

      {cvOpen && profile ? (
        <CandidateCvOverlay
          candidate={profile}
          onClose={() => setCvOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** Rich sections rendered from the full candidate profile. */
function RichSections({ profile }: { profile: CandidateProfile }) {
  const { t } = useI18n();
  const salary = profile.expectedSalaryRange;
  const hasLinks = Boolean(profile.videoIntroUrl || profile.uploadedCvLink);

  return (
    <>
      {profile.summary ? (
        <FormSection title={t("candidates.about")}>
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {profile.summary}
          </p>
        </FormSection>
      ) : null}

      {profile.matchBreakdown ? (
        <MatchBreakdown breakdown={profile.matchBreakdown} />
      ) : null}

      {profile.skills.length > 0 ? (
        <FormSection title={t("candidates.skills")}>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </FormSection>
      ) : null}

      {profile.experiences.length > 0 ? (
        <FormSection title={t("candidates.experience")}>
          <ol className="space-y-5">
            {profile.experiences.map((item) => (
              <ExperienceRow key={item.id} item={item} />
            ))}
          </ol>
        </FormSection>
      ) : null}

      {profile.education.length > 0 ? (
        <FormSection title={t("candidates.education")}>
          <ol className="space-y-5">
            {profile.education.map((item) => (
              <EducationRow key={item.id} item={item} />
            ))}
          </ol>
        </FormSection>
      ) : null}

      {profile.languages.length > 0 ? (
        <FormSection title={t("candidates.languages")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {profile.languages.map((language) => (
              <LanguageRow key={language.id} language={language} />
            ))}
          </ul>
        </FormSection>
      ) : null}

      {salary ? (
        <FormSection title={t("candidates.expectedSalary")}>
          <p className="flex items-center gap-2 text-sm">
            <Wallet className="text-muted-foreground size-4 shrink-0" />
            {salary.currency} {salary.min.toLocaleString()} –{" "}
            {salary.max.toLocaleString()}
          </p>
        </FormSection>
      ) : null}

      {hasLinks ? (
        <FormSection title={t("candidates.portfolio")}>
          <div className="flex flex-col gap-2">
            {profile.uploadedCvLink ? (
              <LinkRow
                href={profile.uploadedCvLink}
                icon={<FileText className="size-4" />}
                label={t("candidates.resumeCv")}
              />
            ) : null}
            {profile.videoIntroUrl ? (
              <LinkRow
                href={profile.videoIntroUrl}
                icon={<Video className="size-4" />}
                label={t("candidates.videoIntro")}
              />
            ) : null}
          </div>
        </FormSection>
      ) : null}

      {profile.contact ? (
        <FormSection
          title={t("candidates.contact")}
          description={t("candidates.contactDesc")}
        >
          <div className="flex flex-col gap-2 text-sm">
            {profile.contact.email ? (
              <LinkRow
                href={`mailto:${profile.contact.email}`}
                icon={<Mail className="size-4" />}
                label={profile.contact.email}
              />
            ) : null}
            {profile.contact.phone ? (
              <LinkRow
                href={`tel:${profile.contact.phone}`}
                icon={<Phone className="size-4" />}
                label={profile.contact.phone}
              />
            ) : null}
            {profile.contact.website ? (
              <LinkRow
                href={profile.contact.website}
                icon={<Globe className="size-4" />}
                label={profile.contact.website}
              />
            ) : null}
          </div>
        </FormSection>
      ) : null}
    </>
  );
}

function MatchBreakdown({ breakdown }: { breakdown: MatchScoreResult }) {
  const { t } = useI18n();
  return (
    <FormSection title={t("candidates.aiMatch")}>
      {breakdown.summary ? (
        <p className="text-foreground/90 text-sm leading-relaxed">
          {breakdown.summary}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <SkillCloud
          title={t("candidates.matchingSkills")}
          items={breakdown.matchingSkills}
          variant="success"
        />
        <SkillCloud
          title={t("candidates.missingSkills")}
          items={breakdown.missingSkills}
          variant="warning"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BulletList title={t("candidates.strengths")} items={breakdown.strengths} />
        <BulletList
          title={t("candidates.areasToProbe")}
          items={breakdown.areasForImprovement}
        />
      </div>
    </FormSection>
  );
}

function SkillCloud({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "success" | "warning";
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant={variant} className="font-normal">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h4>
      <ul className="text-foreground/90 list-disc space-y-1 pl-4 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceRow({ item }: { item: WorkerExperience }) {
  return (
    <li className="flex gap-3">
      <Briefcase className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium break-words">{item.position}</p>
        <p className="text-muted-foreground text-sm break-words">
          {item.companyName}
          {item.domain ? ` · ${item.domain}` : ""}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatDateRange(item.startDate, item.endDate)}
        </p>
        {item.description ? (
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {item.description}
          </p>
        ) : null}
        {item.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function EducationRow({ item }: { item: WorkerEducation }) {
  const { t } = useI18n();
  const heading = [item.degree, item.fieldOfStudy].filter(Boolean).join(", ");
  return (
    <li className="flex gap-3">
      <GraduationCap className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium break-words">
          {heading || item.institutionName || t("candidates.education")}
        </p>
        {item.institutionName && heading ? (
          <p className="text-muted-foreground text-sm break-words">
            {item.institutionName}
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          {formatDateRange(item.startDate, item.endDate)}
        </p>
      </div>
    </li>
  );
}

function LanguageRow({ language }: { language: WorkerLanguage }) {
  return (
    <li className="flex items-center gap-2">
      <Languages className="text-muted-foreground size-4 shrink-0" />
      <span className="font-medium">{language.language}</span>
      <span className="text-muted-foreground">{language.proficiency}</span>
    </li>
  );
}

function LinkRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground hover:text-brand flex items-center gap-2 text-sm break-all transition-colors"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      {label}
    </a>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/** Circular match-score gauge. */
function MatchGauge({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="fill-none stroke-muted"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="fill-none stroke-brand"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <Sparkles className="text-brand mb-0.5 size-3" />
        <span className="text-sm font-semibold">{pct}%</span>
      </div>
    </div>
  );
}

function CandidateSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
