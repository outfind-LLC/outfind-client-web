import { api } from "@/lib/api/client";
import type { MyAccess } from "@/interfaces/access.interface";

/**
 * Pro-access service — `GET /me/access` returns the caller's plan (the single
 * Pro plan with its current DB price) and the per-feature access map used to
 * render lock indicators client-side.
 */
export const accessService = {
  async getMyAccess(): Promise<MyAccess> {
    return api.get<MyAccess>("/me/access");
  },
};
