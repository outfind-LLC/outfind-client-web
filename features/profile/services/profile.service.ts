import { api } from "@/lib/api/client";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";

/** Profile API service. The worker and employer profiles are distinct resources;
 * the page picks one based on the session's account type. */
export const profileService = {
  async getWorkerProfile(): Promise<WorkerProfile> {
    return api.get<WorkerProfile>("/worker/profile");
  },

  async getEmployerProfile(): Promise<EmployerProfile> {
    return api.get<EmployerProfile>("/employer/profile");
  },
};
