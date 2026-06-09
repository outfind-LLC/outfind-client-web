import { api } from "@/lib/api/client";
import type {
  EmployerSignalPayload,
  ReportEmployerPayload,
} from "@/interfaces/trust.interface";

/** Employer-trust service: reports and behaviour signals (worker-only). */
export const trustService = {
  async reportEmployer(payload: ReportEmployerPayload): Promise<null> {
    return api.post<null>("/employers/report", payload);
  },

  async submitSignal(
    employerId: string,
    payload: EmployerSignalPayload,
  ): Promise<null> {
    return api.post<null>(`/employers/${employerId}/signal`, payload);
  },
};
