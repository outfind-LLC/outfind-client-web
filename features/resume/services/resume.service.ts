import { api } from "@/lib/api/client";
import type {
  CreateResumePayload,
  ResumeSummary,
  ResumeView,
  UpdateResumePayload,
} from "@/interfaces/resume.interface";

/**
 * Resume endpoints — DATA only. AI generation runs server-side from the stored
 * worker profile (in the worker's preferred app language); rendering is ours.
 */
export const resumeService = {
  list(): Promise<ResumeSummary[]> {
    return api.get<ResumeSummary[]>("/cv");
  },
  get(id: string): Promise<ResumeView> {
    return api.get<ResumeView>(`/cv/${id}`);
  },
  create(payload: CreateResumePayload): Promise<ResumeView> {
    return api.post<ResumeView>("/cv", payload);
  },
  update(id: string, payload: UpdateResumePayload): Promise<ResumeView> {
    return api.patch<ResumeView>(`/cv/${id}`, payload);
  },
  duplicate(id: string): Promise<ResumeView> {
    return api.post<ResumeView>(`/cv/${id}/duplicate`);
  },
  generate(id: string): Promise<ResumeView> {
    return api.post<ResumeView>(`/cv/${id}/generate`);
  },
  remove(id: string): Promise<{ id: string }> {
    return api.delete<{ id: string }>(`/cv/${id}`);
  },
};
