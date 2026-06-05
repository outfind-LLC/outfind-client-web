"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles } from "lucide-react";

import { formatDateRange } from "@/lib/format";
import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import {
  LANGUAGE_PROFICIENCY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@/features/profile/constants/worker-profile.constants";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

interface WorkerCvViewProps {
  profile: WorkerProfile;
}

export function WorkerCvView({ profile }: WorkerCvViewProps) {
  const { user } = useSession();
  const name = user?.name ?? "Your Name";
  const email = user?.email ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <Link
          href={routes.profile}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <Download className="size-4" />
          <span className="hidden sm:inline">Download PDF</span>
        </Button>
      </div>

      {/* CV document */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          {/* CV header */}
          <div className="from-brand to-brand-2 bg-gradient-to-r px-6 py-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
                {profile.profession ? (
                  <p className="mt-0.5 text-sm text-white/80">
                    {profile.profession}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                  {email ? <span>{email}</span> : null}
                  {user?.telegramUsername ? (
                    <span>@{user.telegramUsername}</span>
                  ) : null}
                  {profile.currentCity || profile.currentCountry ? (
                    <span>
                      {[profile.currentCity, profile.currentCountry]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="size-14 shrink-0 rounded-full border-2 border-white/30 bg-white/20" />
            </div>
          </div>

          <div className="divide-y divide-border/50 p-6">
            {/* Summary */}
            {profile.summary ? (
              <CvSection title="Summary">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {profile.summary}
                </p>
              </CvSection>
            ) : null}

            {/* Experience */}
            {profile.experiences.length > 0 ? (
              <CvSection title="Experience">
                <div className="space-y-5">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id}>
                      <p className="font-semibold">
                        {exp.position}
                        {exp.employmentType
                          ? ` (${EMPLOYMENT_TYPE_LABELS[exp.employmentType] ?? exp.employmentType})`
                          : null}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {exp.companyName}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatDateRange(exp.startDate, exp.endDate)}
                        {exp.endDate === null
                          ? ""
                          : getDuration(exp.startDate, exp.endDate)}
                      </p>
                      {exp.description ? (
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      ) : null}
                      {exp.skills.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {exp.skills.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CvSection>
            ) : null}

            {/* Education */}
            {profile.education.length > 0 ? (
              <CvSection title="Education">
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="font-semibold">
                        {edu.degree ?? edu.fieldOfStudy ?? "Studies"}
                      </p>
                      {edu.institutionName ? (
                        <p className="text-muted-foreground text-sm">
                          {edu.institutionName}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground text-sm">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </CvSection>
            ) : null}

            {/* Languages */}
            {profile.languages.length > 0 ? (
              <CvSection title="Languages">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang) => (
                    <Badge
                      key={lang.id}
                      variant="secondary"
                      className="text-sm"
                    >
                      {lang.language} —{" "}
                      {LANGUAGE_PROFICIENCY_LABELS[lang.proficiency] ??
                        lang.proficiency}
                    </Badge>
                  ))}
                </div>
              </CvSection>
            ) : null}

            {/* Skills */}
            {profile.skills.length > 0 ? (
              <CvSection title="Skills">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CvSection>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed right-0 bottom-0 left-0 border-t bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          <Button variant="brand" size="lg" className="w-full" asChild>
            <Link href={routes.chat}>
              <Sparkles className="size-4" />
              Edit with AI
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CvSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="py-5 first:pt-0">
      <h2 className="text-primary mb-3 text-sm font-bold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

function getDuration(start: string, end: string | null): string {
  const from = new Date(start);
  const to = end ? new Date(end) : new Date();
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (months < 1) return "";
  if (months < 12) return ` · ${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return ` · ${years}yr${rem > 0 ? ` ${rem}mo` : ""}`;
}
