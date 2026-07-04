"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { bookmarksService } from "@/features/bookmarks/services/bookmarks.service";
import type {
  Bookmark,
  BookmarkPayload,
  SaveExternalJobPayload,
} from "@/interfaces/engagement.interface";

/** Worker: list saved vacancies. */
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: qk.bookmarks,
    queryFn: () => bookmarksService.list(),
  });
}

/** Worker: save (bookmark) a vacancy by id. */
export function useAddBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { vacancyId: string; payload?: BookmarkPayload }) =>
      bookmarksService.add(vars.vacancyId, vars.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.bookmarks }),
  });
}

/** Worker: remove a bookmark by vacancy id. */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vacancyId: string) => bookmarksService.remove(vacancyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.bookmarks }),
  });
}

/** Worker: save a live-web job (persists it, then bookmarks the new row). */
export function useSaveExternalJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveExternalJobPayload) =>
      bookmarksService.saveExternal(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.bookmarks }),
  });
}
