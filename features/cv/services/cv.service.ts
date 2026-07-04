import { api } from "@/lib/api/client";
import type { CvView, UpdateCvPayload } from "@/interfaces/cv.interface";

/**
 * CV endpoints — data only. Generation runs server-side from the stored worker
 * profile (in the worker's preferred app language); rendering is ours.
 */
export const cvService = {
  /** The caller's CV, or null before the first generation. */
  async getMine(): Promise<CvView | null> {
    return api.get<CvView | null>("/cv/mine");
  },

  /** Generate (or regenerate) from the stored profile; persisted server-side. */
  async generate(): Promise<CvView> {
    return api.post<CvView>("/cv/generate");
  },

  /** Edit content / template / sharing. First publish mints the slug. */
  async update(payload: UpdateCvPayload): Promise<CvView> {
    return api.patch<CvView>("/cv/mine", payload);
  },
};
