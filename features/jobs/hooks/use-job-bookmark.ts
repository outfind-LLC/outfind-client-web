"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useAddBookmark,
  useBookmarks,
  useRemoveBookmark,
  useSaveExternalJob,
} from "@/features/bookmarks/hooks/use-bookmarks";
import type { JobCardData } from "@/features/chat/types/job";
import type { SaveExternalJobPayload } from "@/interfaces/engagement.interface";
import { useT } from "@/providers/i18n-provider";

/** The full external-job payload persisted the first time a live-web job is saved. */
export function toExternalPayload(job: JobCardData): SaveExternalJobPayload {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl ?? null,
    source: job.source ?? null,
    salary: job.salary,
    jobType: job.jobType,
    isRemote: job.isRemote,
    description: job.description,
    skills: job.skills,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    contact: job.contact,
  };
}

/**
 * Save-state + toggle for a single job, working for BOTH platform/DB-cached jobs
 * (bookmark by id) and live-web jobs (persist-then-bookmark). Shared by the job
 * card and the detail sheet so they stay in sync.
 */
export function useJobBookmark(job: JobCardData) {
  const t = useT();
  const bookmarks = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const saveExternal = useSaveExternalJob();

  const [resolvedId, setResolvedId] = useState<string | null>(job.id);
  const saved = Boolean(
    resolvedId && (bookmarks.data ?? []).some((b) => b.vacancyId === resolvedId),
  );
  const savePending =
    saveExternal.isPending || addBookmark.isPending || removeBookmark.isPending;

  const toggleSave = () => {
    if (savePending) return;
    if (resolvedId) {
      if (saved) removeBookmark.mutate(resolvedId);
      else addBookmark.mutate({ vacancyId: resolvedId });
    } else {
      saveExternal.mutate(toExternalPayload(job), {
        onSuccess: (bookmark) => setResolvedId(bookmark.vacancyId),
        onError: () => toast.error(t("chat.saveError")),
      });
    }
  };

  return { saved, savePending, toggleSave };
}
