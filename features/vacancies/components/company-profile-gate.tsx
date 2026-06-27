"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, Loader2, Plus } from "lucide-react";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { Button } from "@/ui/button";

/**
 * Onboarding prompt shown to employers who haven't set up a company profile yet.
 * Posting and managing vacancies stays blocked until the profile exists, so we
 * guide them to create it instead of surfacing a confusing load error.
 */
export function CompanyProfileOnboarding() {
  return (
    <EmptyState
      icon={Building2}
      title="Complete your company profile to start posting jobs"
      description="Set up your company profile so candidates know who's hiring. You'll be able to post vacancies and review applicants right after."
      action={
        <Button asChild variant="brand" size="sm">
          <Link href={routes.company}>Create company profile</Link>
        </Button>
      }
    />
  );
}

/**
 * Gates employer vacancy flows behind a completed company profile. While the
 * session resolves it shows a spinner; without a profile it renders the guided
 * onboarding state; otherwise it renders the gated content.
 */
export function RequireCompanyProfile({ children }: { children: ReactNode }) {
  const { user, isLoading } = useSession();

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (!user.isEmployerProfileSet) return <CompanyProfileOnboarding />;

  return <>{children}</>;
}

/** "New vacancy" CTA that only appears once a company profile exists. */
export function NewVacancyButton() {
  const { user } = useSession();

  if (!user?.isEmployerProfileSet) return null;

  return (
    <Button asChild variant="brand" size="sm">
      <Link href={routes.vacancyNew}>
        <Plus className="size-4" />
        New vacancy
      </Link>
    </Button>
  );
}
