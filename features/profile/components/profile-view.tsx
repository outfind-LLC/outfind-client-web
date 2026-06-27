"use client";

import type { ReactNode } from "react";
import { Loader2, UserRound } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { isApiClientError } from "@/lib/api/error";
import { WorkerProfileScreen } from "./worker-profile-screen";
import { WorkerProfileSetup } from "./worker-profile-setup";

/**
 * Profile (`/profile`) — **worker only**. The route lives in the `(worker)` group,
 * whose layout redirects employers to their own surfaces, so this never renders
 * for an employer (the company profile is at `/company`). The worker screen is
 * full-bleed; setup / errors keep the standard padded shell.
 */
export function ProfileView() {
  const { user, isWorker } = useSession();
  const workerQuery = useWorkerProfile(Boolean(isWorker));

  if (!user) {
    return (
      <Shell>
        <CenteredSpinner />
      </Shell>
    );
  }

  // Non-workers (e.g. admins) have no résumé profile here.
  if (!isWorker) {
    return (
      <Shell>
        <ProfileError />
      </Shell>
    );
  }

  if (workerQuery.data) {
    return <WorkerProfileScreen profile={workerQuery.data} user={user} />;
  }
  if (workerQuery.isError) {
    const notFound =
      isApiClientError(workerQuery.error) && workerQuery.error.status === 404;
    return <Shell>{notFound ? <WorkerProfileSetup /> : <ProfileError />}</Shell>;
  }
  return (
    <Shell>
      <CenteredSpinner />
    </Shell>
  );
}

/** The standard padded profile shell (used for setup / error states). */
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
