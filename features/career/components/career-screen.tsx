"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  ACTION_ICON,
  ACTION_TOAST,
  CAREER_COUNTRIES,
  CAREER_RECS,
  COUNTRY_CHIPS,
  COUNTRY_LANG,
  COUNTRY_LEVEL,
  COUNTRY_NAME,
  COUNTRY_REASON,
  DEMAND_LABEL,
  ROADMAP_STEPS,
  STEP_ACTION_LABEL,
  STEP_DESC,
  STEP_TITLE,
  type CountryId,
  type StepAction,
} from "@/features/career/data/career.fixtures";
import { Ic } from "@/features/career/components/career-icons";
import { ScoreRing } from "@/features/career/components/score-ring";
import { useCareerState } from "@/features/career/hooks/use-career-state";
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
 * Worker "Career & migration" — pixel-perfect port of `career.js` (worker view):
 * intro + "Open to International Work" toggle, ranked country-match cards with a
 * compatibility ring, a per-country relocation roadmap, and recommended roles
 * abroad. Data is the typed mock seam; toggle/country/roadmap progress persist in
 * the localStorage seam. See `docs/api/career-and-global-hiring.md`.
 */
export function CareerScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const { state, update, toggleStep } = useCareerState();

  const country = state.country;
  const stepParams = {
    country: t(COUNTRY_NAME[country]),
    lang: t(COUNTRY_LANG[country]),
    level: t(COUNTRY_LEVEL[country]),
  };

  const firstOpen = ROADMAP_STEPS.find((st) => !state.done[st.id])?.id ?? null;
  const doneCount = ROADMAP_STEPS.filter((st) => state.done[st.id]).length;
  const pct = Math.round((doneCount / ROADMAP_STEPS.length) * 100);

  const onAction = (act: StepAction) => {
    if (act === "openCv") {
      router.push(routes.profileCv);
      return;
    }
    toast(t(ACTION_TOAST[act]));
  };

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
        <div className={s["cr-title"]}>{t("nav.careerMigration")}</div>
      </header>

      <div className={s["cr-scroll"]}>
        <div className={s["cr-wrap"]}>
          {/* Intro + international toggle */}
          <div className={s["cr-intro"]}>
            <div className={s["cr-intro-main"]}>
              <div className={s["cr-intro-h"]}>{t("career.introH")}</div>
              <div className={s["cr-intro-p"]}>{t("career.introP")}</div>
            </div>
            <div className={s["cr-toggle"]} data-on={state.intl ? "true" : "false"}>
              <div className={s["cr-toggle-tx"]}>
                <div className={s["cr-toggle-t"]}>{t("career.intlT")}</div>
                <div className={s["cr-toggle-s"]}>
                  {state.intl ? t("career.intlOn") : t("career.intlOff")}
                </div>
              </div>
              <button
                type="button"
                className={s["cr-switch"]}
                role="switch"
                aria-checked={state.intl}
                aria-label={t("career.intlT")}
                onClick={() => {
                  const next = !state.intl;
                  update({ intl: next });
                  toast(t(next ? "career.toastIntlOn" : "career.toastIntlOff"));
                }}
              />
            </div>
          </div>

          {/* Country matches */}
          <div className={s["cr-sec"]}>
            <div className={s["cr-sec-head"]}>
              <span className={s["cr-sec-h"]}>{t("career.countriesH")}</span>
              <span className={s["cr-sec-s"]}>{t("career.countriesS")}</span>
            </div>
            <div className={s["cr-countries"]}>
              {CAREER_COUNTRIES.map((co, i) => {
                const active = co.id === country;
                return (
                  <button
                    key={co.id}
                    type="button"
                    className={cn(
                      s["cr-country"],
                      i === 0 && s["is-top"],
                      active && s["is-active"],
                    )}
                    onClick={() => update({ country: co.id })}
                  >
                    <div className={s["cr-c-top"]}>
                      <span className={s["cr-c-flag"]} style={{ background: co.color }}>
                        {co.id}
                      </span>
                      <span className={s["cr-c-id"]}>
                        <span className={s["cr-c-name"]}>{t(COUNTRY_NAME[co.id])}</span>
                        <span className={cn(s["cr-c-demand"], co.demand === "med" && s.med)}>
                          <span className={s["cr-dot"]} />
                          {t(DEMAND_LABEL[co.demand])}
                        </span>
                      </span>
                      <ScoreRing score={co.score} />
                    </div>
                    <div className={s["cr-c-reason"]}>{t(COUNTRY_REASON[co.id])}</div>
                    <div className={s["cr-c-chips"]}>
                      {COUNTRY_CHIPS[co.id].map((chipKey) => (
                        <span key={chipKey} className={s["cr-chip"]}>
                          {t(chipKey)}
                        </span>
                      ))}
                    </div>
                    <div className={s["cr-c-foot"]}>
                      <span className={s["cr-c-score-l"]}>{t("career.compat")}</span>
                      <span className={s["cr-c-pick"]}>
                        {active ? (
                          <>
                            <Ic name="check" />
                            {t("career.selected")}
                          </>
                        ) : (
                          <>
                            {t("career.viewRoadmap")}
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

          {/* Roadmap */}
          <div className={s["cr-sec"]}>
            <div className={s["cr-sec-head"]}>
              <span className={s["cr-sec-h"]}>{t("career.roadTitle")}</span>
            </div>
            <div className={s["cr-road"]}>
              <div className={s["cr-road-head"]}>
                <div className={s["cr-road-h"]}>
                  {t("career.roadH", { country: stepParams.country })}
                </div>
                <div className={s["cr-road-pills"]}>
                  {CAREER_COUNTRIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={s["cr-pill"]}
                      aria-pressed={c.id === country}
                      onClick={() => update({ country: c.id })}
                    >
                      <span className={s["cr-pdot"]} style={{ background: c.color }}>
                        {c.id}
                      </span>
                      {t(COUNTRY_NAME[c.id])}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s["cr-prog"]}>
                <div className={s["cr-prog-bar"]}>
                  <span className={s["cr-prog-fill"]} style={{ width: `${pct}%` }} />
                </div>
                <span className={s["cr-prog-l"]}>
                  {t("career.prog", { done: doneCount, total: ROADMAP_STEPS.length })}
                </span>
              </div>
              <div className={s["cr-steps"]}>
                {ROADMAP_STEPS.map((step, i) => {
                  const done = Boolean(state.done[step.id]);
                  const active = step.id === firstOpen;
                  const actionLabel = STEP_ACTION_LABEL[step.id];
                  return (
                    <div
                      key={step.id}
                      className={cn(s["cr-step"], done && s.done, !done && active && s.active)}
                    >
                      <div className={s["cr-step-rail"]}>
                        <button
                          type="button"
                          className={s["cr-step-node"]}
                          aria-label={t(done ? "career.markUndone" : "career.markDone")}
                          onClick={() => {
                            const nowDone = toggleStep(step.id);
                            if (nowDone) toast(t("career.toastStepDone"));
                          }}
                        >
                          {done ? <Ic name="check" /> : i + 1}
                        </button>
                        <span className={s["cr-step-line"]} />
                      </div>
                      <div className={s["cr-step-body"]}>
                        <div className={s["cr-step-t"]}>
                          {t(STEP_TITLE[step.id], stepParams)}
                          {active ? (
                            <span className={s["cr-step-badge"]}>{t("career.stepNow")}</span>
                          ) : null}
                        </div>
                        <div className={s["cr-step-d"]}>{t(STEP_DESC[step.id], stepParams)}</div>
                        {step.act && !done && actionLabel ? (
                          <button
                            type="button"
                            className={s["cr-step-act"]}
                            onClick={() => onAction(step.act as StepAction)}
                          >
                            <Ic name={ACTION_ICON[step.act]} />
                            {t(actionLabel)}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommended roles */}
          <div className={s["cr-sec"]}>
            <div className={s["cr-sec-head"]}>
              <span className={s["cr-sec-h"]}>{t("career.recsH")}</span>
              <span className={s["cr-sec-s"]}>{t("career.recsS")}</span>
            </div>
            <div className={s["cr-recs"]}>
              {CAREER_RECS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={s["cr-rec"]}
                  onClick={() => toast(t("career.toastOpenRole"))}
                >
                  <span className={s["cr-rec-av"]} style={{ background: r.color }}>
                    {initials(r.company)}
                  </span>
                  <span className={s["cr-rec-main"]}>
                    <span className={s["cr-rec-role"]}>{t(r.roleKey)}</span>
                    <span className={s["cr-rec-sub"]}>
                      {r.company} · {t(COUNTRY_NAME[r.country])}
                    </span>
                    <span className={s["cr-rec-tag"]}>
                      <Ic name="badge" />
                      {t(r.tagKey)}
                    </span>
                  </span>
                  <span className={s["cr-rec-match"]}>
                    <span className={s["cr-rec-pct"]}>{r.match}%</span>
                    <span className={s["cr-rec-pct-l"]}>{t("career.match")}</span>
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

export type { CountryId };
