import type { WorkerProfile } from "@/interfaces/worker-profile.interface";

/**
 * Mirrors the backend `hasUsableProfile` gate: a profile is usable for the AI
 * tools once it carries at least one substantive signal. Lets the UI gate before
 * spending a quota unit, instead of relying on a 422 round-trip.
 */
export function isProfileUsable(
  profile: WorkerProfile | undefined | null,
): boolean {
  if (!profile) return false;
  return Boolean(
    profile.profession ||
      profile.skills.length > 0 ||
      profile.experiences.length > 0 ||
      profile.education.length > 0,
  );
}

/** The profile sections still empty — shown in the completion prompt. */
export function profileGaps(
  profile: WorkerProfile | undefined | null,
): string[] {
  const gaps: string[] = [];
  if (!profile?.profession) gaps.push("Profession");
  if (!profile || profile.skills.length === 0) gaps.push("Skills");
  if (!profile || profile.experiences.length === 0) gaps.push("Work experience");
  if (!profile || profile.education.length === 0) gaps.push("Education");
  return gaps;
}
