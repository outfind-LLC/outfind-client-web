"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Ic, ICONS, type IconName } from "@/features/dashboard/components/app-icons";
import { useStartJobSearch } from "@/features/jobs/hooks/use-start-job-search";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/translate";

import { pickLoc } from "@/features/visa/lib/localized";
import { useVisaModalStore } from "@/features/visa/store/visa-modal.store";
import {
  useSaveVisaPreference,
  useSetVisaDocumentCheck,
  useVisaBootstrap,
  useVisaChecklist,
  useVisaPreference,
} from "@/features/visa/hooks/use-visa";
import type {
  VisaDocument,
  VisaDocTag,
  VisaRegion,
  VisaSection,
} from "@/features/visa/types";
import v from "@/features/visa/styles/visa-wizard.module.css";

type Step = 1 | 2 | 3 | 4;
type RegionFilter = "ALL" | VisaRegion;

const REGION_ORDER: VisaRegion[] = [
  "EUROPE",
  "MIDDLE_EAST",
  "ASIA",
  "OCEANIA",
  "AMERICAS",
];

const REGION_LABEL: Record<RegionFilter, MessageKey> = {
  ALL: "visa.regionAll",
  EUROPE: "visa.regionEurope",
  MIDDLE_EAST: "visa.regionMiddleEast",
  ASIA: "visa.regionAsia",
  OCEANIA: "visa.regionOceania",
  AMERICAS: "visa.regionAmericas",
};

const TAG_LABEL: Record<VisaDocTag, MessageKey> = {
  REQUIRED: "visa.tagRequired",
  ONSITE: "visa.tagOnsite",
  IMPORTANT_2026: "visa.tagImportant2026",
  RECOMMENDED: "visa.tagRecommended",
  PAYABLE: "visa.tagPayable",
};

/** A profession's stored glyph name, guarded to a registered icon. */
function asIcon(name: string): IconName {
  return (name in ICONS ? name : "briefcase") as IconName;
}

/**
 * The visa guidance wizard — a four-step modal mounted once in the app shell and
 * opened from the sidebar "Visa guide" item and the "Visa documentation" chip.
 * All content is backend-driven; the frontend caches the reference lists and
 * each country's checklist. Matches the prototype (citizenship → destination →
 * profession → localized, gated checklist).
 */
