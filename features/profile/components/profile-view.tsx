"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, UserRound } from "lucide-react";

import { routes } from "@/config/routes";
import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useEmployerProfile,
  useWorkerProfile,
} from "@/features/profile/hooks/use-profile";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { isApiClientError } from "@/lib/api/error";
import { Button } from "@/ui/button";
import { EmployerProfileView } from "./employer-profile-view";
import { WorkerProfileScreen } from "./worker-profile-screen";
import { WorkerProfileSetup } from "./worker-profile-setup";

/** Resolves the right profile for the session's account type. The worker profile
 * is the full-bleed pixel-perfect screen; setup / employer / errors keep the
 * standard padded shell. */
export function ProfileView() {
  const { user, isWorker, isEmployer } = useSession();

  const workerQuery = useWorkerProfile(Boolean(isWorker));
  const employerQuery = useEmployerProfile(
    Boolean(isEmployer && user?.isEmployerProfileSet),
  );

  if (!user) {
    return (
      <Shell>
        <CenteredSpinner />
      </Shell>
    );
  }

  if (isWorker) {
    // Full-bleed pixel-perfect screen (its own topbar + scroll).
    if (workerQuery.data)
      return <WorkerProfileScreen profile={workerQuery.data} user={user} />;
    if (workerQuery.isError) {
      const notFound =
        isApiClientError(workerQuery.error) &&
        workerQuery.error.status === 404;
      return (
        <Shell>{notFound ? <WorkerProfileSetup /> : <ProfileError />}</Shell>
      );
    }
    return (
      <Shell>
        <CenteredSpinner />
      </Shell>
    );
  }

  if (isEmployer) {
    return (
      <Shell>
        {!user.isEmployerProfileSet ? (
          <EmployerProfileNotSet />
        ) : employerQuery.isLoading ? (
          <CenteredSpinner />
        ) : employerQuery.data ? (
          <EmployerProfileView profile={employerQuery.data} />
        ) : (
          <ProfileError />
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <ProfileError />
    </Shell>
  );
}

/** The standard padded profile shell (used for setup / employer / states). */
function Shell({ children }: { children: ReactNode }) {
  return (
    <Container className="py-8">
      <PageHeader
        icon={UserRound}
        title="Profile"
        description="How you appear across Peoplor."
      />
      {children}
    </Container>
  );
}

function EmployerProfileNotSet() {
  return (
    <EmptyState
      icon={UserRound}
      title="Set up your company profile"
      description="Add your company details to start posting vacancies and hiring."
      action={
        <Button asChild variant="brand" size="sm">
          <Link href={routes.company}>Create company profile</Link>
        </Button>
      }
    />
  );
}

function ProfileError() {
  return (
    <p className="text-muted-foreground text-sm">
      Couldn&apos;t load your profile. Please try again.
    </p>
  );
}

function CenteredSpinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="text-muted-foreground size-5 animate-spin" />
    </div>
  );
}
