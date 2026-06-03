"use client";

import Image from "next/image";
import { Building2, FileText, MapPin, ShieldCheck, Users } from "lucide-react";

import {
  EMPLOYER_VERIFICATION_STATUS,
  type EmployerVerificationStatus,
} from "@/interfaces/enums";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

const VERIFICATION_META: Record<
  EmployerVerificationStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  [EMPLOYER_VERIFICATION_STATUS.VERIFIED]: {
    label: "Verified",
    variant: "success",
  },
  [EMPLOYER_VERIFICATION_STATUS.PENDING]: {
    label: "Pending verification",
    variant: "warning",
  },
  [EMPLOYER_VERIFICATION_STATUS.REJECTED]: {
    label: "Verification rejected",
    variant: "destructive",
  },
};

/** Read view of the employer / company profile. */
export function EmployerProfileView({ profile }: { profile: EmployerProfile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const verification = VERIFICATION_META[profile.verificationStatus];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {profile.companyLogoUrl ? (
              <Image
                src={profile.companyLogoUrl}
                alt={profile.companyName}
                width={56}
                height={56}
                className="size-14 rounded-xl object-cover"
              />
            ) : (
              <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-xl">
                <Building2 className="size-6" />
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{profile.companyName}</CardTitle>
                <Badge variant={verification.variant} className="gap-1">
                  <ShieldCheck className="size-3" />
                  {verification.label}
                </Badge>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {profile.industry ? <span>{profile.industry}</span> : null}
                {location ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {location}
                  </span>
                ) : null}
                {profile.companySize ? (
                  <span>{profile.companySize}</span>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
        {profile.description ? (
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {profile.description}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Vacancies posted"
          value={profile.totalVacanciesPosted}
        />
        <StatCard
          icon={Users}
          label="Applications"
          value={profile.totalApplications}
        />
        <StatCard
          icon={ShieldCheck}
          label="Trust score"
          value={profile.trustScore}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-muted-foreground text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
