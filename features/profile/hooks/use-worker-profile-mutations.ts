"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import {
  profileService,
  type UpdateJobSearchInfoInput,
  type UpdateProfileInfoInput,
  type ExperienceEntryInput,
  type EducationEntryInput,
  type LanguageInput,
} from "@/features/profile/services/profile.service";

function useInvalidateWorkerProfile() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: qk.workerProfile });
}

export function useUpdateJobSearchInfo() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (dto: UpdateJobSearchInfoInput) =>
      profileService.updateJobSearchInfo(dto),
    onSuccess: invalidate,
  });
}

export function useUpdateProfileInfo() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (dto: UpdateProfileInfoInput) =>
      profileService.updateProfileInfo(dto),
    onSuccess: invalidate,
  });
}

export function useUpsertLanguages() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (languages: LanguageInput[]) =>
      profileService.upsertLanguages(languages),
    onSuccess: invalidate,
  });
}

export function useDeleteLanguages() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (ids: string[]) => profileService.deleteLanguages(ids),
    onSuccess: invalidate,
  });
}

export function useCreateExperience() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (entry: ExperienceEntryInput) =>
      profileService.createExperiences([entry]),
    onSuccess: invalidate,
  });
}

export function useUpdateExperience() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<ExperienceEntryInput>;
    }) => profileService.updateExperience(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteExperience() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (id: string) => profileService.deleteExperiences([id]),
    onSuccess: invalidate,
  });
}

export function useCreateEducation() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (entry: EducationEntryInput) =>
      profileService.createEducation([entry]),
    onSuccess: invalidate,
  });
}

export function useUpdateEducation() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<EducationEntryInput>;
    }) => profileService.updateEducation(id, dto),
    onSuccess: invalidate,
  });
}

export function useDeleteEducation() {
  const invalidate = useInvalidateWorkerProfile();
  return useMutation({
    mutationFn: (id: string) => profileService.deleteEducation([id]),
    onSuccess: invalidate,
  });
}
