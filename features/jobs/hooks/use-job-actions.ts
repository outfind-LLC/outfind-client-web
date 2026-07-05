"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useApplyToVacancy } from "@/features/applications/hooks/use-applications";
import { useChatPanelStore } from "@/features/applications/store/chat-panel.store";
import { handleFeatureLockedError } from "@/features/billing/lib/feature-locked";
import { useUpgradeProStore } from "@/features/billing/store/upgrade-pro.store";
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
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
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

  // The Apply button opens the cover-letter flow rather than applying directly.
  const openApplyDialog = () => {
    if (applied) return;
    setApplyDialogOpen(true);
  };
  const closeApplyDialog = () => setApplyDialogOpen(false);

  // Submit the application with an (optional) cover letter, then open the
  // freshly created conversation with that letter pinned as the first message.
  // `shareContact` is the candidate's consent to share contact details — sent as
  // the DIRECT send method, which the employer's candidate view reads to reveal
  // contact info (PLATFORM keeps the conversation on-platform only).
  const confirmApply = (coverLetter: string, shareContact = false) => {
    if (apply.isPending || applied) return;
    const trimmed = coverLetter.trim();
    apply.mutate(
      {
        vacancyId,
        payload: {
          coverLetter: trimmed || undefined,
          sendMethod: shareContact ? "DIRECT" : "PLATFORM",
        },
      },
      {
        onSuccess: (application) => {
          setApplied(true);
          setApplyDialogOpen(false);
          toast.success("Application sent");
          useChatPanelStore.getState().openThread({
            scope: "worker",
            applicationId: application.id,
            title: application.vacancy.title,
            subtitle: application.vacancy.companyName ?? undefined,
            coverLetter: trimmed || null,
          });
        },
        onError: (e) => {
          // 403 FEATURE_LOCKED / LIMIT_REACHED → the upgrade modal, not a toast.
          const openUpgrade = useUpgradeProStore.getState().openModal;
          if (handleFeatureLockedError(e, openUpgrade, "ai_job_search")) {
            setApplyDialogOpen(false);
            return;
          }
          toast.error(message(e, "Couldn't send the application"));
        },
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
    /** Opens the cover-letter dialog; kept named `applyToJob` for call sites. */
    applyToJob: openApplyDialog,
    applyDialogOpen,
    openApplyDialog,
    closeApplyDialog,
    confirmApply,
    react,
  };
}

export type JobActions = ReturnType<typeof useJobActions>;
