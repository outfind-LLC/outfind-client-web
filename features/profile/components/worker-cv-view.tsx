"use client";

import Link from "next/link";
import { ArrowLeft, Download, PenLine } from "lucide-react";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import { Button } from "@/ui/button";
import { CvDocument, type CvPerson } from "./cv-document";

interface WorkerCvViewProps {
  profile: WorkerProfile;
}

/** The worker's own CV at `/profile/cv` — identity from the session, with the
 * back-to-profile / download chrome and the "Edit your profile" footer CTA. */
export function WorkerCvView({ profile }: WorkerCvViewProps) {
  const { user } = useSession();

  const person: CvPerson = {
    name: user?.name ?? "Your Name",
    profession: profile.profession,
    email: user?.email ?? null,
    telegramUsername: user?.telegramUsername ?? null,
    city: profile.currentCity,
    country: profile.currentCountry,
  };

  return (
    <CvDocument
      person={person}
      data={profile}
      topbar={
        <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
          <Link
            href={routes.profile}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to profile
          </Link>
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
            <Download className="size-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      }
      footer={
        <div className="bg-background/95 fixed right-0 bottom-0 left-0 border-t px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <Button variant="brand" size="lg" className="w-full" asChild>
              <Link href={routes.profile}>
                <PenLine className="size-4" />
                Edit your profile
              </Link>
            </Button>
          </div>
        </div>
      }
    />
  );
}
