import { api } from "@/lib/api/client";

import type {
  UpdateVisaPreferencePayload,
  VisaBootstrap,
  VisaChecklist,
  VisaPreference,
} from "@/features/visa/types";

/** Worker-facing visa-guide endpoints. */
export const visaService = {
  bootstrap: () => api.get<VisaBootstrap>("/worker/visa/bootstrap"),

  checklist: (key: string) =>
    api.get<VisaChecklist>(`/worker/visa/checklist/${encodeURIComponent(key)}`),

  preference: () => api.get<VisaPreference>("/worker/visa/preference"),

  savePreference: (payload: UpdateVisaPreferencePayload) =>
    api.put<VisaPreference>("/worker/visa/preference", payload),

  setDocumentCheck: (documentId: string, checked: boolean) =>
    api.put<{ documentId: string; checked: boolean }>(
      `/worker/visa/documents/${documentId}/check`,
      { checked },
    ),
};
