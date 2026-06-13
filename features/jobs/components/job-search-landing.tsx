"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search } from "lucide-react";

import { routes } from "@/config/routes";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useSession } from "@/features/auth/hooks/use-session";
import { JobSearchModal } from "@/features/jobs/components/job-search-modal";
import { RecommendationsSection } from "@/features/recommendations/components/recommendations-section";
import { formatRelativeTime } from "@/lib/format";
import { AI_SPECIALIST } from "@/interfaces/enums";
import type { Conversation } from "@/interfaces/chat.interface";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

/** Common starting points so workers can search in one tap. */
const QUICK_PROFESSIONS = [
  "Driver",
  "Welder",
  "Nurse",
  "Construction Worker",
  "Warehouse Operative",
  "Electrician",
];

/**
 * Job Search tab landing (the worker's default surface). Opens a search modal —
 * automatically for first-time visitors — and lists saved past searches.
 */
export function JobSearchLanding() {
  const { user, isWorker } = useSession();
  const profileQuery = useWorkerProfile(Boolean(isWorker));
  const recentQuery = useConversations({ limit: 50 });

  const [seedProfession, setSeedProfession] = useState<string | null>(null);
  // `null` = follow the auto-open rule; once the user opens/closes it sticks.
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);

  const recentSearches = (recentQuery.data ?? []).filter(
    (conversation) => conversation.specialist === AI_SPECIALIST.JOB_FINDER,
  );

  // First-time experience: auto-surface the search modal once we know there are
  // no saved searches. Derived (not an effect) so there's no extra render pass.
  const autoOpen = recentQuery.isSuccess && recentSearches.length === 0;
  const modalOpen = openOverride ?? autoOpen;

  const openSearch = (profession: string | null = null) => {
    setSeedProfession(profession);
    setOpenOverride(true);
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <section className="flex flex-col items-center text-center">
        <span className="bg-brand/10 text-brand mb-4 flex size-12 items-center justify-center rounded-2xl">
          <Search className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {firstName ? `Find your next job, ${firstName}` : "Find your next job"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
          Tell us the role and where you want to work — we&apos;ll surface the
          best-matched opportunities and the people to contact.
        </p>

        <Button
          variant="brand"
          size="lg"
          className="mt-6"
          onClick={() => openSearch(null)}
        >
          <Search className="size-4" />
          Start a job search
        </Button>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {QUICK_PROFESSIONS.map((profession) => (
            <button
              key={profession}
              type="button"
              onClick={() => openSearch(profession)}
              className="border-border/70 hover:border-brand/40 hover:bg-brand/5 text-foreground/80 hover:text-foreground rounded-full border px-3 py-1.5 text-sm transition-colors"
            >
              {profession}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <RecommendationsSection enabled={Boolean(isWorker)} />
      </section>

      <section className="mt-10">
        <RecentSearches
          conversations={recentSearches}
          isLoading={recentQuery.isLoading}
        />
      </section>

      <JobSearchModal
        open={modalOpen}
        onOpenChange={setOpenOverride}
        defaultProfession={seedProfession ?? profileQuery.data?.profession ?? ""}
        defaultCity={profileQuery.data?.currentCity ?? ""}
      />
    </div>
  );
}

function RecentSearches({
  conversations,
  isLoading,
}: {
  conversations: Conversation[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <SectionLabel>Recent searches</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionLabel>Recent searches</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={routes.jobsThread(conversation.id)}
            className="group border-border/70 bg-card hover:border-brand/40 flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">
                {conversation.title ?? "Job search"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" />
                {conversation.lastMessageAt
                  ? formatRelativeTime(conversation.lastMessageAt)
                  : "Just now"}
              </p>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-brand size-4 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {children}
    </h2>
  );
}
