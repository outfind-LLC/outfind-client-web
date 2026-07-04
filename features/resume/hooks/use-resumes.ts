"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { resumeService } from "@/features/resume/services/resume.service";
import type {
  CreateResumePayload,
  ResumeView,
  UpdateResumePayload,
} from "@/interfaces/resume.interface";

/** The worker's resume list (manager) — full resumes so cards can preview. */
export function useResumes(enabled = true) {
  return useQuery<ResumeView[]>({
    queryKey: qk.resumes,
    queryFn: () => resumeService.list(),
    enabled,
  });
}

/** One resume (editor). */
export function useResume(id: string, enabled = true) {
  return useQuery<ResumeView>({
    queryKey: qk.resume(id),
    queryFn: () => resumeService.get(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateResumePayload) => resumeService.create(payload),
    onSuccess: (resume) => {
      queryClient.setQueryData(qk.resume(resume.id), resume);
      queryClient.invalidateQueries({ queryKey: qk.resumes });
    },
  });
}

/** Persist edits (used by the editor's autosave and toggles). */
export function useUpdateResume(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateResumePayload) =>
      resumeService.update(id, payload),
    onSuccess: (resume) => {
      queryClient.setQueryData(qk.resume(id), resume);
      queryClient.invalidateQueries({ queryKey: qk.resumes });
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeService.duplicate(id),
    onSuccess: (resume) => {
      queryClient.setQueryData(qk.resume(resume.id), resume);
      queryClient.invalidateQueries({ queryKey: qk.resumes });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.resumes }),
  });
}

/** AI-(re)fill a resume's content from the stored profile. */
export function useGenerateResume(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resumeService.generate(id),
    onSuccess: (resume: ResumeView) =>
      queryClient.setQueryData(qk.resume(id), resume),
  });
}
