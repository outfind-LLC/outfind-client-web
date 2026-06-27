"use client";

import { Loader2 } from "lucide-react";

import { Container } from "@/components/container";
import { useSession } from "@/features/auth/hooks/use-session";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { EmployerCompanyScreen } from "@/features/profile/components/employer-company-screen";
import { EmployerProfileForm } from "@/features/profile/components/employer-profile-form";
import { Skeleton } from "@/ui/skeleton";

/**
 * Company route (`/profile/company`): the pixel-perfect company screen
 * (overview → detail with per-section edits + Post-a-job) when a profile exists;
 * the create form when it doesn't. The full-bleed screen owns its own topbar +
 * scroll, so it renders outside the padded `Container`.
 */
export function EmployerProfileFormLoader() {
  const { user, isEmployer } = useSession();
  const profileSet = Boolean(user?.isEmployerProfileSet);
  const { data, isLoading, isError } = useEmployerProfile(profileSet);

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <Container className="max-w-3xl py-8">
        <p className="text-muted-foreground text-sm">
          Only employer accounts can manage a company profile.
        </p>
      </Container>
    );
  }

  if (profileSet) {
    if (isLoading) {
      return (
        <Container className="max-w-3xl py-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </Container>
      );
    }
    if (isError || !data) {
      return (
        <Container className="max-w-3xl py-8">
          <p className="text-muted-foreground text-sm">
            Couldn&apos;t load your profile. Please try again.
          </p>
        </Container>
      );
    }
    return <EmployerCompanyScreen profile={data} />;
  }

  return (
    <Container className="max-w-3xl py-8">
      <EmployerProfileForm />
    </Container>
  );
}
