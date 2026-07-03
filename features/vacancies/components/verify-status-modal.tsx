"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { EvClock, EvShield } from "./verify-icons";
import s from "@/features/vacancies/styles/employer-verify.module.css";

export type StatusKind = "none" | "submitted" | "pending";

/**
 * The small centred status / gate modal (employer-verify.js `statusModal`):
 *  - `none`     — prompt to complete the company profile (Not now / Complete);
 *  - `submitted`— confirmation right after onboarding;
 *  - `pending`  — shown when a verification-gated action is attempted in review.
 * Approval happens admin-side (peoplor dashboard) — there is no local shortcut.
 */
export function VerifyStatusModal({
  kind,
  onClose,
  onComplete,
}: {
  kind: StatusKind;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const isNone = kind === "none";
  const title = isNone
    ? t("employerVerify.statusVerifyTitle")
    : kind === "submitted"
      ? t("employerVerify.statusSubmittedTitle")
      : t("employerVerify.statusReviewTitle");
  const body = isNone
    ? t("employerVerify.statusVerifyBody")
    : kind === "submitted"
      ? t("employerVerify.statusSubmittedBody")
      : t("employerVerify.statusReviewBody");

  return (
    <div
      className={cn(s["ev-scrim"], shown && s.show)}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn(s["ev-modal"], s["ev-modal-sm"])}>
        <div
          className={cn(
            s["ev-st-ic"],
            isNone ? s["ev-tone-accent"] : s["ev-tone-warn"],
          )}
        >
          {isNone ? <EvShield /> : <EvClock />}
        </div>
        <div className={s["ev-st-title"]}>{title}</div>
        <div className={s["ev-st-body"]}>{body}</div>
        <div className={s["ev-st-actions"]}>
          {isNone ? (
            <>
              <button
                type="button"
                className={cn(s["ev-btn"], s["ev-btn-ghost"])}
                onClick={onClose}
              >
                {t("employerVerify.statusNotNow")}
              </button>
              <button
                type="button"
                className={cn(s["ev-btn"], s["ev-btn-prim"])}
                onClick={() => {
                  onClose();
                  onComplete?.();
                }}
              >
                {t("employerVerify.statusComplete")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={cn(s["ev-btn"], s["ev-btn-prim"])}
              onClick={onClose}
            >
              {t("employerVerify.gotIt")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
