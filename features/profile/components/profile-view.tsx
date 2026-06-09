"use client";

import Link from "next/link";
import { Loader2, UserRound } from "lucide-react";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useEmployerProfile,
  useWorkerProfile,
} from "@/features/profile/hooks/use-profile";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { isApiClientError } from "@/lib/api/error";
import { Button } from "@/ui/button";
import { EmployerProfileView } from "./employer-profile-view";
import { WorkerProfileSetup } from "./worker-profile-setup";
import { WorkerProfileView } from "./worker-profile-view";

/** Resolves the right profile for the session's account type. A worker with no
 * profile yet gets a guided setup; an employer gets a create-profile CTA. */
export function ProfileView() {
  const { user, isWorker, isEmployer } = useSession();

  const workerQuery = useWorkerProfile(Boolean(isWorker));
  const employerQuery = useEmployerProfile(
    Boolean(isEmployer && user?.isEmployerProfileSet),
  );

  if (!user) {
    return <CenteredSpinner />;
  }

  if (isWorker) {
    if (workerQuery.data)
      return <WorkerProfileView profile={workerQuery.data} />;
    if (workerQuery.isError) {
      // A 404 means the worker simply hasn't set up a profile yet — guide them
      // through creating one. Any other error is a genuine load failure.
      const notFound =
        isApiClientError(workerQuery.error) &&
        workerQuery.error.status === 404;
      return notFound ? <WorkerProfileSetup /> : <ProfileError />;
    }
    return <CenteredSpinner />;
  }

  if (isEmployer) {
    if (!user.isEmployerProfileSet) return <EmployerProfileNotSet />;
    if (employerQuery.isLoading) return <CenteredSpinner />;
    if (employerQuery.data)
      return <EmployerProfileView profile={employerQuery.data} />;
    return <ProfileError />;
  }

  return <ProfileError />;
}

function EmployerProfileNotSet() {
  return (
    <EmptyState
      icon={UserRound}
      title="Set up your company profile"
      description="Add your company details to start posting vacancies and hiring."
      action={
        <Button asChild variant="brand" size="sm">
          <Link href={routes.employerProfile}>Create company profile</Link>
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
