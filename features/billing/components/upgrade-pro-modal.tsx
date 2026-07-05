"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { useMyAccess } from "@/features/billing/hooks/use-my-access";
import { usePublicPricing } from "@/features/billing/hooks/use-pricing";
import { useUpgradeProStore } from "@/features/billing/store/upgrade-pro.store";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import { PLAN_AUDIENCE, PLAN_TYPE } from "@/interfaces/enums";
import { cn } from "@/lib/utils";
import s from "@/features/billing/styles/upgrade-pro.module.css";

/** The four Pro features listed in the modal (all powered by frontier AI). */
const PRO_FEATURES: { id: string; labelKey: MessageKey }[] = [
  { id: "cv", labelKey: "pro.featCv" },
  { id: "search", labelKey: "pro.featSearch" },
  { id: "assistant", labelKey: "pro.featAssistant" },
  { id: "visa", labelKey: "pro.featVisa" },
];

/** Which listed row a triggering feature key highlights. */
const FEATURE_ROW: Record<string, string> = {
  ai_cv_builder: "cv",
  cv_limit: "cv",
  ai_job_search: "search",
  ai_assistant: "assistant",
  ai_messages_monthly: "assistant",
  visa_guidance: "visa",
};

/** "$5" / "$4.99" — always derived from API data, never hardcoded. */
function formatUsd(priceUsd: number): string {
  return `$${Number.isInteger(priceUsd) ? priceUsd : priceUsd.toFixed(2)}`;
}

/**
 * "Included with Pro" upsell — the single global modal (mounted once in the app
 * shell, opened via `useUpgradeProStore`) shown whenever a locked feature is
 * tapped or an API call returns 403 FEATURE_LOCKED / LIMIT_REACHED. Bottom
 * sheet on mobile, centered card on desktop. Price comes live from
 * `GET /me/access` (fallback: the public pricing catalog).
 */
export function UpgradeProModal() {
  const t = useT();
  const router = useRouter();
  const open = useUpgradeProStore((st) => st.open);
  const feature = useUpgradeProStore((st) => st.feature);
  const close = useUpgradeProStore((st) => st.close);

  const access = useMyAccess();
  // Fallback price source: the public worker catalog's Pro plan.
  const pricing = usePublicPricing(PLAN_AUDIENCE.WORKER);

  // Esc to close + body scroll lock while open (matches the wizard modals).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  if (!open) return null;

  const proPlan = pricing.data?.find(
    (plan) => plan.planType === PLAN_TYPE.PRO,
  );
  const priceUsd =
    access.data?.plan?.priceUsd ??
    (proPlan ? proPlan.priceMonthlyCents / 100 : null);

  const highlighted = feature ? FEATURE_ROW[feature] : undefined;

  const upgrade = () => {
    close();
    router.push(routes.upgrade);
  };

  return (
    <div
      className={s.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("pro.title")}
      >
        <div className={s.head}>
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("pro.notNow")}
            onClick={close}
          >
            <Ic name="close" />
          </button>
        </div>

        <div className={s.body}>
          <span className={s.lockBadge} aria-hidden="true">
            <Ic name="lock" className={s.lockIc} />
          </span>
          <h2 className={s.title}>{t("pro.title")}</h2>
          <p className={s.subtitle}>{t("pro.subtitle")}</p>

          <ul className={s.features}>
            {PRO_FEATURES.map(({ id, labelKey }) => (
              <li
                key={id}
                className={cn(s.feature, highlighted === id && s.featureHl)}
              >
                <Ic name="checkBold" className={s.checkIc} />
                {t(labelKey)}
              </li>
            ))}
          </ul>

          {priceUsd != null ? (
            <div className={s.price}>
              <span className={s.priceValue}>{formatUsd(priceUsd)}</span>
              <span className={s.priceInterval}>{t("pro.oneTime")}</span>
            </div>
          ) : null}
          {/* Local-currency equivalent for Uzbekistan (Click checkout).
              TODO: serve from plan config once the Click gateway lands. */}
          <p className={s.priceUzs}>{t("pro.priceUzs")}</p>
          <p className={s.priceNote}>{t("pro.priceNote")}</p>
        </div>

        <div className={s.foot}>
          <button type="button" className={s.cta} onClick={upgrade}>
            {t("pro.upgradeCta")}
            <Ic name="arrowRight" />
          </button>
          <button type="button" className={s.ghost} onClick={close}>
            {t("pro.notNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
