"use client";

import { useEffect } from "react";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useVisaModalStore } from "@/features/visa/store/visa-modal.store";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useI18n } from "@/providers/i18n-provider";
import s from "@/features/visa/styles/visa.module.css";

/**
 * Visa & work-permit guidance — worker only (the (worker) group layout guards
 * the audience; this route is full-bleed so it owns its header). Placeholder
 * screen: the detailed, country-aware visa walkthrough content is provided
 * later. Styled entirely with the app design tokens (no new UI system).
 */
export function VisaScreen() {
  const { t } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const openVisa = useVisaModalStore((st) => st.openModal);

  // Visiting /visa directly (deep link / refresh) opens the wizard over this
  // page; the sidebar item and search chip open it in place without navigating.
  useEffect(() => {
    openVisa();
  }, [openVisa]);

  const points: string[] = [
    t("visa.point1"),
    t("visa.point2"),
    t("visa.point3"),
  ];

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={s.menuBtn}
          aria-label={t("applications.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s.title}>{t("visa.title")}</div>
      </header>

      <div className={s.body}>
        <div className={s.hero}>
          <span className={s.heroIcon}>
            <Ic name="passport" />
          </span>
          <h1 className={s.heroTitle}>{t("visa.heroTitle")}</h1>
          <p className={s.heroDesc}>{t("visa.heroDesc")}</p>
          <span className={s.pill}>{t("visa.comingSoon")}</span>

          <ul className={s.points}>
            {points.map((point) => (
              <li key={point} className={s.point}>
                <Ic name="checkThin" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
