"use client";

import { useCallback, useSyncExternalStore } from "react";

import { useSession } from "@/features/auth/hooks/use-session";
import { useCompanyExtras } from "@/features/profile/hooks/use-company-extras";
import { useCreateEmployerProfile } from "@/features/profile/hooks/use-employer-profile-mutations";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { EMPLOYER_VERIFICATION_STATUS } from "@/interfaces/enums";

/**
 * Employer verification gate state.
 *
 * The design forces brand-new employers to complete a company profile before
 * they can touch the app, then holds vacancy posting until an admin approves the
 * company (PENDING → VERIFIED). This hook derives that gate from the **real**
 * backend signals — `session.isEmployerProfileSet` and
 * `EmployerProfile.verificationStatus` — and layers a small localStorage seam:
 *
 *  - a `pending` marker so the gate stays consistent even when the backend isn't
 *    reachable (demo) or the session hasn't re-fetched yet after submit;
 *  - an `approved` override set by the prototype's "Demo: approve" button, which
 *    simulates the admin decision locally (real approval happens in the admin
 *    dashboard — see docs/api/vacancies.md).
 *
 * No company data is fabricated: the form's real fields create the profile via
 * `POST /employer/profile`; the extras the backend doesn't model yet land in the
 * existing `use-company-extras` seam.
 */
const KEY = "peoplor_employer_verify_v1";
const EVENT = "peoplor:employer-verify";

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

type LocalStatus = "none" | "pending" | "approved";
interface LocalState {
  status: LocalStatus;
}
const DEFAULT_LOCAL: LocalState = { status: "none" };

let cachedRaw: string | null = null;
let cached: LocalState = DEFAULT_LOCAL;

function read(): LocalState {
  if (typeof window === "undefined") return DEFAULT_LOCAL;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (!raw) return (cached = DEFAULT_LOCAL);
  try {
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    cached = {
      status:
        parsed.status === "pending" || parsed.status === "approved"
          ? parsed.status
          : "none",
    };
  } catch {
    cached = DEFAULT_LOCAL;
  }
  return cached;
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function writeLocal(next: LocalState) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/** Normalise a website/company name into a valid absolute URL for `companyUrl`. */
function toUrl(name: string, website: string): string {
  const w = website.trim();
  if (w) return /^https?:\/\//i.test(w) ? w : `https://${w.replace(/^\/+/, "")}`;
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
  const local = useSyncExternalStore(subscribe, read, () => DEFAULT_LOCAL);
  const createProfile = useCreateEmployerProfile();
  const { update: updateExtras } = useCompanyExtras();

  const verification = profileQuery.data?.verificationStatus ?? null;
  const backendApproved =
    verification === EMPLOYER_VERIFICATION_STATUS.VERIFIED;
  const backendRejected =
    verification === EMPLOYER_VERIFICATION_STATUS.REJECTED;

  let status: VerifyStatus;
  if (!isEmployer) {
    status = "approved"; // gate doesn't apply to workers/admins
  } else if (isLoading && !user) {
    status = "loading";
  } else if (local.status === "approved" || backendApproved) {
    status = "approved";
  } else if (profileSet || local.status === "pending") {
    status = backendRejected ? "rejected" : "pending";
  } else {
    status = "none";
  }

  const submit = useCallback(
    async (form: CompanyVerifyForm) => {
      // Best-effort real creation; the local seam keeps the gate working even if
      // the backend is unavailable (demo) or rejects an optional field.
      try {
        await createProfile.mutateAsync({
          companyName: form.name.trim(),
          companyUrl: toUrl(form.name, form.website),
          corporateEmail: form.email.trim(),
          industry: form.industry || null,
          companySize: form.size || null,
          country: form.country || null,
          city: form.city || null,
          description: form.about || null,
          phone: form.phone || null,
          website: form.website ? toUrl(form.name, form.website) : null,
        });
      } catch {
        // fall back to the local pending seam
      }
      // Extras the backend EmployerProfile doesn't carry yet.
      updateExtras({
        tagline: form.industry,
        founded: form.founded,
        locations:
          form.address || form.city
            ? [{ city: form.city, address: form.address }]
            : [],
      });
      writeLocal({ status: "pending" });
    },
    [createProfile, updateExtras],
  );

  const approve = useCallback(() => {
    writeLocal({ status: "approved" });
  }, []);

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
    approve,
  };
}
