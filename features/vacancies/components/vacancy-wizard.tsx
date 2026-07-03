"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  useCreateVacancy,
  useParseVacancy,
} from "@/features/vacancies/hooks/use-vacancies";
import { useSpeechRecognition } from "@/features/chat/hooks/use-speech-recognition";
import type { ParsedVacancy } from "@/features/vacancies/services/vacancies.service";
import {
  BEN,
  findLabel,
  makeWizardT,
  matchTitle,
  optLabel,
  OPTS,
  type OptPair,
  type WizardT,
} from "@/features/vacancies/data/wizard-dict";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { isApiClientError } from "@/lib/api/error";
import {
  EXPERIENCE_LEVEL,
  VACANCY_TYPE,
  type ExperienceLevel,
  type VacancyType,
} from "@/interfaces/enums";
import type { CreateVacancyPayload } from "@/interfaces/vacancy.interface";
import w from "@/features/vacancies/styles/vacancy-wizard.module.css";

/* ----------------------------- icons ----------------------------- */
const PATHS: Record<string, string> = {
  back: "<path d='M19 12H5M11 18l-6-6 6-6'/>",
  chev: "<path d='M6 9l6 6 6-6'/>",
  arrowR: "<path d='M5 12h14M13 6l6 6-6 6'/>",
  arrowL: "<path d='M19 12H5M11 18l-6-6 6-6'/>",
  check: "<path d='M20 6L9 17l-5-5'/>",
  plus: "<path d='M12 5v14M5 12h14'/>",
  minus: "<path d='M5 12h14'/>",
  x: "<path d='M6 6l12 12M18 6L6 18'/>",
  spark:
    "<path d='M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 16l-1.7-5L6 9.3l4.3-1.7z'/>",
  wallet:
    "<path d='M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><path d='M16 12h2'/>",
  pin: "<path d='M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z'/><circle cx='12' cy='10' r='2.5'/>",
  brief:
    "<rect x='3' y='7' width='18' height='13' rx='2.5'/><path d='M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7'/>",
  clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>",
  user: "<circle cx='12' cy='8' r='4'/><path d='M5 20c0-3.3 3-6 7-6s7 2.7 7 6'/>",
  eye: "<path d='M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'/><circle cx='12' cy='12' r='3'/>",
  rocket:
    "<path d='M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11a13 13 0 0 1 8-8c2.5 0 3 .5 3 3a13 13 0 0 1-8 8l-3-3z'/><circle cx='14.5' cy='9.5' r='1.5'/>",
};
function WIco({ name, sw = 1.8 }: { name: string; sw?: number }) {
  return (
    <span className={w.ico} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: PATHS[name] }}
      />
    </span>
  );
}
/** Raw <svg> (for use inside meta rows / lists that size the svg directly). */
function WSvg({ name, sw = 1.6 }: { name: string; sw?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

/* ----------------------------- state ----------------------------- */
interface LangRow {
  lang: string;
  level: string;
}
interface WizardState {
  jobType: "regular" | "daily";
  title: string;
  prof: string;
  cat: string;
  place: string;
  format: string;
  exp: string;
  team: number;
  skills: string[];
  edu: string;
  langs: LangRow[];
  empType: string;
  schedule: string;
  probation: string;
  payType: string;
  salFrom: string;
  salTo: string;
  freq: string;
  currency: string;
  payNote: string;
  ben: {
    fin: Record<string, boolean>;
    health: Record<string, boolean>;
    social: Record<string, boolean>;
  };
  benExtra: string;
  incl: Record<string, boolean>;
  desc: string;
  vis: string;
  wf: string;
  resp: boolean;
  site: string;
  date: string;
  hours: string;
  country: string;
  city: string;
  address: string;
  agree: boolean;
  __profManual: boolean;
  __catManual: boolean;
}

const DEFAULT_STATE: WizardState = {
  jobType: "regular",
  title: "",
  prof: "",
  cat: "",
  place: "onsite",
  format: "onsite",
  exp: "1",
  team: 1,
  skills: [],
  edu: "",
  langs: [{ lang: "", level: "" }],
  empType: "",
  schedule: "",
  probation: "",
  payType: "fixed",
  salFrom: "",
  salTo: "",
  freq: "",
  currency: "",
  payNote: "",
  ben: { fin: {}, health: {}, social: {} },
  benExtra: "",
  incl: {},
  desc: "",
  vis: "public",
  wf: "office",
  resp: true,
  site: "",
  date: "",
  hours: "",
  country: "",
  city: "",
  address: "",
  agree: false,
  __profManual: false,
  __catManual: false,
};

const PV_KEY = "pv_state";

function loadState(): WizardState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(PV_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

const INCL_KEYS = [
  "incl.housing",
  "incl.meals",
  "incl.docs",
  "incl.transport",
  "incl.workwear",
  "incl.advance",
  "incl.training",
  "incl.registration",
];

/* ----------------------------- step registry ----------------------------- */
interface StepDef {
  name: string;
  meta: string;
  done: (s: WizardState) => boolean;
  render: () => ReactNode;
}

/* ----------------------------- backend mapping ----------------------------- */
const EXP_MAP: Record<string, ExperienceLevel> = {
  none: EXPERIENCE_LEVEL.NO_EXPERIENCE,
  "1": EXPERIENCE_LEVEL.ONE_TO_3,
  "3": EXPERIENCE_LEVEL.THREE_TO_5,
  "6": EXPERIENCE_LEVEL.MORE_THAN_10,
};
const TYPE_MAP: Record<string, VacancyType> = {
  full: VACANCY_TYPE.FULL_TIME,
  part: VACANCY_TYPE.PART_TIME,
  project: VACANCY_TYPE.CONTRACT,
  intern: VACANCY_TYPE.INTERNSHIP,
  temp: VACANCY_TYPE.SEASONAL,
};

/**
 * Vacancy creation wizard (Vacancy Wizard.html). Full-screen overlay launched
 * from the Vacancies screen once the company is approved. Single-scroll with a
 * numbered scroll-spy nav, a Regular/Daily toggle, a live preview overlay and a
 * sticky footer. Publishing maps the form to `POST /employer/vacancies`; the
 * draft persists to localStorage (`pv_state`). Fields the backend create schema
 * doesn't model yet (team size, pay type/frequency, probation, visibility,
 * contact channels, freeform description) are documented in docs/api/vacancies.md.
 */
export function VacancyWizard({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const router = useRouter();
  const t = useMemo<WizardT>(() => makeWizardT(locale), [locale]);
  const tEn = useMemo<WizardT>(() => makeWizardT("en"), []);
  const createVacancy = useCreateVacancy();

  const [state, setState] = useState<WizardState>(loadState);
  const [published, setPublished] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    track(ANALYTICS_EVENTS.JOB_POST_STARTED, { input_mode: "wizard" });
  }, []);

  // Persist the draft (a localStorage write → effect, React-Compiler-safe).
  useEffect(() => {
    try {
      window.localStorage.setItem(PV_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — drafts are best-effort */
    }
  }, [state]);

  const update = useCallback(
    (patch: Partial<WizardState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    [],
  );

  // ── Voice → wizard: speak a job brief, the AI fills the free-form fields; the
  // employer completes the option/enum steps, then publishes or saves a draft. ──
  const parseVacancy = useParseVacancy();
  const voiceRef = useRef("");

  const applyParsed = (d: ParsedVacancy) => {
    const patch: Partial<WizardState> = {};
    if (d.title) patch.title = d.title;
    if (d.description) patch.desc = d.description;
    if (d.city) patch.city = d.city;
    if (d.address) patch.address = d.address;
    if (d.currency) patch.currency = d.currency;
    if (d.paymentNote) patch.payNote = d.paymentNote;
    if (d.salaryMin != null) patch.salFrom = String(d.salaryMin);
    if (d.salaryMax != null) patch.salTo = String(d.salaryMax);
    if (d.teamSize != null) patch.team = d.teamSize;
    if (d.skillsRequired?.length) patch.skills = d.skillsRequired;
    update(patch);
    track(ANALYTICS_EVENTS.VOICE_RECORDING_COMPLETED, { surface: "vacancy" });
    toast.success("Filled in what we heard — review and complete the wizard.");
  };

  const runParse = () => {
    const text = voiceRef.current.trim();
    if (!text) {
      toast.error("Say a bit about the job first, then tap to stop.");
      return;
    }
    parseVacancy.mutate(text, {
      onSuccess: applyParsed,
      onError: (error) =>
        toast.error(
          isApiClientError(error)
            ? error.message
            : "Couldn't read your description — please try again.",
        ),
    });
  };

  const speech = useSpeechRecognition({
    onTranscript: (text) => {
      voiceRef.current = text;
    },
    onError: (code) =>
      toast.error(
        code === "not-allowed"
          ? "Microphone access is blocked — enable it in your browser."
          : code === "no-speech"
            ? "Didn't catch that — try speaking again."
            : "Voice input isn't available right now.",
      ),
  });

  const toggleVoice = () => {
    if (parseVacancy.isPending) return;
    if (speech.listening) {
      speech.stop();
      runParse();
    } else {
      voiceRef.current = "";
      speech.start();
    }
  };

  /* ----- field helpers bound to state ----- */
  const lab = useCallback(
    (list: OptPair[], value: string) => findLabel(list, value, locale, t),
    [locale, t],
  );

  const steps = useMemo<StepDef[]>(() => {
    const regular: StepDef[] = [
      {
        name: "step.1",
        meta: "step.1m",
        done: (s) => !!(s.title && s.place && s.format && s.exp),
        render: () => <Step1 s={state} t={t} locale={locale} update={update} />,
      },
      {
        name: "step.2",
        meta: "step.2m",
        done: (s) => s.skills.length > 0,
        render: () => <Step2 s={state} t={t} locale={locale} update={update} />,
      },
      {
        name: "step.3",
        meta: "step.3m",
        done: (s) => !!(s.empType && s.schedule && s.salFrom),
        render: () => <Step3 s={state} t={t} locale={locale} update={update} />,
      },
      {
        name: "step.5",
        meta: "step.5m",
        done: (s) => !!(s.desc && s.city),
        render: () => <Step5 s={state} t={t} locale={locale} update={update} />,
      },
      {
        name: "step.7",
        meta: "step.7m",
        done: () => published,
        render: () => (
          <Step7 s={state} t={t} locale={locale} update={update} lab={lab} />
        ),
      },
    ];
    const daily: StepDef[] = [
      {
        name: "dstep.1",
        meta: "dstep.1m",
        done: (s) => !!(s.title && s.city && s.date),
        render: () => (
          <DailyMain s={state} t={t} locale={locale} update={update} />
        ),
      },
      {
        name: "dstep.2",
        meta: "dstep.2m",
        done: (s) => !!s.salFrom,
        render: () => (
          <DailyPay s={state} t={t} locale={locale} update={update} />
        ),
      },
      {
        name: "step.7",
        meta: "step.7m",
        done: () => published,
        render: () => (
          <Step7 s={state} t={t} locale={locale} update={update} lab={lab} />
        ),
      },
    ];
    return state.jobType === "daily" ? daily : regular;
  }, [state, t, locale, update, lab, published]);

  const total = steps.length;
  const isComplete = (i: number) => steps[i]?.done(state) ?? false;

  /* ----- scroll spy ----- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const line = window.innerHeight * 0.32;
      let cur = 0;
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) cur = i;
      });
      if (root.scrollHeight - root.scrollTop - root.clientHeight < 6)
        cur = total - 1;
      setActiveIdx(cur);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [total, state.jobType]);

  const gotoStep = (i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i));
    const el = stepRefs.current[clamped];
    const root = rootRef.current;
    if (!el || !root) return;
    const target =
      root.scrollTop +
      (el.getBoundingClientRect().top - root.getBoundingClientRect().top) -
      80;
    root.scrollTo({ top: target, behavior: "smooth" });
  };

  // Escape closes the preview overlay (the wizard itself closes via the back btn,
  // so a stray Escape can't discard a draft mid-edit).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewOpen) setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  const buildPayload = (saveAsDraft: boolean): CreateVacancyPayload => {
    const country =
      (state.country && findLabel(OPTS.country, state.country, "en", tEn)) ||
      "Uzbekistan";
    const benefits = [
      ...(["fin", "health", "social"] as const).flatMap((g) =>
        BEN[g]
          .map((k, i) => (state.ben[g][`${k}_${i}`] ? t(k) : null))
          .filter((x): x is string => Boolean(x)),
      ),
      ...INCL_KEYS.filter((k) => state.incl[k]).map((k) => t(k)),
      ...(state.benExtra ? [state.benExtra.trim()] : []),
    ];
    return {
      title: state.title.trim(),
      country,
      type: state.empType ? (TYPE_MAP[state.empType] ?? null) : null,
      city: state.city || null,
      isRemote: state.place === "remote" || state.wf === "remote",
      salaryMin: state.salFrom ? Number(state.salFrom) || null : null,
      salaryMax: state.salTo ? Number(state.salTo) || null : null,
      currency: state.currency ? state.currency.toUpperCase() : null,
      experienceRequired: EXP_MAP[state.exp] ?? null,
      skillsRequired: state.skills,
      languagesRequired: state.langs
        .filter((l) => l.lang)
        .map((l) => findLabel(OPTS.lang, l.lang, locale, t)),
      housingProvided: Boolean(state.incl["incl.housing"]),
      relocationAssistance: BEN.social.some(
        (k, i) => k === "b.reloc" && state.ben.social[`${k}_${i}`],
      ),
      benefits: benefits.length ? benefits : null,
      responsibilities: state.desc
        ? state.desc
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : null,
      saveAsDraft,
    };
  };

  const publish = () => {
    if (!state.agree || createVacancy.isPending) return;
    createVacancy.mutate(buildPayload(false), {
      onSuccess: () => {
        setPublished(true);
        try {
          window.localStorage.removeItem(PV_KEY);
        } catch {
          /* ignore */
        }
        rootRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        toast.success(t("toast.published"));
      },
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("toast.publishError"),
        ),
    });
  };

  // Save the vacancy to the backend as a private DRAFT (invisible to workers,
  // consumes no posting slot). Publish it later from the Vacancies list.
  const saveDraft = () => {
    if (createVacancy.isPending) return;
    if (!state.title.trim()) {
      toast.error("Add a job title to save a draft.");
      return;
    }
    createVacancy.mutate(buildPayload(true), {
      onSuccess: () => {
        try {
          window.localStorage.removeItem(PV_KEY);
        } catch {
          /* ignore */
        }
        toast.success("Saved as draft — publish it anytime from Vacancies.");
        onClose();
      },
      onError: (error) =>
        toast.error(
          isApiClientError(error)
            ? error.message
            : "Couldn't save the draft — please try again.",
        ),
    });
  };

  const pct = Math.min(100, Math.round(((activeIdx + 1) / total) * 100));
  const isLast = activeIdx >= total - 1;
  const canPreview = steps.slice(0, total - 1).every((_, i) => isComplete(i));

  return (
    <div className={w.root} ref={rootRef}>
      {/* header */}
      <header className={w.head}>
        <div className={w.hleft}>
          <button
            type="button"
            className={w.back}
            aria-label={t("btn.back")}
            onClick={onClose}
          >
            <WIco name="back" sw={1.8} />
          </button>
          <span className={w.htitle}>{t("h.title")}</span>
        </div>
        <div className={w.hright}>
          {speech.supported && (
            <button
              type="button"
              className={w.draft}
              onClick={toggleVoice}
              disabled={parseVacancy.isPending}
            >
              {parseVacancy.isPending
                ? "Reading…"
                : speech.listening
                  ? "Stop"
                  : "🎙 Speak"}
            </button>
          )}
          <button type="button" className={w.draft} onClick={saveDraft}>
            {t("h.draft")}
          </button>
        </div>
      </header>
      <div className={w.prog}>
        <div className={w.bar} style={{ width: `${pct}%` }} />
      </div>

      {/* layout */}
      <div className={w.wrap}>
        <div className={w.main}>
          {published ? (
            <SuccessCard
              t={t}
              onView={() => {
                onClose();
                router.push(routes.candidates);
              }}
            />
          ) : (
            <>
              <div className={w.jobtype}>
                <div className={w.seg}>
                  {(
                    [
                      ["regular", "jt.regular"],
                      ["daily", "jt.daily"],
                    ] as const
                  ).map(([val, key]) => (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={state.jobType === val}
                      onClick={() => {
                        if (state.jobType === val) return;
                        setActiveIdx(0);
                        update({ jobType: val });
                        rootRef.current?.scrollTo({ top: 0 });
                      }}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              {steps.map((step, i) => (
                <div
                  key={`${state.jobType}-${step.name}-${i}`}
                  className={w.step}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                >
                  {step.render()}
                </div>
              ))}
            </>
          )}
        </div>

        {!published ? (
          <nav className={w.nav}>
            <div className={w["nav-h"]}>{t("nav.h")}</div>
            {steps.map((step, i) => {
              const stateCls =
                i === activeIdx ? "current" : isComplete(i) ? "done" : "todo";
              return (
                <button
                  key={`nav-${i}`}
                  type="button"
                  className={cn(
                    w["nav-item"],
                    stateCls === "current" && w.current,
                    stateCls === "done" && w.done,
                  )}
                  onClick={() => gotoStep(i)}
                >
                  <span className={w["nav-num"]}>
                    {stateCls === "done" ? (
                      <WSvg name="check" sw={2.4} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={w["nav-label"]}>
                    <span className={w["nav-t"]}>{t(step.name)}</span>
                    <span className={w["nav-meta"]}>{t(step.meta)}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>

      {/* sticky footer */}
      {!published ? (
        <footer className={w.foot}>
          <div className={w["foot-inner"]}>
            {canPreview ? (
              <button
                type="button"
                className={cn(w.btn, w["btn-ghost"])}
                onClick={() => setPreviewOpen(true)}
              >
                {t("btn.preview")}
              </button>
            ) : null}
            <div className={w["foot-meta"]}>
              <span className={w["foot-step"]}>
                {t("foot.step", { n: activeIdx + 1, t: total })}
              </span>
            </div>
            <button
              type="button"
              className={cn(w.btn, w["btn-tert"], w["foot-back"])}
              style={{ visibility: activeIdx > 0 ? "visible" : "hidden" }}
              onClick={() => gotoStep(activeIdx - 1)}
            >
              <WIco name="arrowL" sw={1.9} />
              <span>{t("btn.back")}</span>
            </button>
            <button
              type="button"
              className={cn(w.btn, w["btn-prim"], w["foot-next"])}
              disabled={isLast && (!state.agree || createVacancy.isPending)}
              onClick={() => (isLast ? publish() : gotoStep(activeIdx + 1))}
            >
              <span>{isLast ? t("btn.publish") : t("btn.next")}</span>
              <WIco name={isLast ? "rocket" : "arrowR"} sw={1.9} />
            </button>
          </div>
        </footer>
      ) : null}

      {/* preview overlay */}
      {previewOpen ? (
        <div className={w["pv-overlay"]}>
          <div
            className={w["pv-scrim"]}
            onClick={() => setPreviewOpen(false)}
          />
          <div className={w["pv-panel"]}>
            <div className={w["pv-panel-head"]}>
              <div className={w["pv-panel-title"]}>{t("s6.badge")}</div>
              <button
                type="button"
                className={w["pv-close"]}
                aria-label={t("btn.back")}
                onClick={() => setPreviewOpen(false)}
              >
                <WSvg name="x" sw={1.9} />
              </button>
            </div>
            <div className={w["pv-panel-body"]}>
              <Preview
                s={state}
                t={t}
                locale={locale}
                complete={isComplete(0)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* The success card replaces the step cards once the vacancy is published. */
function SuccessCard({ t, onView }: { t: WizardT; onView: () => void }) {
  return (
    <div className={w.card}>
      <div className={w.success}>
        <div className={w.badge}>
          <WSvg name="check" sw={2.4} />
        </div>
        <h2>{t("s7.successT")}</h2>
        <p>{t("s7.successP")}</p>
        <button
          type="button"
          className={cn(w.btn, w["btn-prim"])}
          onClick={onView}
        >
          <WIco name="user" sw={1.7} />
          <span>{t("s7.successBtn")}</span>
        </button>
      </div>
    </div>
  );
}

/* =================================================================
   Shared field controls
   ================================================================= */
interface StepProps {
  s: WizardState;
  t: WizardT;
  locale: import("@/lib/i18n").Locale;
  update: (patch: Partial<WizardState>) => void;
}

function FieldLabel({
  text,
  req,
  opt,
}: {
  text: string;
  req?: boolean;
  opt?: string;
}) {
  return (
    <label>
      {text}
      {req ? <span className={w.req}>*</span> : null}
      {opt ? <span className={w["field-opt"]}> {opt}</span> : null}
    </label>
  );
}

function Segmented({
  value,
  list,
  onChange,
  t,
  locale,
}: {
  value: string;
  list: OptPair[];
  onChange: (v: string) => void;
  t: WizardT;
  locale: import("@/lib/i18n").Locale;
}) {
  return (
    <div className={w.seg}>
      {list.map((p) => (
        <button
          key={p[0]}
          type="button"
          aria-pressed={value === p[0]}
          onClick={() => onChange(p[0])}
        >
          {optLabel(p, locale, t)}
        </button>
      ))}
    </div>
  );
}

function Dd({
  value,
  list,
  placeholder,
  onChange,
  t,
  locale,
}: {
  value: string;
  list: OptPair[];
  placeholder: string;
  onChange: (v: string) => void;
  t: WizardT;
  locale: import("@/lib/i18n").Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);
  const current = list.find((p) => p[0] === value);
  return (
    <div className={cn(w.dd, open && w.open)} ref={ref}>
      <button
        type="button"
        className={w["dd-btn"]}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={cn(w["dd-val"], !current && w.ph)}>
          {current ? optLabel(current, locale, t) : placeholder}
        </span>
        <span className={w["dd-chev"]}>
          <WSvg name="chev" sw={1.8} />
        </span>
      </button>
      {open ? (
        <div className={w["dd-menu"]} role="listbox">
          {list.map((p) => (
            <button
              key={p[0]}
              type="button"
              className={cn(w["dd-opt"], value === p[0] && w.sel)}
              onClick={() => {
                onChange(p[0]);
                setOpen(false);
              }}
            >
              <span>{optLabel(p, locale, t)}</span>
              <span className={w["dd-tick"]}>
                <WSvg name="check" sw={2.2} />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Check({
  checked,
  onToggle,
  text,
  desc,
}: {
  checked: boolean;
  onToggle: () => void;
  text: string;
  desc?: string;
}) {
  return (
    <div
      className={w.check}
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className={w.box}>
        <WSvg name="check" sw={2.4} />
      </span>
      <div>
        <div className={w.ctxt}>{text}</div>
        {desc ? <div className={w.cdesc}>{desc}</div> : null}
      </div>
    </div>
  );
}

/* =================================================================
   Steps
   ================================================================= */
function Step1({ s, t, locale, update }: StepProps) {
  return (
    <div className={w.card}>
      <h2>{t("s1.card")}</h2>
      <div className={w.field}>
        <FieldLabel text={t("s1.title")} req />
        <input
          className={w.inp}
          value={s.title}
          placeholder={t("s1.titlePh")}
          onChange={(e) => {
            const title = e.target.value;
            const m = matchTitle(title);
            update({
              title,
              ...(m && !s.__profManual ? { prof: m.prof } : {}),
              ...(m && !s.__catManual ? { cat: m.cat } : {}),
            });
          }}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.prof")} />
        <Dd
          value={s.prof}
          list={OPTS.prof}
          placeholder={t("s1.profPh")}
          onChange={(v) => update({ prof: v, __profManual: true })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w["grid-2"]}>
        <div className={w.field}>
          <FieldLabel text={t("s1.cat")} />
          <Dd
            value={s.cat}
            list={OPTS.cat}
            placeholder={t("s1.catPh")}
            onChange={(v) => update({ cat: v, __catManual: true })}
            t={t}
            locale={locale}
          />
        </div>
        <div className={w.field}>
          <FieldLabel text={t("s1.place")} req />
          <Segmented
            value={s.place}
            list={[
              ["onsite", "opt.onsite"],
              ["remote", "opt.remote"],
            ]}
            onChange={(v) => update({ place: v })}
            t={t}
            locale={locale}
          />
        </div>
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.format")} req />
        <Segmented
          value={s.format}
          list={[
            ["onsite", "opt.onsite"],
            ["rotational", "opt.rotational"],
            ["shift", "opt.shift"],
            ["project", "opt.project"],
          ]}
          onChange={(v) => update({ format: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.exp")} req />
        <Segmented
          value={s.exp}
          list={[
            ["none", "exp.none"],
            ["1", "exp.1"],
            ["3", "exp.3"],
            ["6", "exp.6"],
          ]}
          onChange={(v) => update({ exp: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.team")} />
        <div className={w.stepper}>
          <button
            type="button"
            aria-label="−"
            onClick={() => update({ team: Math.max(1, s.team - 1) })}
          >
            <WSvg name="minus" sw={2} />
          </button>
          <div className={w.val}>{s.team}</div>
          <button
            type="button"
            aria-label="+"
            onClick={() => update({ team: s.team + 1 })}
          >
            <WSvg name="plus" sw={1.9} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2({ s, t, locale, update }: StepProps) {
  const [skill, setSkill] = useState("");
  const addSkill = () => {
    const v = skill.trim();
    if (v && !s.skills.includes(v)) update({ skills: [...s.skills, v] });
    setSkill("");
  };
  return (
    <div className={w.card}>
      <h2>{t("step.2")}</h2>
      <div className={w.field}>
        <FieldLabel text={t("s2.skills")} />
        <input
          className={w.inp}
          value={skill}
          placeholder={t("s2.skillsPh")}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <div className={w.chips}>
          {s.skills.map((sk, i) => (
            <span key={`${sk}-${i}`} className={w.chip}>
              {sk}
              <button
                type="button"
                aria-label="remove"
                onClick={() =>
                  update({ skills: s.skills.filter((_, j) => j !== i) })
                }
              >
                <WSvg name="x" sw={1.9} />
              </button>
            </span>
          ))}
        </div>
        <button type="button" className={w["add-btn"]} onClick={addSkill}>
          <WIco name="plus" sw={1.9} />
          <span>{t("s2.addSkill")}</span>
        </button>
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s2.edu")} />
        <Dd
          value={s.edu}
          list={OPTS.edu}
          placeholder={t("s2.eduPh")}
          onChange={(v) => update({ edu: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s2.langs")} />
        <div>
          {s.langs.map((row, i) => (
            <div key={i} className={w["lang-row"]}>
              <Dd
                value={row.lang}
                list={OPTS.lang}
                placeholder={t("s2.langPh")}
                onChange={(v) =>
                  update({
                    langs: s.langs.map((l, j) =>
                      j === i ? { ...l, lang: v } : l,
                    ),
                  })
                }
                t={t}
                locale={locale}
              />
              <Dd
                value={row.level}
                list={OPTS.level}
                placeholder={t("s2.levelPh")}
                onChange={(v) =>
                  update({
                    langs: s.langs.map((l, j) =>
                      j === i ? { ...l, level: v } : l,
                    ),
                  })
                }
                t={t}
                locale={locale}
              />
              <button
                type="button"
                className={w.rm}
                aria-label="remove"
                onClick={() => {
                  const next = s.langs.filter((_, j) => j !== i);
                  update({
                    langs: next.length ? next : [{ lang: "", level: "" }],
                  });
                }}
              >
                <WSvg name="x" sw={1.9} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={w["add-btn"]}
          onClick={() =>
            update({ langs: [...s.langs, { lang: "", level: "" }] })
          }
        >
          <WIco name="plus" sw={1.9} />
          <span>{t("s2.addLang")}</span>
        </button>
      </div>
    </div>
  );
}

function Step3({ s, t, locale, update }: StepProps) {
  return (
    <div className={w.card}>
      <h2>{t("step.3")}</h2>
      <h3>{t("s3.cond")}</h3>
      <div className={w.field}>
        <FieldLabel text={t("s3.empType")} />
        <Dd
          value={s.empType}
          list={OPTS.empType}
          placeholder={t("s3.empTypePh")}
          onChange={(v) => update({ empType: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s3.schedule")} />
        <Dd
          value={s.schedule}
          list={OPTS.schedule}
          placeholder={t("s3.schedulePh")}
          onChange={(v) => update({ schedule: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s3.probation")} />
        <Dd
          value={s.probation}
          list={OPTS.probation}
          placeholder={t("s3.probationPh")}
          onChange={(v) => update({ probation: v })}
          t={t}
          locale={locale}
        />
      </div>

      <h3 className={w.mt}>{t("s3.pay")}</h3>
      <div className={w.split}>
        <div>
          <div className={w.field}>
            <FieldLabel text={t("s3.payType")} />
            <Segmented
              value={s.payType}
              list={[
                ["fixed", "pt.fixed"],
                ["hourly", "pt.hourly"],
                ["piece", "pt.piece"],
                ["other", "pt.other"],
              ]}
              onChange={(v) => update({ payType: v })}
              t={t}
              locale={locale}
            />
          </div>
          <div className={w["grid-2"]}>
            <div className={w.field}>
              <FieldLabel text={t("s3.salFrom")} />
              <input
                className={w.inp}
                type="number"
                value={s.salFrom}
                placeholder={t("s3.salFrom")}
                onChange={(e) => update({ salFrom: e.target.value })}
              />
            </div>
            <div className={w.field}>
              <FieldLabel text={t("s3.salTo")} />
              <input
                className={w.inp}
                type="number"
                value={s.salTo}
                placeholder={t("s3.salTo")}
                onChange={(e) => update({ salTo: e.target.value })}
              />
            </div>
          </div>
          <div className={w["grid-2"]}>
            <div className={w.field}>
              <FieldLabel text={t("s3.freq")} />
              <Dd
                value={s.freq}
                list={OPTS.freq}
                placeholder={t("s3.freqPh")}
                onChange={(v) => update({ freq: v })}
                t={t}
                locale={locale}
              />
            </div>
            <div className={w.field}>
              <FieldLabel text={t("s3.currency")} />
              <Dd
                value={s.currency}
                list={OPTS.currency}
                placeholder={t("s3.currencyPh")}
                onChange={(v) => update({ currency: v })}
                t={t}
                locale={locale}
              />
            </div>
          </div>
        </div>
        <div className={w["info-side"]}>
          <div className={w["ic-circ"]}>
            <WSvg name="wallet" sw={1.5} />
          </div>
          <h4>{t("s3.payInfoT")}</h4>
          <p>{t("s3.payInfoD")}</p>
          <div className={w.field} style={{ marginTop: 18 }}>
            <FieldLabel text={t("s3.payNote")} opt={t("s3.opt")} />
            <textarea
              className={w.ta}
              value={s.payNote}
              maxLength={300}
              placeholder={t("s3.payNotePh")}
              onChange={(e) => update({ payNote: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5({ s, t, locale, update }: StepProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const desc = s.desc || t("s5.tpl");

  // Seed the description with the structured template (matches the prototype) so
  // the step counts as filled — a state write, so it runs in an effect.
  const hasDesc = Boolean(s.desc);
  useEffect(() => {
    if (!hasDesc) update({ desc: t("s5.tpl") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = () => {
    setAiOpen(true);
    setAiBusy(true);
    const sample = t("s5.aiTpl")
      .split("{role}")
      .join(s.title || t("step.1"));
    window.setTimeout(() => {
      update({ desc: sample });
      setAiBusy(false);
      toast.success(t("toast.aiDone"));
    }, 1100);
  };

  return (
    <div className={w.card}>
      <h2>{t("s5.title")}</h2>
      <p className={w["card-sub"]}>{t("s5.sub")}</p>

      <div className={w["grid-2"]}>
        <div className={w.field}>
          <FieldLabel text={t("s5.country")} req />
          <Dd
            value={s.country}
            list={OPTS.country}
            placeholder={t("s5.countryPh")}
            onChange={(v) => update({ country: v })}
            t={t}
            locale={locale}
          />
        </div>
        <div className={w.field}>
          <FieldLabel text={t("s1.city")} req />
          <input
            className={w.inp}
            value={s.city}
            placeholder={t("s1.cityPh")}
            onChange={(e) => update({ city: e.target.value })}
          />
        </div>
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s5.address")} />
        <input
          className={w.inp}
          value={s.address}
          placeholder={t("s5.addressPh")}
          onChange={(e) => update({ address: e.target.value })}
        />
      </div>

      <div className={cn(w["ai-gen"], aiOpen && w.open)}>
        <div className={w["ai-head"]}>
          <button
            type="button"
            className={w["ai-toggle"]}
            onClick={() => setAiOpen((v) => !v)}
          >
            <span className={w["ai-h"]}>
              <WIco name="spark" sw={1.5} />
              <span>{t("s5.ai.h")}</span>
              <span className={w.badge}>AI</span>
            </span>
            <span className={w["ai-caret"]}>
              <WSvg name="chev" sw={1.8} />
            </span>
          </button>
          <button
            type="button"
            className={w["ai-btn"]}
            onClick={generate}
            disabled={aiBusy}
          >
            {aiBusy ? (
              <span className={w.spin} />
            ) : (
              <WIco name="spark" sw={1.5} />
            )}
            <span>{t("s5.ai.btn")}</span>
          </button>
        </div>
        {aiOpen ? (
          <div className={w["ai-body"]}>
            <p>{t("s5.ai.p")}</p>
          </div>
        ) : null}
      </div>

      <div className={w.field}>
        <FieldLabel text={t("s5.desc")} />
        <div>
          <textarea
            className={w.ta}
            style={{ minHeight: 240 }}
            value={desc}
            maxLength={3000}
            placeholder={t("s5.descPh")}
            onChange={(e) => update({ desc: e.target.value })}
          />
          <div className={w["ta-count"]}>{desc.length}/3000</div>
        </div>
      </div>

      <h3 className={w.mt}>{t("s5.incl")}</h3>
      <p className={w["card-sub"]} style={{ margin: "-12px 0 16px" }}>
        {t("s5.inclSub")}
      </p>
      <div className={w["incl-grid"]}>
        {INCL_KEYS.map((k) => (
          <Check
            key={k}
            checked={Boolean(s.incl[k])}
            onToggle={() => update({ incl: { ...s.incl, [k]: !s.incl[k] } })}
            text={t(k)}
          />
        ))}
      </div>

      <div className={w["grid-2"]}>
        <div className={w.field}>
          <FieldLabel text={t("s5.vis")} />
          <Segmented
            value={s.vis}
            list={[
              ["public", "vis.public"],
              ["link", "vis.link"],
            ]}
            onChange={(v) => update({ vis: v })}
            t={t}
            locale={locale}
          />
        </div>
        <div className={w.field}>
          <FieldLabel text={t("s5.wf")} />
          <Segmented
            value={s.wf}
            list={[
              ["office", "wf.office"],
              ["hybrid", "wf.hybrid"],
              ["remote", "wf.remote"],
            ]}
            onChange={(v) => update({ wf: v })}
            t={t}
            locale={locale}
          />
        </div>
      </div>

      <div className={w.field}>
        <FieldLabel text={t("s5.resp")} />
        <Check
          checked={s.resp}
          onToggle={() => update({ resp: !s.resp })}
          text={t("s5.respLabel")}
          desc={t("s5.respDesc")}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s5.site")} />
        <input
          className={w.inp}
          value={s.site}
          placeholder="https://example.com"
          onChange={(e) => update({ site: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step7({
  s,
  t,
  locale,
  update,
  lab,
}: StepProps & { lab: (list: OptPair[], v: string) => string }) {
  const salary = salaryStr(s, t, locale);
  return (
    <div className={w.card}>
      <h2>{t("s7.title")}</h2>
      <p className={w["card-sub"]}>{t("s7.sub")}</p>
      <div className={w["pub-recap"]}>
        <PubRow k={t("step.1")} v={s.title} />
        <PubRow k={t("s6.field.place")} v={s.city} />
        <PubRow
          k={t("s6.field.type")}
          v={s.empType ? lab(OPTS.empType, s.empType) : ""}
        />
        <PubRow k={t("s3.pay")} v={salary} plain />
      </div>
      <ul className={w["pub-note"]}>
        {["s7.note1", "s7.note2", "s7.note3"].map((k) => (
          <li key={k}>
            <WSvg name="check" sw={2.2} />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
      <div className={w["agree-row"]}>
        <Check
          checked={s.agree}
          onToggle={() => update({ agree: !s.agree })}
          text={t("s7.agree")}
        />
      </div>
    </div>
  );
}

function PubRow({ k, v, plain }: { k: string; v: string; plain?: boolean }) {
  return (
    <div className={w["pub-row"]}>
      <span className={w.k}>{k}</span>
      <span className={w.v}>
        {v ? v : plain ? "—" : <span className={w["pub-empty"]}>—</span>}
      </span>
    </div>
  );
}

/* ----------------------------- daily ----------------------------- */
function DailyMain({ s, t, locale, update }: StepProps) {
  return (
    <div className={w.card}>
      <h2>{t("dstep.1")}</h2>
      <p className={w["card-sub"]}>{t("d.sub")}</p>
      <div className={w.field}>
        <FieldLabel text={t("s1.title")} req />
        <input
          className={w.inp}
          value={s.title}
          placeholder={t("d.titlePh")}
          onChange={(e) => {
            const title = e.target.value;
            const m = matchTitle(title);
            update({ title, ...(m && !s.__catManual ? { cat: m.cat } : {}) });
          }}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.cat")} />
        <Dd
          value={s.cat}
          list={OPTS.cat}
          placeholder={t("s1.catPh")}
          onChange={(v) => update({ cat: v, __catManual: true })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s1.city")} req />
        <input
          className={w.inp}
          value={s.city}
          placeholder={t("s1.cityPh")}
          onChange={(e) => update({ city: e.target.value })}
        />
      </div>
      <div className={w["grid-2"]}>
        <div className={w.field}>
          <FieldLabel text={t("d.date")} req />
          <input
            className={w.inp}
            type="date"
            value={s.date}
            onChange={(e) => update({ date: e.target.value })}
          />
        </div>
        <div className={w.field}>
          <FieldLabel text={t("d.hours")} />
          <input
            className={w.inp}
            value={s.hours}
            placeholder={t("d.hoursPh")}
            onChange={(e) => update({ hours: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function DailyPay({ s, t, locale, update }: StepProps) {
  return (
    <div className={w.card}>
      <h2>{t("dstep.2")}</h2>
      <p className={w["card-sub"]}>{t("d.paySub")}</p>
      <div className={w.field}>
        <FieldLabel text={t("s3.payType")} />
        <Segmented
          value={s.payType}
          list={[
            ["hourly", "pt.hourly"],
            ["piece", "pt.piece"],
            ["fixed", "pt.fixed"],
          ]}
          onChange={(v) => update({ payType: v })}
          t={t}
          locale={locale}
        />
      </div>
      <div className={w["grid-2"]}>
        <div className={w.field}>
          <FieldLabel text={t("s3.salFrom")} />
          <input
            className={w.inp}
            type="number"
            value={s.salFrom}
            placeholder={t("s3.salFrom")}
            onChange={(e) => update({ salFrom: e.target.value })}
          />
        </div>
        <div className={w.field}>
          <FieldLabel text={t("s3.currency")} />
          <Dd
            value={s.currency}
            list={OPTS.currency}
            placeholder={t("s3.currencyPh")}
            onChange={(v) => update({ currency: v })}
            t={t}
            locale={locale}
          />
        </div>
      </div>
      <div className={w.field}>
        <FieldLabel text={t("s3.payNote")} opt={t("s3.opt")} />
        <textarea
          className={w.ta}
          value={s.payNote}
          maxLength={300}
          placeholder={t("s3.payNotePh")}
          onChange={(e) => update({ payNote: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ----------------------------- preview ----------------------------- */
function fmtMoney(n: string): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function salaryStr(
  s: WizardState,
  t: WizardT,
  locale: import("@/lib/i18n").Locale,
): string {
  if (!s.salFrom && !s.salTo) return t("s6.byAgreement");
  const cur = s.currency ? findLabel(OPTS.currency, s.currency, locale, t) : "";
  const a = s.salFrom ? fmtMoney(s.salFrom) : "";
  const b = s.salTo ? fmtMoney(s.salTo) : "";
  if (a && b) return `${a} – ${b}${cur ? " " + cur : ""}`;
  return `${a || b}${cur ? " " + cur : ""}`;
}

function Preview({
  s,
  t,
  locale,
  complete,
}: {
  s: WizardState;
  t: WizardT;
  locale: import("@/lib/i18n").Locale;
  complete: boolean;
}) {
  if (!complete) {
    return (
      <div className={w["pv-gate"]}>
        <div className={w["pv-gate-ic"]}>
          <WSvg name="eye" sw={1.6} />
        </div>
        <h3>{t("s6.gateT")}</h3>
        <p>{t("s6.gateD")}</p>
      </div>
    );
  }
  const lab = (list: OptPair[], v: string) => findLabel(list, v, locale, t);
  const salary = salaryStr(s, t, locale);
  const sub = [
    s.cat ? lab(OPTS.cat, s.cat) : "",
    s.city,
    s.empType ? lab(OPTS.empType, s.empType) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const placeTxt =
    ([s.city, s.country ? lab(OPTS.country, s.country) : ""]
      .filter(Boolean)
      .join(", ") || t("s6.notSet")) +
    " · " +
    (s.place === "remote" ? t("opt.remote") : t("opt.onsite"));
  const hasLang = s.langs.some((l) => l.lang);

  return (
    <div className={w.pv2}>
      <div className={w["pv2-label"]}>{t("pv.cardView")}</div>
      <div className={w["pv2-jc"]}>
        <div className={w["pv2-jc-top"]}>
          <div className={w["pv2-logo"]}>
            {(s.title || "V").trim().charAt(0).toUpperCase() || "V"}
          </div>
          <div className={w["pv2-jc-head"]}>
            <div className={w["pv2-jc-title"]}>
              {s.title || t("s1.titlePh")}
            </div>
            <div className={w["pv2-jc-sub"]}>{sub || t("s6.notSet")}</div>
          </div>
          <div className={w["pv2-match"]}>92%</div>
        </div>
        <div className={w["pv2-jc-salary"]}>{salary}</div>
        {s.skills.length ? (
          <div className={w["pv2-tags"]}>
            {s.skills.slice(0, 5).map((sk, i) => (
              <span key={i} className={w["pv2-tag"]}>
                {sk}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={cn(w["pv2-label"], w.mt)}>{t("pv.detailView")}</div>
      <div className={w["pv2-detail"]}>
        <h1 className={w["pv2-title"]}>{s.title || t("s1.titlePh")}</h1>
        <div className={w["pv2-meta"]}>
          <span>
            <WSvg name="pin" /> {placeTxt}
          </span>
          <span>
            <WSvg name="brief" />{" "}
            {s.empType ? lab(OPTS.empType, s.empType) : t("s6.notSet")}
          </span>
          <span>
            <WSvg name="clock" />{" "}
            {s.schedule ? lab(OPTS.schedule, s.schedule) : t("s6.notSet")}
          </span>
          <span>
            <WSvg name="user" /> {t(`exp.${s.exp}`)}
          </span>
        </div>
        <div className={w["pv2-salary"]}>{salary}</div>

        {s.desc ? (
          <div className={w["pv2-sec"]}>
            <h3 className={w["pv2-h"]}>{t("s6.about")}</h3>
            <div className={w["pv2-desc"]}>{s.desc}</div>
          </div>
        ) : null}

        {s.skills.length || s.edu || hasLang ? (
          <div className={w["pv2-sec"]}>
            <h3 className={w["pv2-h"]}>{t("s6.reqs")}</h3>
            {s.skills.length ? (
              <div className={w["pv2-tags"]}>
                {s.skills.map((sk, i) => (
                  <span key={i} className={w["pv2-tag"]}>
                    {sk}
                  </span>
                ))}
              </div>
            ) : null}
            <ul className={w["pv2-list"]}>
              {s.edu ? (
                <li>
                  <WSvg name="check" sw={2} />
                  <span>{t("s2.edu") + ": " + lab(OPTS.edu, s.edu)}</span>
                </li>
              ) : null}
              {s.langs
                .filter((l) => l.lang)
                .map((l, i) => (
                  <li key={i}>
                    <WSvg name="check" sw={2} />
                    <span>
                      {lab(OPTS.lang, l.lang) +
                        (l.level ? " — " + lab(OPTS.level, l.level) : "")}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {s.empType || s.schedule || s.probation ? (
          <div className={w["pv2-sec"]}>
            <h3 className={w["pv2-h"]}>{t("s6.conditions")}</h3>
            <div className={w["pv2-rows"]}>
              {s.empType ? (
                <Row k={t("s6.field.type")} v={lab(OPTS.empType, s.empType)} />
              ) : null}
              {s.schedule ? (
                <Row
                  k={t("s6.field.schedule")}
                  v={lab(OPTS.schedule, s.schedule)}
                />
              ) : null}
              {s.probation ? (
                <Row
                  k={t("s3.probation")}
                  v={lab(OPTS.probation, s.probation)}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {INCL_KEYS.filter((k) => s.incl[k]).length ? (
          <div className={w["pv2-sec"]}>
            <h3 className={w["pv2-h"]}>{t("s5.incl")}</h3>
            <div className={w["pv2-tags"]}>
              {INCL_KEYS.filter((k) => s.incl[k]).map((k) => (
                <span key={k} className={cn(w["pv2-tag"], w.alt)}>
                  {t(k)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className={w["pv2-row"]}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}
