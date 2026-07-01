"use client";

import type { ReactNode } from "react";

import { formatDateRange } from "@/lib/format";
import {
  EMPLOYMENT_TYPE_LABELS,
  LANGUAGE_PROFICIENCY_LABELS,
} from "@/features/profile/constants/worker-profile.constants";
import type {
  WorkerEducation,
  WorkerExperience,
  WorkerLanguage,
} from "@/interfaces/worker-profile.interface";
import { Badge } from "@/ui/badge";

/** Identity shown in the CV header — supplied by the caller, never the session,
 * so the same layout renders the logged-in worker *and* any candidate an
 * employer opens. */
export interface CvPerson {
  name: string;
  profession?: string | null;
  email?: string | null;
  telegramUsername?: string | null;
  city?: string | null;
  country?: string | null;
}

/** The résumé body — both `WorkerProfile` and `CandidateProfile` satisfy it. */
export interface CvData {
  summary?: string | null;
  experiences: WorkerExperience[];
  education: WorkerEducation[];
  languages: WorkerLanguage[];
  skills: string[];
}

interface CvDocumentProps {
  person: CvPerson;
  data: CvData;
  /** Sticky topbar (back/close + actions) — caller supplies for context. */
  topbar: ReactNode;
  /** Optional sticky footer CTA (e.g. the worker's "Edit profile"). */
  footer?: ReactNode;
}

/**
 * Presentational CV document — the brand-header résumé shared by the worker's
 * own CV (`/profile/cv`) and the employer's candidate CV viewer. Pure: it takes
 * identity + data as props and renders nothing session-specific, so an employer
 * never sees their own name on a candidate's résumé.
 */
export function CvDocument({ person, data, topbar, footer }: CvDocumentProps) {
  const location = [person.city, person.country].filter(Boolean).join(", ");

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {topbar}

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-24 sm:px-6">
        <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
          {/* CV header */}
          <div className="from-brand to-brand-2 bg-gradient-to-r px-6 py-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold break-words sm:text-2xl">
                  {person.name}
                </h1>
                {person.profession ? (
                  <p className="mt-0.5 text-sm break-words text-white/80">
                    {person.profession}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                  {person.email ? (
                    <span className="break-words">{person.email}</span>
                  ) : null}
                  {person.telegramUsername ? (
                    <span className="break-words">@{person.telegramUsername}</span>
                  ) : null}
                  {location ? (
                    <span className="break-words">{location}</span>
                  ) : null}
                </div>
              </div>
              <div className="size-14 shrink-0 rounded-full border-2 border-white/30 bg-white/20" />
            </div>
          </div>

          <div className="divide-border/50 divide-y p-6">
            {data.summary ? (
              <CvSection title="Summary">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {data.summary}
                </p>
              </CvSection>
            ) : null}

            {data.experiences.length > 0 ? (
              <CvSection title="Experience">
                <div className="space-y-5">
                  {data.experiences.map((exp) => (
                    <div key={exp.id} className="min-w-0">
                      <p className="font-semibold break-words">
                        {exp.position}
                        {exp.employmentType
                          ? ` (${EMPLOYMENT_TYPE_LABELS[exp.employmentType] ?? exp.employmentType})`
                          : null}
                      </p>
                      <p className="text-muted-foreground text-sm break-words">
                        {exp.companyName}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatDateRange(exp.startDate, exp.endDate)}
                        {exp.endDate === null
                          ? ""
                          : getDuration(exp.startDate, exp.endDate)}
                      </p>
                      {exp.description ? (
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed break-words">
                          {exp.description}
                        </p>
                      ) : null}
                      {exp.skills.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {exp.skills.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="max-w-full text-xs break-words whitespace-normal"
                            >
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

            {data.education.length > 0 ? (
              <CvSection title="Education">
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="min-w-0">
                      <p className="font-semibold break-words">
                        {edu.degree ?? edu.fieldOfStudy ?? "Studies"}
                      </p>
                      {edu.institutionName ? (
                        <p className="text-muted-foreground text-sm break-words">
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

            {data.languages.length > 0 ? (
              <CvSection title="Languages">
                <div className="flex flex-wrap gap-2">
                  {data.languages.map((lang) => (
                    <Badge
                      key={lang.id}
                      variant="secondary"
                      className="max-w-full text-sm break-words whitespace-normal"
                    >
                      {lang.language} —{" "}
                      {LANGUAGE_PROFICIENCY_LABELS[lang.proficiency] ??
                        lang.proficiency}
                    </Badge>
                  ))}
                </div>
              </CvSection>
            ) : null}

            {data.skills.length > 0 ? (
              <CvSection title="Skills">
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="max-w-full text-sm break-words whitespace-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CvSection>
            ) : null}
          </div>
        </div>
      </div>

      {footer}
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
      <h2 className="text-primary mb-3 text-sm font-bold tracking-wide uppercase">
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
