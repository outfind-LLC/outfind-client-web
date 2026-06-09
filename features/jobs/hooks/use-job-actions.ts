"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useApplyToVacancy } from "@/features/applications/hooks/use-applications";
import {
  useAddBookmark,
  useRemoveBookmark,
} from "@/features/bookmarks/hooks/use-bookmarks";
import {
  useClearReaction,
  useSetReaction,
} from "@/features/engagement/hooks/use-vacancy-engagement";
import { isApiClientError } from "@/lib/api/error";
import type { ReactionType } from "@/interfaces/enums";

function message(error: unknown, fallback: string): string {
  return isApiClientError(error) ? error.message : fallback;
}

/**
 * Composes the worker's actions on a single (internal) vacancy: save, apply, and
 * react. The AI job-search output doesn't carry the caller's existing
 * engagement state, so we track it locally and reflect each action optimistically
 * on success. Call once per job and share the result between the card and its
 * detail sheet so they stay in sync.
 */
export function useJobActions(vacancyId: string) {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [reaction, setReactionState] = useState<ReactionType | null>(null);

  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const apply = useApplyToVacancy();
  const setReaction = useSetReaction();
  const clearReaction = useClearReaction();

  const savePending = addBookmark.isPending || removeBookmark.isPending;
  const reactionPending = setReaction.isPending || clearReaction.isPending;

  const toggleSave = () => {
    if (savePending) return;
    if (saved) {
      removeBookmark.mutate(vacancyId, {
        onSuccess: () => setSaved(false),
        onError: (e) => toast.error(message(e, "Couldn't remove the bookmark")),
      });
    } else {
      addBookmark.mutate(
        { vacancyId },
        {
          onSuccess: () => {
            setSaved(true);
            toast.success("Saved to bookmarks");
          },
          onError: (e) => toast.error(message(e, "Couldn't save the job")),
        },
      );
    }
  };

  const applyToJob = () => {
    if (apply.isPending || applied) return;
    apply.mutate(
      { vacancyId, payload: { sendMethod: "PLATFORM" } },
      {
        onSuccess: () => {
          setApplied(true);
          toast.success("Application sent");
        },
        onError: (e) => toast.error(message(e, "Couldn't send the application")),
      },
    );
  };

  const react = (type: ReactionType) => {
    if (reactionPending) return;
    if (reaction === type) {
      clearReaction.mutate(vacancyId, {
        onSuccess: () => setReactionState(null),
        onError: (e) => toast.error(message(e, "Couldn't update your reaction")),
      });
    } else {
      setReaction.mutate(
        { vacancyId, type },
        {
          onSuccess: () => setReactionState(type),
          onError: (e) =>
            toast.error(message(e, "Couldn't update your reaction")),
        },
      );
    }
  };

  return {
    saved,
    applied,
    reaction,
    savePending,
    applyPending: apply.isPending,
    reactionPending,
    toggleSave,
    applyToJob,
    react,
  };
}

export type JobActions = ReturnType<typeof useJobActions>;
