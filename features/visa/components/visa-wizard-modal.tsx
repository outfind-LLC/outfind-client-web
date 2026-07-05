"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { Ic, ICONS, type IconName } from "@/features/dashboard/components/app-icons";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/translate";

import { Flag } from "@/features/visa/components/flag";
import { pickLoc } from "@/features/visa/lib/localized";
import { useVisaModalStore } from "@/features/visa/store/visa-modal.store";
import {
  useSaveVisaPreference,
  useVisaBootstrap,
  useVisaPreference,
} from "@/features/visa/hooks/use-visa";
import type { VisaRegion } from "@/features/visa/types";
import v from "@/features/visa/styles/visa-wizard.module.css";

type Step = 1 | 2 | 3;
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

/** A profession's stored glyph name, guarded to a registered icon. */
function asIcon(name: string): IconName {
  return (name in ICONS ? name : "briefcase") as IconName;
}

/**
 * Visa onboarding modal — the three selection steps (citizenship → destination →
 * profession). A centered card on desktop, a bottom sheet on mobile, mounted
 * once in the app shell and opened via `useVisaModalStore`. Confirming step 3
 * saves the preference and navigates to the full-screen checklist at `/visa`
 * (rendered by `VisaScreen`); the checklist's "Change" button reopens this modal
 * over it. All reference data is backend-driven and cached.
 */
export function VisaWizardModal() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const open = useVisaModalStore((s) => s.open);
  const presetDestination = useVisaModalStore((s) => s.presetDestination);
  const close = useVisaModalStore((s) => s.close);

  // Onboarding is free for everyone — only the checklist's premium sections
  // carry a lock (opened from the checklist, not here).
  const bootstrap = useVisaBootstrap(open);
  const preference = useVisaPreference(open);
  const savePref = useSaveVisaPreference();

  const [step, setStep] = useState<Step>(1);
  const [citizenshipId, setCitizenshipId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [region, setRegion] = useState<RegionFilter>("ALL");

  // Prefill once per open from the saved selection (or an Uzbekistan default),
  // pre-selecting a preset destination when one is supplied.
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
    setStep(1);
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

  const availableRegions = useMemo(() => {
    const present = new Set(bootstrap.data?.destinations.map((d) => d.region));
    return REGION_ORDER.filter((r) => present.has(r));
  }, [bootstrap.data]);

  const filteredDestinations = useMemo(() => {
    const list = bootstrap.data?.destinations ?? [];
    return region === "ALL" ? list : list.filter((d) => d.region === region);
  }, [bootstrap.data, region]);

  if (!open) return null;

  const onConfirm = async () => {
    if (!professionId || !destinationId || !citizenshipId) return;
    try {
      await savePref.mutateAsync({ citizenshipId, destinationId, professionId });
      close();
      router.push(routes.visa);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("visa.loadError"));
    }
  };

  const onNext = () => {
    if (step === 3) {
      void onConfirm();
      return;
    }
    setStep((s) => ((s + 1) as Step));
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
        <SelectStep
          step={step}
          t={t}
          locale={locale}
          onClose={close}
          onBack={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          loading={bootstrap.isLoading}
          error={bootstrap.isError}
          saving={savePref.isPending}
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
          onNext={onNext}
        />
      </div>
    </div>
  );
}

// ─── Steps 1–3 ────────────────────────────────────────────────────────────────

type TFn = (key: MessageKey, params?: Record<string, string | number>) => string;
type LocRec = { uz: string; ru: string; en: string };

interface SelectStepProps {
  step: Step;
  t: TFn;
  locale: "en" | "ru" | "uz";
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  error: boolean;
  saving: boolean;
  onRetry: () => void;
  citizenships: { id: string; code: string; flag: string; name: LocRec }[];
  citizenshipId: string | null;
  onPickCitizenship: (id: string) => void;
  destinations: {
    id: string;
    code: string;
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

function SelectStep(props: SelectStepProps) {
  const { step, t, locale } = props;

  const config: Record<
    Step,
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
  const c = config[step];

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
                  flagCode={cz.code}
                  flagEmoji={cz.flag}
                  label={pickLoc(cz.name, locale)}
                />
              ))}

            {step === 2 &&
              props.destinations.map((d) => (
                <OptionRow
                  key={d.id}
                  selected={props.destinationId === d.id}
                  onSelect={() => props.onPickDestination(d.id)}
                  flagCode={d.code}
                  flagEmoji={d.flag}
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
          disabled={!c.canNext || props.saving}
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
  flagCode,
  flagEmoji,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  flagCode?: string;
  flagEmoji?: string;
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
        {icon ? (
          <span className={v.optionIcon}>
            <Ic name={icon} />
          </span>
        ) : (
          <Flag code={flagCode ?? ""} emoji={flagEmoji} size={34} />
        )}
      </span>
      <span className={v.optionText}>
        <span className={v.optionLabel}>{label}</span>
        {sub ? <span className={v.optionSub}>{sub}</span> : null}
      </span>
      <span className={cn(v.radio, selected && v.radioOn)} aria-hidden="true" />
    </button>
  );
}
