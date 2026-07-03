"use client";

import { useState } from "react";

import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { CompanySetupModal } from "./company-setup-modal";
import { VerifyStatusModal } from "./verify-status-modal";

/**
 * App-wide employer verification gate. Mounted once in the app shell so it
 * overlays every employer surface (AI search lives outside the (employer) route
 * group, so a layout-scoped gate would miss it):
 *
 *  - no company yet → a non-dismissible setup modal blocks the whole app;
 *  - just submitted → a "submitted for verification" confirmation.
 *
 * The pending state itself surfaces as a banner on the Vacancies screen (and
 * blocks posting there); this component only owns the forced/confirmation modals.
 */
export function EmployerVerifyGate() {
  const { applies, status, submit, submitting } = useEmployerVerify();
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (!applies) return null;

  if (status === "none") {
    return (
      <CompanySetupModal
        submitting={submitting}
        onSubmit={async (form) => {
          await submit(form);
          setJustSubmitted(true);
        }}
      />
    );
  }

  if (justSubmitted && status === "pending") {
    return (
      <VerifyStatusModal
        kind="submitted"
        onClose={() => setJustSubmitted(false)}
      />
    );
  }

  return null;
}
