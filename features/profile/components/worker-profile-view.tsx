"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  GraduationCap,
  Languages,
  MapPin,
  Sparkles,
} from "lucide-react";

import { formatDateRange } from "@/lib/format";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

/** Read view of the worker's profile (built conversationally in chat). */
export function WorkerProfileView({ profile }: { profile: WorkerProfile }) {
  const location = [profile.currentCity, profile.currentCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                {profile.profession ?? "Your profile"}
              </CardTitle>
              {location ? (
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5" />
                  {location}
                </p>
              ) : null}
            </div>
            <CompletenessRing value={profile.completenessScore} />
          </div>
        </CardHeader>
        {profile.summary ? (
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {profile.summary}
            </p>
          </CardContent>
        ) : null}
      </Card>

      {profile.skills.length > 0 ? (
        <Section icon={Sparkles} title="Skills">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {profile.languages.length > 0 ? (
        <Section icon={Languages} title="Languages">
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((language) => (
              <Badge key={language.id} variant="outline">
                {language.language} · {language.proficiency.toLowerCase()}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}

      {profile.experiences.length > 0 ? (
        <Section icon={Briefcase} title="Experience">
          <ul className="space-y-4">
            {profile.experiences.map((experience) => (
              <li key={experience.id} className="space-y-1">
                <p className="font-medium">{experience.position}</p>
                <p className="text-muted-foreground text-sm">
                  {experience.companyName} ·{" "}
                  {formatDateRange(experience.startDate, experience.endDate)}
                </p>
                {experience.description ? (
                  <p className="text-muted-foreground text-sm">
                    {experience.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {profile.education.length > 0 ? (
        <Section icon={GraduationCap} title="Education">
          <ul className="space-y-4">
            {profile.education.map((education) => (
              <li key={education.id} className="space-y-1">
                <p className="font-medium">
                  {education.degree ?? education.fieldOfStudy ?? "Studies"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {education.institutionName} ·{" "}
                  {formatDateRange(education.startDate, education.endDate)}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {profile.targetCountries.length > 0 ? (
        <Section icon={MapPin} title="Open to working in">
          <div className="flex flex-wrap gap-2">
            {profile.targetCountries.map((country) => (
              <Badge key={country} variant="outline">
                {country}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="text-primary size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CompletenessRing({ value }: { value: number }) {
  return (
    <div className="border-border/60 flex items-center gap-2 rounded-full border px-3 py-1.5">
      <span className="text-primary text-sm font-semibold">{value}%</span>
      <span className="text-muted-foreground text-xs">complete</span>
    </div>
  );
}
