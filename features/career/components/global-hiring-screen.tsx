"use client";

import { toast } from "sonner";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  COUNTRY_NAME,
  HIRING_MARKETS,
  MIGRATION_CANDIDATES,
  SUPPLY_LABEL,
} from "@/features/career/data/career.fixtures";
import { Ic } from "@/features/career/components/career-icons";
import { ScoreRing } from "@/features/career/components/score-ring";
import { useGlobalHiringState } from "@/features/career/hooks/use-career-state";
import s from "@/features/career/styles/career.module.css";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Employer "Global hiring" — pixel-perfect port of `career.js` (employer view):
 * "Hire across borders" intro + International Hiring toggle, top talent-market
 * country cards with a supply ring, and migration-ready candidates ranked by
 * compatibility. Shares the career CSS module. Data is the typed mock seam;
 * toggle/market persist locally. See `docs/api/career-and-global-hiring.md`.
 */
export function GlobalHiringScreen() {
  const { t, locale } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const { state, update } = useGlobalHiringState();

  return (
    <div className={s.screen}>
      <header className={s["cr-topbar"]}>
        <button
          type="button"
          className={cn(s["cr-iconbtn"], s["cr-menu"])}
          aria-label={t("career.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s["cr-title"]}>{t("nav.globalHiring")}</div>
      </header>

      <div className={s["cr-scroll"]}>
        <div className={s["cr-wrap"]}>
          {/* Intro + international hiring toggle */}
          <div className={s["cr-intro"]}>
            <div className={s["cr-intro-main"]}>
              <div className={s["cr-intro-h"]}>{t("career.ghIntroH")}</div>
              <div className={s["cr-intro-p"]}>{t("career.ghIntroP")}</div>
            </div>
            <div className={s["cr-toggle"]} data-on={state.intl ? "true" : "false"}>
              <div className={s["cr-toggle-tx"]}>
                <div className={s["cr-toggle-t"]}>{t("career.ghIntlT")}</div>
                <div className={s["cr-toggle-s"]}>
                  {state.intl ? t("career.ghIntlOn") : t("career.ghIntlOff")}
                </div>
              </div>
              <button
                type="button"
                className={s["cr-switch"]}
                role="switch"
                aria-checked={state.intl}
                aria-label={t("career.ghIntlT")}
                onClick={() => {
                  const next = !state.intl;
                  update({ intl: next });
                  toast(t(next ? "career.ghToastIntlOn" : "career.ghToastIntlOff"));
                }}
              />
            </div>
          </div>

          {/* Top talent markets */}
          <div className={s["cr-sec"]}>
            <div className={s["cr-sec-head"]}>
              <span className={s["cr-sec-h"]}>{t("career.marketsH")}</span>
              <span className={s["cr-sec-s"]}>{t("career.marketsS")}</span>
            </div>
            <div className={s["cr-countries"]}>
              {HIRING_MARKETS.map((co, i) => {
                const active = co.id === state.market;
                return (
                  <button
                    key={co.id}
                    type="button"
                    className={cn(
                      s["cr-country"],
                      i === 0 && s["is-top"],
                      active && s["is-active"],
                    )}
                    onClick={() => update({ market: co.id })}
                  >
                    <div className={s["cr-c-top"]}>
                      <span className={s["cr-c-flag"]} style={{ background: co.color }}>
                        {co.id}
                      </span>
                      <span className={s["cr-c-id"]}>
                        <span className={s["cr-c-name"]}>{t(COUNTRY_NAME[co.id])}</span>
                        <span className={cn(s["cr-c-demand"], co.supply === "med" && s.med)}>
                          <span className={s["cr-dot"]} />
                          {t(SUPPLY_LABEL[co.supply])}
                        </span>
                      </span>
                      <ScoreRing score={co.score} />
                    </div>
                    <div className={s["cr-c-reason"]}>
                      {t("career.marketReason", { n: co.count.toLocaleString(locale) })}
                    </div>
                    <div className={s["cr-c-foot"]}>
                      <span className={s["cr-c-score-l"]}>{t("career.talentSupply")}</span>
                      <span className={s["cr-c-pick"]}>
                        {active ? (
                          <>
                            <Ic name="check" />
                            {t("career.ghSelected")}
                          </>
                        ) : (
                          <>
                            {t("career.viewCandidates")}
                            <Ic name="arrow" />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Migration-ready candidates */}
          <div className={s["cr-sec"]}>
            <div className={s["cr-sec-head"]}>
              <span className={s["cr-sec-h"]}>{t("career.candsH")}</span>
              <span className={s["cr-sec-s"]}>{t("career.candsS")}</span>
            </div>
            <div className={s["cr-recs"]}>
              {MIGRATION_CANDIDATES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={s["cr-rec"]}
                  onClick={() => toast(t("career.ghToastOpenCand"))}
                >
                  <span className={s["cr-rec-av"]} style={{ background: c.color }}>
                    {initials(c.name)}
                  </span>
                  <span className={s["cr-rec-main"]}>
                    <span className={s["cr-rec-role"]}>{c.name}</span>
                    <span className={s["cr-rec-sub"]}>
                      {c.role} · {t(COUNTRY_NAME[c.country])}
                    </span>
                    <span className={s["cr-rec-tag"]}>
                      <Ic name="badge" />
                      {t("career.migReady")}
                    </span>
                  </span>
                  <span className={s["cr-rec-match"]}>
                    <span className={s["cr-rec-pct"]}>{c.score}%</span>
                    <span className={s["cr-rec-pct-l"]}>{t("career.ghMatch")}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
