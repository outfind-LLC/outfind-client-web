"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { routes } from "@/config/routes";
import {
  useDeleteEmployerProfile,
  useSetEmployerProfileActive,
} from "@/features/profile/hooks/use-employer-profile-mutations";
import {
  EMPLOYER_VERIFICATION_STATUS,
  type EmployerVerificationStatus,
} from "@/interfaces/enums";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Switch } from "@/ui/switch";

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

/** Read + manage view of the employer / company profile. */
export function EmployerProfileView({ profile }: { profile: EmployerProfile }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const setActive = useSetEmployerProfileActive();
  const deleteProfile = useDeleteEmployerProfile();

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const verification = VERIFICATION_META[profile.verificationStatus];
  const isRejected =
    profile.verificationStatus === EMPLOYER_VERIFICATION_STATUS.REJECTED;

  const toggleActive = (checked: boolean) =>
    setActive.mutate(checked, {
      onSuccess: () =>
        toast.success(checked ? "Profile is now active" : "Profile hidden"),
      onError: () => toast.error("Couldn't update visibility"),
    });

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
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={routes.employerProfile}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
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

      {isRejected && profile.rejectionReason ? (
        <div className="border-destructive/40 bg-destructive/5 text-destructive flex gap-3 rounded-xl border p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Verification was rejected</p>
            <p className="text-destructive/90">{profile.rejectionReason}</p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-medium">Profile active</p>
            <p className="text-muted-foreground text-xs">
              When off, your company and its vacancies are hidden from
              candidates.
            </p>
          </div>
          <Switch
            checked={profile.isActive}
            onCheckedChange={toggleActive}
            disabled={setActive.isPending}
            aria-label="Toggle profile visibility"
          />
        </CardContent>
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

      <ContactsCard profile={profile} />

      <div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          disabled={deleteProfile.isPending}
        >
          <Trash2 className="size-4" />
          Delete company profile
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete company profile?"
        description="Your company profile will be permanently removed. This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteProfile.isPending}
        onConfirm={() =>
          deleteProfile.mutate(undefined, {
            onSuccess: () => {
              toast.success("Company profile deleted");
              setDeleteOpen(false);
            },
            onError: () => toast.error("Couldn't delete the profile"),
          })
        }
      />
    </div>
  );
}

function ContactsCard({ profile }: { profile: EmployerProfile }) {
  const rows: { icon: typeof Mail; label: string; value: string; href?: string }[] =
    [
      {
        icon: Mail,
        label: "Corporate email",
        value: profile.corporateEmail,
        href: `mailto:${profile.corporateEmail}`,
      },
      profile.phone
        ? { icon: Phone, label: "Phone", value: profile.phone }
        : null,
      {
        icon: Globe,
        label: "Company URL",
        value: profile.companyUrl,
        href: profile.companyUrl,
      },
      profile.website
        ? {
            icon: Globe,
            label: "Website",
            value: profile.website,
            href: profile.website,
          }
        : null,
    ].filter(Boolean) as {
      icon: typeof Mail;
      label: string;
      value: string;
      href?: string;
    }[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center gap-3">
              <Icon className="text-muted-foreground size-4 shrink-0" />
              <span className="text-muted-foreground w-32 shrink-0">
                {row.label}
              </span>
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand truncate hover:underline"
                >
                  {row.value}
                </a>
              ) : (
                <span className="truncate font-medium">{row.value}</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
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
