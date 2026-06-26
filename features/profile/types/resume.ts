/**
 * A résumé in the worker "My resumes" surface. The backend endpoint for these
 * (`/worker/profile/resumes`, see docs/api/profile.md §4.6) is NEW; until it
 * ships, the overview derives a single résumé from the worker profile (the typed
 * mock seam in `worker-profile-screen.tsx`). Swapping to the real list is a
 * one-line change.
 */
export interface Resume {
  id: string;
  title: string;
  specialization: string | null;
  salary: string | null;
  employment: string | null; // e.g. "Full-time · On-site"
  location: string | null;
  experience: string | null; // e.g. "8 years"
  isVisibleInSearch: boolean;
  updatedAt: string; // ISO
}
