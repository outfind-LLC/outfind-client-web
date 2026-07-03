"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { useSession } from "@/features/auth/hooks/use-session";
import { useCreateEmployerProfile } from "@/features/profile/hooks/use-employer-profile-mutations";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { EMPLOYER_VERIFICATION_STATUS } from "@/interfaces/enums";

/**
 * Employer verification gate state — fully backend-driven.
 *
 * The design forces brand-new employers to complete a company profile before
 * they can touch the app, then holds vacancy posting until an admin approves the
 * company (PENDING → VERIFIED). This hook derives that gate entirely from the
 * backend: `session.isEmployerProfileSet` + `EmployerProfile.verificationStatus`.
 * Nothing is persisted client-side. Approval is an admin action (peoplor
 * dashboard); it is NOT simulated locally.
 *
 * Onboarding submits the real company profile via `POST /employer/profile` with
 * the full field set (tax id, tagline, founded year, HQ address, contact) — no
 * data is stored in localStorage.
 */

/** The verify form's fields (a superset of the create DTO). */
export interface CompanyVerifyForm {
  name: string;
  regId: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  country: string;
  city: string;
  address: string;
  contactName: string;
  email: string;
  phone: string;
  about: string;
}

/** Normalise a website/company name into a valid absolute URL for `companyUrl`. */
function toUrl(name: string, website: string): string {
  const w = website.trim();
  if (w)
    return /^https?:\/\//i.test(w) ? w : `https://${w.replace(/^\/+/, "")}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `https://${slug || "company"}.com`;
}

export type VerifyStatus =
  | "loading"
  | "none"
  | "pending"
  | "rejected"
  | "approved";

export function useEmployerVerify() {
  const { isEmployer, user, isLoading } = useSession();
  const profileSet = Boolean(user?.isEmployerProfileSet);
  const profileQuery = useEmployerProfile(Boolean(isEmployer && profileSet));
  const createProfile = useCreateEmployerProfile();
  const queryClient = useQueryClient();

  const verification = profileQuery.data?.verificationStatus ?? null;

  let status: VerifyStatus;
  if (!isEmployer) {
    status = "approved"; // gate doesn't apply to workers/admins
  } else if (isLoading && !user) {
    status = "loading";
  } else if (verification === EMPLOYER_VERIFICATION_STATUS.VERIFIED) {
    status = "approved";
  } else if (verification === EMPLOYER_VERIFICATION_STATUS.REJECTED) {
    status = "rejected";
  } else if (verification) {
    status = "pending"; // PENDING (or any non-terminal backend status)
  } else if (profileSet) {
    status = "pending"; // profile exists; its status row is still loading
  } else {
    status = "none";
  }

  const submit = useCallback(
    async (form: CompanyVerifyForm) => {
      const foundedYear = Number.parseInt(form.founded.trim(), 10);
      const created = await createProfile.mutateAsync({
        companyName: form.name.trim(),
        companyUrl: toUrl(form.name, form.website),
        corporateEmail: form.email.trim(),
        taxId: form.regId.trim() || null,
        industry: form.industry || null,
        companySize: form.size || null,
        foundedYear: Number.isFinite(foundedYear) ? foundedYear : null,
        country: form.country || null,
        city: form.city || null,
        registeredAddress: form.address.trim() || null,
        contactName: form.contactName.trim() || null,
        description: form.about || null,
        phone: form.phone || null,
        website: form.website ? toUrl(form.name, form.website) : null,
      });
      // Seed the profile cache so the gate flips to "pending" immediately, before
      // the session refetch that flips `isEmployerProfileSet` lands.
      queryClient.setQueryData(qk.employerProfile, created);
    },
    [createProfile, queryClient],
  );

  return {
    /** Whether the gate applies at all (employer accounts only). */
    applies: isEmployer,
    status,
    isApproved: status === "approved",
    needsOnboarding: status === "none",
    isPending: status === "pending",
    isRejected: status === "rejected",
    submit,
    submitting: createProfile.isPending,
  };
}
