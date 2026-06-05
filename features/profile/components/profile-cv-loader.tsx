"use client";

import { Loader2 } from "lucide-react";

import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { WorkerCvView } from "./worker-cv-view";

export function ProfileCvLoader() {
  const { user, isWorker } = useSession();
  const query = useWorkerProfile(Boolean(isWorker));

  if (!user || query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (!query.data) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Could not load your CV. Please try again.
      </p>
    );
  }

  return <WorkerCvView profile={query.data} />;
}
