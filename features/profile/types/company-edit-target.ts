/**
 * Discriminated edit targets for the employer Company detail page — mirrors the
 * worker profile's `EditTarget`. Drives the `CompanyEditModal` dispatcher.
 */
export type CompanyEditTarget =
  | { type: "identity" }
  | { type: "about" }
  | { type: "contact"; field: "phone" | "website" }
  | { type: "field"; field: "industry" | "size" | "founded" | "hq" }
  | { type: "location"; index: number | null };
// "Post a job" is NOT an edit target — it opens the full Vacancy Wizard.
