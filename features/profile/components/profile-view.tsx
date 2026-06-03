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
import { Button } from "@/ui/button";
import { EmployerProfileView } from "./employer-profile-view";
import { WorkerProfileView } from "./worker-profile-view";

/** Resolves the right profile for the session's account type. Profiles are built
 * conversationally, so an unset profile shows a "complete in chat" prompt. */
export function ProfileView() {
  const { user, isWorker, isEmployer } = useSession();

  const workerQuery = useWorkerProfile(
    Boolean(isWorker && user?.isWorkerProfileSet),
  );
  const employerQuery = useEmployerProfile(
    Boolean(isEmployer && user?.isEmployerProfileSet),
  );

  if (!user) {
    return <CenteredSpinner />;
  }

  if (isWorker) {
    if (!user.isWorkerProfileSet) return <ProfileNotSet />;
    if (workerQuery.isLoading) return <CenteredSpinner />;
    if (workerQuery.data)
      return <WorkerProfileView profile={workerQuery.data} />;
    return <ProfileError />;
  }

  if (isEmployer) {
    if (!user.isEmployerProfileSet) return <ProfileNotSet employer />;
    if (employerQuery.isLoading) return <CenteredSpinner />;
    if (employerQuery.data)
      return <EmployerProfileView profile={employerQuery.data} />;
    return <ProfileError />;
  }

  return <ProfileError />;
}

function ProfileNotSet({ employer }: { employer?: boolean }) {
  return (
    <EmptyState
      icon={UserRound}
      title="Your profile isn't complete yet"
      description={
        employer
          ? "Set up your company profile in chat to start posting vacancies."
          : "Build your profile in chat — the CV Builder will guide you step by step."
      }
      action={
        <Button asChild variant="brand" size="sm">
          <Link href={routes.chat}>Complete in chat</Link>
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
