"use client";

import { toast } from "sonner";

import { useI18n } from "@/providers/i18n-provider";
import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { EvClock } from "./verify-icons";
import s from "@/features/vacancies/styles/employer-verify.module.css";

/**
 * "Company under review" banner shown on the Vacancies screen while the company
 * is pending admin approval. The "Demo: approve" button simulates that admin
 * decision locally (see `useEmployerVerify`).
 */
export function UnderReviewBanner() {
  const { isPending, approve } = useEmployerVerify();
  const { t } = useI18n();

  if (!isPending) return null;

  return (
    <div className={s["ev-banner"]}>
      <span className={s["ev-banner-ic"]}>
        <EvClock />
      </span>
      <div className={s["ev-banner-main"]}>
        <div className={s["ev-banner-t"]}>{t("employerVerify.bannerTitle")}</div>
        <div className={s["ev-banner-d"]}>{t("employerVerify.bannerDesc")}</div>
      </div>
      <button
        type="button"
        className={s["ev-banner-demo"]}
        onClick={() => {
          approve();
          toast.success(t("employerVerify.toastApproved"));
        }}
      >
        {t("employerVerify.bannerDemo")}
      </button>
    </div>
  );
}
