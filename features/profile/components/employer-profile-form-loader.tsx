"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Container } from "@/components/container";
import { useSession } from "@/features/auth/hooks/use-session";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { EmployerCompanyView } from "@/features/profile/components/employer-company-view";
import { EmployerProfileForm } from "@/features/profile/components/employer-profile-form";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Company profile: the prototype read view when a profile exists, the form when
 * creating or editing. Resolves create-vs-edit from the session + profile. */
export function EmployerProfileFormLoader() {
  const { user, isEmployer } = useSession();
  const profileSet = Boolean(user?.isEmployerProfileSet);
  const { data, isLoading, isError } = useEmployerProfile(profileSet);
  const [editing, setEditing] = useState(false);

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
    if (!editing) {
      return (
        <EmployerCompanyView profile={data} onEdit={() => setEditing(true)} />
      );
    }
    return (
      <Container className="max-w-3xl py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => setEditing(false)}
        >
          <ArrowLeft className="size-4" />
          Back to profile
        </Button>
        <EmployerProfileForm profile={data} />
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-8">
      <EmployerProfileForm />
    </Container>
  );
}
