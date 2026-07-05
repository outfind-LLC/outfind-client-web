"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { toast } from "sonner";

import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useUpdateJobSearchInfo } from "@/features/profile/hooks/use-worker-profile-mutations";
import { useSession } from "@/features/auth/hooks/use-session";
import { Ic } from "@/features/dashboard/components/app-icons";
import { useT } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import s from "@/features/profile/styles/profile-setup.module.css";

/**
 * First-time worker profile setup — the app's bottom-sheet design system (same
 * shell as the CV wizard / job-search modals). A worker has no profile until
 * they save the core job-search fields; `PATCH /worker/profile/job-search`
 * upserts (creates) the profile, after which the full editable profile view
 * takes over. The modal opens automatically; closing it leaves an empty-state
 * card that reopens it, so the page is never a dead end.
 */
export function WorkerProfileSetup() {
  const t = useT();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    track(ANALYTICS_EVENTS.PROFILE_STARTED, { input_mode: "form" });
  }, []);

  return (
    <>
      <div className={s.empty}>
        <span className={s.emptyBadge}>
          <Ic name="user" />
        </span>
        <h2 className={s.emptyTitle}>{t("profile.setupEmptyTitle")}</h2>
        <p className={s.emptyDesc}>{t("profile.setupEmptyDesc")}</p>
        <button
          type="button"
          className={s.emptyCta}
          onClick={() => setOpen(true)}
        >
          {t("profile.setupEmptyCta")}
        </button>
      </div>
      {open ? <SetupModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function SetupModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { user } = useSession();
  const mutation = useUpdateJobSearchInfo();

  const [profession, setProfession] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [skills, setSkills] = useState<string[]>([]);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("0");
  const [abroad, setAbroad] = useState(false);

  const firstName = user?.name?.split(" ")[0];

  // Escape closes; body scroll locks while open (matches the shared modals).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profession.trim()) {
      toast.error(t("profile.setupNeedProfession"));
      return;
    }
    mutation.mutate(
      {
        profession: profession.trim(),
        targetCountries,
        experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
        abroadExperience: abroad,
        skills,
        expectedSalaryMin: Math.max(0, parseInt(salaryMin, 10) || 0),
      },
      {
        onSuccess: () => toast.success(t("profile.setupSuccess")),
        onError: (error) =>
          toast.error(
            isApiClientError(error) ? error.message : t("profile.setupError"),
          ),
      },
    );
  };

  return (
    <div
      className={s.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("profile.setupTitle")}
      >
        <div className={s.head}>
          <button
            type="button"
            className={s.iconBtn}
            aria-label={t("chat.close")}
            onClick={onClose}
          >
            <Ic name="close" />
          </button>
        </div>

        <div className={s.badge}>
          <Ic name="user" className={s.badgeIc} />
        </div>
        <div className={s.intro}>
          <h2 className={s.title}>
            {firstName
              ? t("profile.setupTitleNamed", { name: firstName })
              : t("profile.setupTitle")}
          </h2>
          <p className={s.subtitle}>{t("profile.setupSubtitle")}</p>
        </div>

        <form onSubmit={submit} className={s.form}>
          <div className={s.body}>
            <div className={s.fields}>
              <div className={s.field}>
                <label className={s.label} htmlFor="setup-profession">
                  {t("profile.setupProfession")} <span className={s.req}>*</span>
                </label>
                <input
                  id="setup-profession"
                  className={s.input}
                  value={profession}
                  onChange={(event) => setProfession(event.target.value)}
                  placeholder={t("profile.setupProfessionPh")}
                  autoFocus
                  autoComplete="off"
                  maxLength={100}
                />
              </div>

              <div className={s.grid2}>
                <div className={s.field}>
                  <label className={s.label} htmlFor="setup-years">
                    {t("profile.setupYears")}
                  </label>
                  <input
                    id="setup-years"
                    className={s.input}
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(event) =>
                      setExperienceYears(event.target.value)
                    }
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label} htmlFor="setup-salary">
                    {t("profile.setupSalary")}
                  </label>
                  <input
                    id="setup-salary"
                    className={s.input}
                    type="number"
                    min={0}
                    value={salaryMin}
                    onChange={(event) => setSalaryMin(event.target.value)}
                  />
                </div>
              </div>

              <div className={s.field}>
                <label className={s.label} htmlFor="setup-skills">
                  {t("profile.setupSkills")}
                </label>
                <TagField
                  id="setup-skills"
                  value={skills}
                  onChange={setSkills}
                  placeholder={t("profile.setupSkillsPh")}
                />
                <span className={s.hint}>{t("profile.setupSkillsHint")}</span>
              </div>

              <div className={s.field}>
                <label className={s.label} htmlFor="setup-countries">
                  {t("profile.setupCountries")}
                </label>
                <TagField
                  id="setup-countries"
                  value={targetCountries}
                  onChange={setTargetCountries}
                  placeholder={t("profile.setupCountriesPh")}
                />
                <span className={s.hint}>
                  {t("profile.setupCountriesHint")}
                </span>
              </div>

              <div className={s.switchRow}>
                <span className={s.switchLabel}>
                  {t("profile.setupAbroad")}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={abroad}
                  aria-label={t("profile.setupAbroad")}
                  className={cn(s.switch, abroad && s.switchOn)}
                  onClick={() => setAbroad((v) => !v)}
                >
                  <span className={s.knob} />
                </button>
              </div>
            </div>
          </div>

          <div className={s.foot}>
            <button
              type="submit"
              className={s.cta}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t("profile.setupCreating")
                : t("profile.setupCta")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Minimal design-system tag input: Enter (or comma) adds the draft as a chip,
 * Backspace on an empty draft removes the last chip.
 */
function TagField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const next = draft.trim().replace(/,+$/, "");
    if (next && !value.includes(next)) onChange([...value, next]);
    setDraft("");
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addDraft();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={s.tags}
      onClick={(event) =>
        (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()
      }
    >
      {value.map((tag) => (
        <span key={tag} className={s.chip}>
          {tag}
          <button
            type="button"
            className={s.chipX}
            aria-label={`${tag} ×`}
            onClick={(event) => {
              event.stopPropagation();
              onChange(value.filter((item) => item !== tag));
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        className={s.tagInput}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addDraft}
        placeholder={value.length === 0 ? placeholder : ""}
        autoComplete="off"
        maxLength={60}
      />
    </div>
  );
}
