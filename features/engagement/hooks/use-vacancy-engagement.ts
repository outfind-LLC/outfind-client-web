"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { engagementService } from "@/features/engagement/services/engagement.service";
import type { ReactionType } from "@/interfaces/enums";
import type { VacancyComment } from "@/interfaces/engagement.interface";

// ─── Reactions ────────────────────────────────────────────────────────────────

/** Set a like/dislike on a vacancy. */
export function useSetReaction() {
  return useMutation({
    mutationFn: (vars: { vacancyId: string; type: ReactionType }) =>
      engagementService.setReaction(vars.vacancyId, vars.type),
  });
}

/** Clear the caller's reaction on a vacancy. */
export function useClearReaction() {
  return useMutation({
    mutationFn: (vacancyId: string) =>
      engagementService.clearReaction(vacancyId),
  });
}

// ─── Comments ──────────────────────────────────────────────────────────────────

/** List comments on a vacancy (enabled once a vacancy id is known). */
export function useVacancyComments(vacancyId: string | null, enabled = true) {
  return useQuery<VacancyComment[]>({
    queryKey: qk.vacancyComments(vacancyId ?? ""),
    queryFn: () => engagementService.listComments(vacancyId as string),
    enabled: Boolean(vacancyId) && enabled,
  });
}

/** Post a comment, then refresh that vacancy's thread. */
export function useCreateComment(vacancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      engagementService.createComment(vacancyId, content),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: qk.vacancyComments(vacancyId),
      }),
  });
}

/** Delete the caller's own comment, then refresh that vacancy's thread. */
export function useDeleteComment(vacancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      engagementService.deleteComment(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: qk.vacancyComments(vacancyId),
      }),
  });
}
