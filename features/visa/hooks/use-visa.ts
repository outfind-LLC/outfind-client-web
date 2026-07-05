"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { visaService } from "@/features/visa/services/visa.service";
import type {
  UpdateVisaPreferencePayload,
  VisaChecklist,
} from "@/features/visa/types";

const LIST_STALE = 10 * 60 * 1000; // reference data barely changes — cache long
const CHECKLIST_STALE = 5 * 60 * 1000;

/** Citizenships + destinations + professions for wizard steps 1–3. */
export function useVisaBootstrap(enabled = true) {
  return useQuery({
    queryKey: qk.visaBootstrap,
    queryFn: () => visaService.bootstrap(),
    staleTime: LIST_STALE,
    enabled,
  });
}

/** A destination's full checklist (only fetched once a country is chosen). */
export function useVisaChecklist(key: string | null, enabled = true) {
  return useQuery({
    queryKey: qk.visaChecklist(key ?? ""),
    queryFn: () => visaService.checklist(key as string),
    staleTime: CHECKLIST_STALE,
    enabled: enabled && Boolean(key),
  });
}

/** The user's saved citizenship → destination → profession. */
export function useVisaPreference(enabled = true) {
  return useQuery({
    queryKey: qk.visaPreference,
    queryFn: () => visaService.preference(),
    staleTime: CHECKLIST_STALE,
    enabled,
  });
}

export function useSaveVisaPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateVisaPreferencePayload) =>
      visaService.savePreference(payload),
    onSuccess: (pref) => queryClient.setQueryData(qk.visaPreference, pref),
  });
}

/**
 * Toggle a document's "ready" state with an optimistic patch of the cached
 * checklist (updates the doc + the progress counter), rolling back on error.
 */
export function useSetVisaDocumentCheck(checklistKey: string) {
  const queryClient = useQueryClient();
  const cacheKey = qk.visaChecklist(checklistKey);

  return useMutation({
    mutationFn: ({
      documentId,
      checked,
    }: {
      documentId: string;
      checked: boolean;
    }) => visaService.setDocumentCheck(documentId, checked),
    onMutate: async ({ documentId, checked }) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<VisaChecklist>(cacheKey);
      if (previous) {
        queryClient.setQueryData<VisaChecklist>(cacheKey, patchCheck(previous, documentId, checked));
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cacheKey, context.previous);
      }
    },
  });
}

function patchCheck(
  checklist: VisaChecklist,
  documentId: string,
  checked: boolean,
): VisaChecklist {
  let delta = 0;
  const sections = checklist.sections.map((section) => ({
    ...section,
    documents: section.documents.map((doc) => {
      if (doc.id !== documentId || doc.checked === checked) return doc;
      delta += checked ? 1 : -1;
      return { ...doc, checked };
    }),
  }));
  return {
    ...checklist,
    sections,
    progress: {
      ...checklist.progress,
      ready: Math.max(0, checklist.progress.ready + delta),
    },
  };
}
