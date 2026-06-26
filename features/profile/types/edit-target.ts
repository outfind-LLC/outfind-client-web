import type {
  WorkerEducation,
  WorkerExperience,
  WorkerLanguage,
} from "@/interfaces/worker-profile.interface";

/** What the profile detail asked to edit. `soon` = a section whose editor needs a
 *  NEW backend field (header DOB / contact) — shown as a toast for now. The rest
 *  map to existing CRUD (see docs/api/profile.md). */
export type EditTarget =
  | { type: "identity" }
  | { type: "education"; item: WorkerEducation | null }
  | { type: "language"; item: WorkerLanguage | null }
  | { type: "experience"; item: WorkerExperience | null }
  | { type: "searchLocation" }
  | { type: "searchArea" }
  | { type: "driving" }
  | { type: "soon" };
