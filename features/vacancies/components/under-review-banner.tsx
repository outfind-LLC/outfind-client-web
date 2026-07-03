"use client";

import { useI18n } from "@/providers/i18n-provider";
import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { EvClock } from "./verify-icons";
import s from "@/features/vacancies/styles/employer-verify.module.css";

/**
 * "Company under review" banner shown on the Vacancies screen while the company
 * is pending admin approval. Approval is an admin action (peoplor dashboard);
 * the employer simply waits — there is no local override.
 */
export function UnderReviewBanner() {
  const { isPending } = useEmployerVerify();
  const { t } = useI18n();

  if (!isPending) return null;

  return (
    <div className={s["ev-banner"]}>
      <span className={s["ev-banner-ic"]}>
        <EvClock />
      </span>
      <div className={s["ev-banner-main"]}>
        <div className={s["ev-banner-t"]}>
          {t("employerVerify.bannerTitle")}
        </div>
        <div className={s["ev-banner-d"]}>{t("employerVerify.bannerDesc")}</div>
      </div>
    </div>
  );
}