export function VisaWizardModal() {
  const { t, locale } = useI18n();
  const open = useVisaModalStore((s) => s.open);
  const presetDestination = useVisaModalStore((s) => s.presetDestination);
  const close = useVisaModalStore((s) => s.close);

  const bootstrap = useVisaBootstrap(open);
  const preference = useVisaPreference(open);
  const savePref = useSaveVisaPreference();
  const startJobSearch = useStartJobSearch();

  const [step, setStep] = useState<Step>(1);
  const [citizenshipId, setCitizenshipId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const checklist = useVisaChecklist(destinationId, open && step === 4);
  const setCheck = useSetVisaDocumentCheck(destinationId ?? "");

  // Prefill once per open: saved selection (or Uzbekistan default) and, when a
  // destination is preset, jump straight to its checklist.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!open) {
      prefilled.current = false;
      return;
    }
    if (prefilled.current) return;
    if (bootstrap.isLoading || preference.isLoading) return;
    prefilled.current = true;
    const pref = preference.data;
    const firstCitizen = bootstrap.data?.citizenships[0]?.id ?? null;
    setCitizenshipId(pref?.citizenship?.id ?? firstCitizen);
    setDestinationId(presetDestination ?? pref?.destination?.id ?? null);
    setProfessionId(pref?.profession?.id ?? null);
    setStep(presetDestination ? 4 : 1);
    setExpanded(null);
    setRegion("ALL");
  }, [
    open,
    presetDestination,
    bootstrap.isLoading,
    bootstrap.data,
    preference.isLoading,
    preference.data,
  ]);

  // Esc to close + body scroll lock while open.
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

  const citizenship =
    bootstrap.data?.citizenships.find((c) => c.id === citizenshipId) ?? null;
  const profession =
    bootstrap.data?.professions.find((p) => p.id === professionId) ?? null;
  const destinationSummary =
    bootstrap.data?.destinations.find((d) => d.id === destinationId) ?? null;

  const availableRegions = useMemo(() => {
    const present = new Set(bootstrap.data?.destinations.map((d) => d.region));
    return REGION_ORDER.filter((r) => present.has(r));
  }, [bootstrap.data]);

  const filteredDestinations = useMemo(() => {
    const list = bootstrap.data?.destinations ?? [];
    return region === "ALL" ? list : list.filter((d) => d.region === region);
  }, [bootstrap.data, region]);

  if (!open) return null;

  const goChecklist = () => {
    if (!professionId || !destinationId || !citizenshipId) return;
    savePref.mutate({ citizenshipId, destinationId, professionId });
    setExpanded(null);
    setStep(4);
  };

  const onFindJob = () => {
    const country = checklist.data?.destination ?? destinationSummary;
    if (!profession || !country) return;
    close();
    startJobSearch.startSearch(
      {
        profession: profession.name.en,
        city: country.name.en,
        visaSponsorship: true,
      },
      (err) =>
        toast.error(err instanceof Error ? err.message : t("visa.loadError")),
    );
  };

  const onToggleDoc = (doc: VisaDocument) => {
    if (!destinationId) return;
    setCheck.mutate({ documentId: doc.id, checked: !doc.checked });
  };

  return (
    <div
      className={v.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={v.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("visa.title")}
      >
        {step === 4 ? (
          <ChecklistStep
            locale={locale}
            t={t}
            loading={checklist.isLoading}
            error={checklist.isError}
            data={checklist.data}
            citizenship={citizenship}
            profession={profession}
            expanded={expanded}
            onToggleSection={(id) =>
              setExpanded((cur) => (cur === id ? null : id))
            }
            onToggleDoc={onToggleDoc}
            onFindJob={onFindJob}
            onChange={() => setStep(1)}
            onClose={close}
            onRetry={() => checklist.refetch()}
          />
        ) : (
          <SelectStep
            step={step}
            t={t}
            locale={locale}
            onClose={close}
            onBack={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
            loading={bootstrap.isLoading}
            error={bootstrap.isError}
            onRetry={() => bootstrap.refetch()}
            // step 1
            citizenships={bootstrap.data?.citizenships ?? []}
            citizenshipId={citizenshipId}
            onPickCitizenship={setCitizenshipId}
            // step 2
            destinations={filteredDestinations}
            destinationId={destinationId}
            onPickDestination={setDestinationId}
            regions={availableRegions}
            region={region}
            onPickRegion={setRegion}
            // step 3
            professions={bootstrap.data?.professions ?? []}
            professionId={professionId}
            onPickProfession={setProfessionId}
            onNext={() => {
              if (step === 3) goChecklist();
              else setStep((s) => ((s + 1) as Step));
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Steps 1–3 ────────────────────────────────────────────────────────────────

type TFn = (key: MessageKey, params?: Record<string, string | number>) => string;

interface SelectStepProps {
  step: Step;
  t: TFn;
  locale: "en" | "ru" | "uz";
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  citizenships: { id: string; flag: string; name: LocRec }[];
  citizenshipId: string | null;
  onPickCitizenship: (id: string) => void;
  destinations: {
    id: string;
    flag: string;
    name: LocRec;
    region: VisaRegion;
    salaryFromEur: number | null;
  }[];
  destinationId: string | null;
  onPickDestination: (id: string) => void;
  regions: VisaRegion[];
  region: RegionFilter;
  onPickRegion: (r: RegionFilter) => void;
  professions: { id: string; icon: string; name: LocRec }[];
  professionId: string | null;
  onPickProfession: (id: string) => void;
}

type LocRec = { uz: string; ru: string; en: string };

function SelectStep(props: SelectStepProps) {
  const { step, t, locale } = props;

  const config: Record<
    1 | 2 | 3,
    { title: MessageKey; subtitle: MessageKey; cta: MessageKey; canNext: boolean }
  > = {
    1: {
      title: "visa.step1Title",
      subtitle: "visa.step1Subtitle",
      cta: "visa.continue",
      canNext: Boolean(props.citizenshipId),
    },
    2: {
      title: "visa.step2Title",
      subtitle: "visa.step2Subtitle",
      cta: "visa.continue",
      canNext: Boolean(props.destinationId),
    },
    3: {
      title: "visa.step3Title",
      subtitle: "visa.step3Subtitle",
      cta: "visa.getChecklist",
      canNext: Boolean(props.professionId),
    },
  };
  const c = config[step as 1 | 2 | 3];

  return (
    <>
      <div className={v.head}>
        {step > 1 ? (
          <button
            type="button"
            className={v.iconBtn}
            aria-label={t("visa.back")}
            onClick={props.onBack}
          >
            <Ic name="back" />
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={v.iconBtn}
          aria-label={t("visa.close")}
          onClick={props.onClose}
        >
          <Ic name="close" />
        </button>
      </div>

      <div className={v.progress} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn(v.progressBar, step >= n && v.progressOn)} />
        ))}
      </div>

      <div className={v.intro}>
        <h2 className={v.title}>{t(c.title)}</h2>
        <p className={v.subtitle}>{t(c.subtitle)}</p>
      </div>

      {props.loading ? (
        <div className={v.state}>{t("visa.loading")}</div>
      ) : props.error ? (
        <div className={v.state}>
          <p>{t("visa.loadError")}</p>
          <button type="button" className={v.retry} onClick={props.onRetry}>
            {t("visa.retry")}
          </button>
        </div>
      ) : (
        <div className={v.body}>
          {step === 2 && props.regions.length > 0 ? (
            <div className={v.chips}>
              {(["ALL", ...props.regions] as RegionFilter[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={cn(v.chip, props.region === r && v.chipOn)}
                  onClick={() => props.onPickRegion(r)}
                >
                  {t(REGION_LABEL[r])}
                </button>
              ))}
            </div>
          ) : null}

          <div className={v.options} role="radiogroup">
            {step === 1 &&
              props.citizenships.map((cz) => (
                <OptionRow
                  key={cz.id}
                  selected={props.citizenshipId === cz.id}
                  onSelect={() => props.onPickCitizenship(cz.id)}
                  emoji={cz.flag}
                  label={pickLoc(cz.name, locale)}
                />
              ))}

            {step === 2 &&
              props.destinations.map((d) => (
                <OptionRow
                  key={d.id}
                  selected={props.destinationId === d.id}
                  onSelect={() => props.onPickDestination(d.id)}
                  emoji={d.flag}
                  label={pickLoc(d.name, locale)}
                  sub={
                    d.salaryFromEur
                      ? t("visa.salaryFrom", { salary: d.salaryFromEur })
                      : undefined
                  }
                />
              ))}

            {step === 3 &&
              props.professions.map((p) => (
                <OptionRow
                  key={p.id}
                  selected={props.professionId === p.id}
                  onSelect={() => props.onPickProfession(p.id)}
                  icon={asIcon(p.icon)}
                  label={pickLoc(p.name, locale)}
                />
              ))}
          </div>
        </div>
      )}

      <div className={v.foot}>
        <button
          type="button"
          className={v.cta}
          disabled={!c.canNext}
          onClick={props.onNext}
        >
          {t(c.cta)}
          <Ic name="arrowRight" />
        </button>
      </div>
    </>
  );
}

function OptionRow({
  selected,
  onSelect,
  emoji,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  emoji?: string;
  icon?: IconName;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(v.option, selected && v.optionOn)}
      onClick={onSelect}
    >
      <span className={v.optionMark}>
        {emoji ? (
          <span className={v.flag}>{emoji}</span>
        ) : icon ? (
          <span className={v.optionIcon}>
            <Ic name={icon} />
          </span>
        ) : null}
      </span>
      <span className={v.optionText}>
        <span className={v.optionLabel}>{label}</span>
        {sub ? <span className={v.optionSub}>{sub}</span> : null}
      </span>
      <span className={cn(v.radio, selected && v.radioOn)} aria-hidden="true" />
    </button>
  );
}

// ─── Step 4: checklist ────────────────────────────────────────────────────────

interface ChecklistStepProps {
  locale: "en" | "ru" | "uz";
  t: TFn;
  loading: boolean;
  error: boolean;
  data: ReturnType<typeof useVisaChecklist>["data"];
  citizenship: { flag: string; name: LocRec } | null;
  profession: { name: LocRec } | null;
  expanded: string | null;
  onToggleSection: (id: string) => void;
  onToggleDoc: (doc: VisaDocument) => void;
  onFindJob: () => void;
  onChange: () => void;
  onClose: () => void;
  onRetry: () => void;
}

function ChecklistStep(props: ChecklistStepProps) {
  const { t, locale, data } = props;
  const destination = data?.destination ?? null;
  const percent =
    data && data.progress.total > 0
      ? Math.round((data.progress.ready / data.progress.total) * 100)
      : 0;

  return (
    <>
      <div className={cn(v.head, v.headTitled)}>
        <div className={v.headTitle}>
          {destination ? t("visa.checklistTitle", { country: pickLoc(destination.name, locale) }) : t("visa.title")}
        </div>
        <button
          type="button"
          className={v.iconBtn}
          aria-label={t("visa.close")}
          onClick={props.onClose}
        >
          <Ic name="close" />
        </button>
      </div>

      {props.loading ? (
        <div className={v.state}>{t("visa.loading")}</div>
      ) : props.error || !data || !destination ? (
        <div className={v.state}>
          <p>{t("visa.loadError")}</p>
          <button type="button" className={v.retry} onClick={props.onRetry}>
            {t("visa.retry")}
          </button>
        </div>
      ) : (
        <div className={v.checklistBody}>
          {/* Route summary */}
          <div className={v.route}>
            <span className={v.routeFlags}>
              <span className={v.flag}>{props.citizenship?.flag ?? "🌍"}</span>
              <span className={v.flag}>{destination.flag}</span>
            </span>
            <div className={v.routeText}>
              <div className={v.routeTitle}>
                {(props.citizenship
                  ? pickLoc(props.citizenship.name, locale)
                  : "") +
                  " → " +
                  pickLoc(destination.name, locale)}
              </div>
              <div className={v.routeSub}>
                {[
                  props.profession
                    ? pickLoc(props.profession.name, locale)
                    : null,
                  t("visa.workVisaChecklist"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <button type="button" className={v.changeBtn} onClick={props.onChange}>
              {t("visa.change")}
            </button>
          </div>

          {/* Job offer nudge */}
          <div className={v.offer}>
            <span className={v.offerIcon}>
              <Ic name="briefcase" />
            </span>
            <div className={v.offerText}>
              <div className={v.offerTitle}>{t("visa.jobOfferTitle")}</div>
              <p className={v.offerDesc}>{t("visa.jobOfferDesc")}</p>
            </div>
            <button
              type="button"
              className={v.offerBtn}
              onClick={props.onFindJob}
            >
              {t("visa.findJob")}
            </button>
          </div>

          {/* Progress */}
          <div className={v.progressCard}>
            <ProgressRing percent={percent} />
            <div className={v.progressInfo}>
              <div className={v.progressLabel}>
                {t("visa.docsReady", {
                  ready: data.progress.ready,
                  total: data.progress.total,
                })}
              </div>
              <div className={v.progressTrack}>
                <span
                  className={v.progressFill}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Official source */}
          {destination.officialSourceUrl ? (
            <p className={v.verify}>
              <Ic name="globe" />
              <span>
                {t("visa.verifyOfficial", {
                  country: pickLoc(destination.name, locale),
                })}{" "}
                <a
                  href={destination.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={v.verifyLink}
                >
                  {destination.officialSourceName
                    ? pickLoc(destination.officialSourceName, locale)
                    : destination.officialSourceUrl.replace(/^https?:\/\//, "")}
                </a>
              </span>
            </p>
          ) : null}

          {/* Sections */}
          <div className={v.sections}>
            {data.sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                t={t}
                locale={locale}
                expanded={props.expanded === section.id}
                onToggle={() => props.onToggleSection(section.id)}
                onToggleDoc={props.onToggleDoc}
              />
            ))}
          </div>

          {/* Job sites */}
          {data.jobSites.length > 0 ? (
            <div className={v.jobSites}>
              <div className={v.jobSitesTitle}>{t("visa.jobSitesTitle")}</div>
              <div className={v.jobSitesList}>
                {data.jobSites.map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={v.jobSite}
                  >
                    <span>{site.name}</span>
                    <Ic name="externalLink" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {/* Disclaimer */}
          <p className={v.disclaimer}>
            {pickLoc(data.disclaimer, locale)}
            {destination.lastUpdated
              ? ` ${t("visa.lastUpdated", { date: destination.lastUpdated })}`
              : ""}
          </p>
        </div>
      )}
    </>
  );
}

function SectionRow({
  section,
  t,
  locale,
  expanded,
  onToggle,
  onToggleDoc,
}: {
  section: VisaSection;
  t: TFn;
  locale: "en" | "ru" | "uz";
  expanded: boolean;
  onToggle: () => void;
  onToggleDoc: (doc: VisaDocument) => void;
}) {
  const ready = section.documents.filter((d) => d.checked).length;
  const isOpen = expanded && !section.locked;

  const onHeaderClick = () => {
    if (section.locked) {
      toast.message(t("visa.lockedToast"));
      return;
    }
    onToggle();
  };

  return (
    <div className={cn(v.section, section.locked && v.sectionLocked)}>
      <button type="button" className={v.sectionHead} onClick={onHeaderClick}>
        <span className={v.sectionIcon}>{section.icon ?? "📄"}</span>
        <span className={v.sectionMain}>
          <span className={v.sectionTitle}>{pickLoc(section.title, locale)}</span>
          <span className={v.sectionMeta}>
            {section.locked
              ? t("visa.documentsCount", { count: section.documentsCount })
              : t("visa.sectionReady", {
                  ready,
                  total: section.documentsCount,
                })}
          </span>
        </span>
        {section.locked ? (
          <span className={v.sectionRight}>
            <span className={v.importantBadge}>{t("visa.importantBadge")}</span>
            <Ic name="lock" />
          </span>
        ) : (
          <span className={v.sectionRight}>
            {section.access === "FREE" ? (
              <span className={v.freeBadge}>{t("visa.freeBadge")}</span>
            ) : null}
            <Ic name={isOpen ? "chevronUp" : "chevronDown"} />
          </span>
        )}
      </button>

      {isOpen ? (
        <div className={v.docs}>
          {section.documents.map((doc) => (
            <div key={doc.id} className={v.doc}>
              <button
                type="button"
                className={cn(v.check, doc.checked && v.checkOn)}
                aria-pressed={doc.checked}
                aria-label={pickLoc(doc.title, locale)}
                onClick={() => onToggleDoc(doc)}
              >
                {doc.checked ? <Ic name="checkBold" /> : null}
              </button>
              <div className={v.docText}>
                <div className={v.docTitleRow}>
                  <span className={cn(v.docTitle, doc.checked && v.docDone)}>
                    {pickLoc(doc.title, locale)}
                  </span>
                  <span className={cn(v.tag, v[`tag_${doc.tag}` as keyof typeof v])}>
                    {t(TAG_LABEL[doc.tag])}
                  </span>
                </div>
                {doc.description ? (
                  <p className={v.docDesc}>{pickLoc(doc.description, locale)}</p>
                ) : null}
                {doc.tip ? (
                  <p className={v.docTip}>💡 {pickLoc(doc.tip, locale)}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 15;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg className={v.ring} viewBox="0 0 36 36" aria-hidden="true">
      <circle className={v.ringTrack} cx="18" cy="18" r={r} />
      <circle
        className={v.ringFill}
        cx="18"
        cy="18"
        r={r}
        style={{ strokeDasharray: circ, strokeDashoffset: offset }}
      />
      <text className={v.ringText} x="18" y="19">
        {percent}%
      </text>
    </svg>
  );
}
