"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { bookmarksService } from "@/features/bookmarks/services/bookmarks.service";
import type { Bookmark } from "@/interfaces/engagement.interface";

/** Worker: list saved vacancies. */
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: qk.bookmarks,
    queryFn: () => bookmarksService.list(),
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
