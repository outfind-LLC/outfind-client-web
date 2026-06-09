"use client";

import { Loader2 } from "lucide-react";

import { useSession } from "@/features/auth/hooks/use-session";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { EmployerProfileForm } from "@/features/profile/components/employer-profile-form";
import { Skeleton } from "@/ui/skeleton";

/** Resolves whether the employer is creating or editing, then renders the form. */
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
      <p className="text-muted-foreground text-sm">
        Only employer accounts can manage a company profile.
      </p>
    );
  }

  if (profileSet) {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (isError || !data) {
      return (
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load your profile. Please try again.
        </p>
      );
    }
    return <EmployerProfileForm profile={data} />;
  }

  return <EmployerProfileForm />;
}
