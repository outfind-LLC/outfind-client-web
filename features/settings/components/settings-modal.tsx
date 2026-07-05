"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  useLogout,
  useSwitchAccount,
} from "@/features/auth/hooks/use-auth-mutations";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  useEmployerProfile,
  useWorkerProfile,
} from "@/features/profile/hooks/use-profile";
import { CURRENCIES } from "@/features/profile/constants/worker-profile.constants";
import {
  useUpdateHiringPrefs,
  useUpdateWorkerPrefs,
} from "@/features/settings/hooks/use-pref-mutations";
import {
  useSetAppLanguage,
  useUpdateSettings,
  useUserSettings,
} from "@/features/settings/hooks/use-user-settings";
import { toAppTheme } from "@/features/settings/lib/settings-maps";
import { isApiClientError } from "@/lib/api/error";
import { ICONS as REG } from "@/components/icons";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { type MessageKey } from "@/lib/i18n/translate";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_TYPE,
  WORK_FORMAT,
  type HiringStatus,
  type JobAlertFrequency,
  type ResumeVisibility,
  type VacancyType,
} from "@/interfaces/enums";
import type { UpdateUserSettingsPayload } from "@/interfaces/user-settings.interface";
import s from "@/features/settings/styles/settings.module.css";

/* ---------------- Icons (exact prototype paths) ---------------- */
/* Settings icon names → central registry entries (glyph data: @/components/icons) */
const SETTINGS_ICONS = {
  gear: REG.gear,
  bell: REG.bell,
  briefcase: REG.briefcaseAlt,
  shield: REG.shield,
  user: REG.userSmall,
  lock: REG.lock,
  chev: REG.chevronRightBold,
  chevD: REG.chevronDownRound,
  check: REG.check,
  x: REG.closeMed,
  mail: REG.mailRound,
  phone: REG.phoneClassicThin,
  key: REG.key,
  verified: REG.verifiedOutline,
  trash: REG.trash,
  logout: REG.logoutAlt,
  sun: REG.sun,
  moon: REG.moon,
  desktop: REG.desktop,
} as const;
type SettingsIcon = keyof typeof SETTINGS_ICONS;

function SIc({ name, className }: { name: SettingsIcon; className?: string }) {
  return (
    <span
      className={cn(s.ic, className)}
      style={{ "--i": SETTINGS_ICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

/* ---------------- Option model ---------------- */
interface Opt {
  v: string;
  l: string;
  dot?: string;
  icon?: SettingsIcon;
}

/* ---------------- Reusable controls ---------------- */
function Row({
  label,
  desc,
  control,
  stack,
}: {
  label: string;
  desc?: string;
  control: ReactNode;
  stack?: boolean;
}) {
  return (
    <div className={cn(s["set-row"], stack && s["set-row--stack"])}>
      <div className={s["set-row-main"]}>
        <div className={s["set-row-l"]}>{label}</div>
        {desc ? <div className={s["set-row-d"]}>{desc}</div> : null}
      </div>
      <div className={s["set-row-ctl"]}>{control}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={s["set-switch"]}
      onClick={onChange}
    >
      <span className={s["set-switch-kn"]} />
    </button>
  );
}

function SettingsSelect({
  value,
  options,
  onChange,
  withDot,
}: {
  value: string;
  options: Opt[];
  onChange: (value: string) => void;
  withDot?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cur = options.find((o) => o.v === value) ?? options[0];

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        className={s["set-ddl"]}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {withDot && cur.dot ? (
          <span className={s["set-ddl-dot"]} style={{ background: cur.dot }} />
        ) : null}
        <span className={s["set-ddl-v"]}>{cur.l}</span>
        <SIc name="chevD" />
      </button>
      {open ? (
        <div
          className={cn(s["set-pop"], s.show)}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            left: "auto",
          }}
          role="menu"
        >
          {options.map((o) => (
            <button
              key={o.v}
              type="button"
              role="menuitemradio"
              aria-checked={o.v === value}
              className={cn(s["set-pop-item"], o.v === value && s.sel)}
              onClick={() => {
                onChange(o.v);
                setOpen(false);
              }}
            >
              {o.dot ? (
                <span
                  className={s["set-pop-dot"]}
                  style={{ background: o.dot }}
                />
              ) : o.icon ? (
                <span
                  className={s["set-pop-dot"]}
                  style={{ background: "transparent" }}
                >
                  <SIc name={o.icon} />
                </span>
              ) : null}
              <span className={s["set-pop-item-l"]}>{o.l}</span>
              <span
                className={s["set-pop-check"]}
                style={{ "--i": SETTINGS_ICONS.check } as CSSProperties}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}

function GoRow({ value, onClick }: { value?: string; onClick: () => void }) {
  return (
    <button type="button" className={s["set-go"]} onClick={onClick}>
      {value ? <span className={s["set-go-v"]}>{value}</span> : null}
      <SIc name="chev" />
    </button>
  );
}

/** Shared shell for the anchored inline-edit popovers (no window.prompt). */
function useEditPop() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

function EditActions({
  canSave,
  onCancel,
  onSave,
}: {
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className={s["set-edit-actions"]}>
      <button
        type="button"
        className={cn(s["set-edit-btn"], s["set-edit-btn-ghost"])}
        onClick={onCancel}
      >
        {t("settings.popCancel")}
      </button>
      <button
        type="button"
        className={cn(s["set-edit-btn"], s["set-edit-btn-primary"])}
        disabled={!canSave}
        onClick={onSave}
      >
        {t("settings.popSave")}
      </button>
    </div>
  );
}

/** Value row that opens a small anchored text form (e.g. preferred location). */
function TextEdit({
  rowValue,
  label,
  placeholder,
  initial,
  maxLength = 100,
  onSave,
}: {
  rowValue: string;
  label: string;
  placeholder: string;
  initial: string;
  maxLength?: number;
  onSave: (value: string) => void;
}) {
  const { open, setOpen, ref } = useEditPop();
  const [draft, setDraft] = useState(initial);
  const id = useId();

  const save = () => {
    const value = draft.trim();
    if (!value) return;
    onSave(value);
    setOpen(false);
  };

  return (
    <span ref={ref} className={s["set-edit"]}>
      <button
        type="button"
        className={s["set-go"]}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) setDraft(initial);
          setOpen(!open);
        }}
      >
        <span className={s["set-go-v"]}>{rowValue}</span>
        <SIc name="chev" />
      </button>
      {open ? (
        <div className={s["set-editpop"]} role="dialog" aria-label={label}>
          <label className={s["set-edit-label"]} htmlFor={id}>
            {label}
          </label>
          <input
            id={id}
            className={s["set-edit-inp"]}
            value={draft}
            maxLength={maxLength}
            placeholder={placeholder}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
            }}
          />
          <EditActions
            canSave={draft.trim().length > 0}
            onCancel={() => setOpen(false)}
            onSave={save}
          />
        </div>
      ) : null}
    </span>
  );
}

const CURRENCY_OPTS: Opt[] = CURRENCIES.map((c) => ({ v: c, l: c }));
/** Backend cap on `expectedSalaryRange.min`. */
const MAX_SALARY = 100_000_000;

/** Value row that opens an amount + currency form (expected salary). */
function SalaryEdit({
  label,
  current,
  onSave,
}: {
  label: string;
  current: { min: number; currency: string } | null;
  onSave: (min: number, currency: string) => void;
}) {
  const { t } = useI18n();
  const { open, setOpen, ref } = useEditPop();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(current?.currency ?? "UZS");
  const id = useId();

  const digits = amount.replace(/[^\d]/g, "").slice(0, 9);
  const num = Number(digits || "0");
  const canSave = num > 0 && num <= MAX_SALARY;
  // Grouped display while typing: 9500000 → "9 500 000".
  const display = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const rowValue = current
    ? `${current.min.toLocaleString()} ${current.currency}`
    : t("settings.notAdded");

  const save = () => {
    if (!canSave) return;
    onSave(num, currency);
    setOpen(false);
  };

  return (
    <span ref={ref} className={s["set-edit"]}>
      <button
        type="button"
        className={s["set-go"]}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setAmount(current ? String(current.min) : "");
            setCurrency(current?.currency ?? "UZS");
          }
          setOpen(!open);
        }}
      >
        <span className={s["set-go-v"]}>{rowValue}</span>
        <SIc name="chev" />
      </button>
      {open ? (
        <div className={s["set-editpop"]} role="dialog" aria-label={label}>
          <label className={s["set-edit-label"]} htmlFor={id}>
            {label}
          </label>
          <div className={s["set-edit-row"]}>
            <input
              id={id}
              className={s["set-edit-inp"]}
              value={display}
              inputMode="numeric"
              placeholder={t("settings.salaryPh")}
              autoFocus
              onChange={(event) => setAmount(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
              }}
            />
            <span className={s["set-edit-cur"]}>
              <SettingsSelect
                value={currency}
                options={CURRENCY_OPTS}
                onChange={setCurrency}
              />
            </span>
          </div>
          <EditActions
            canSave={canSave}
            onCancel={() => setOpen(false)}
            onSave={save}
          />
        </div>
      ) : null}
    </span>
  );
}

function Pill({
  label,
  kind = "ghost",
  icon,
  onClick,
}: {
  label: string;
  kind?: "ghost" | "danger";
  icon?: SettingsIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        s["set-pill"],
        kind === "danger" ? s["set-pill-danger"] : s["set-pill-ghost"],
      )}
      onClick={onClick}
    >
      {icon ? <SIc name={icon} /> : null}
      {label}
    </button>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <div className={s["set-grouplabel"]}>{children}</div>;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P"
  );
}

type SectionId =
  | "general"
  | "notif"
  | "jobs"
  | "privacy"
  | "account"
  | "security";
const SECTIONS: {
  id: SectionId;
  icon: SettingsIcon;
  label: (employer: boolean) => MessageKey;
}[] = [
  { id: "general", icon: "gear", label: () => "settings.secGeneral" },
  { id: "notif", icon: "bell", label: () => "settings.secNotif" },
  {
    id: "jobs",
    icon: "briefcase",
    label: (e) => (e ? "settings.secHiring" : "settings.secJobs"),
  },
  { id: "privacy", icon: "shield", label: () => "settings.secPrivacy" },
  { id: "account", icon: "user", label: () => "settings.secAccount" },
  // TODO: re-enable "Security & login" when its backend ships (content kept below).
  // { id: "security", icon: "lock", label: () => "settings.secSecurity" },
];

// TODO: re-enable the account-type switch when its backend flow is finalised.
// Kept (not removed) so it can be turned back on step by step.
const ACCOUNT_TYPE_SWITCH_ENABLED: boolean = false;

/**
 * Settings — the prototype's modal-on-desktop / tabs-on-mobile surface, rendered
 * as a route overlay. Everything persists server-side: app preferences on
 * `PATCH /me/settings`, worker job-search rows on `PATCH /worker/profile`, and
 * employer hiring rows on `PATCH /employer/profile` — no localStorage. Every
 * label runs through the shared i18n layer (en/ru/uz).
 */
export function SettingsModal() {
  const router = useRouter();
  const { user, isWorker, isEmployer } = useSession();
  const { t, locale } = useI18n();
  const setAppLanguage = useSetAppLanguage();
  const { theme, setTheme } = useTheme();
  const switchAccount = useSwitchAccount();
  const logout = useLogout();
  const { data: prefs } = useUserSettings(user !== null);
  const updateSettings = useUpdateSettings();
  const workerProfileQ = useWorkerProfile(isWorker);
  const employerProfileQ = useEmployerProfile(isEmployer);
  const updateWorkerPrefs = useUpdateWorkerPrefs();
  const updateHiringPrefs = useUpdateHiringPrefs();
  const [active, setActive] = useState<SectionId>("general");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const patch = (payload: UpdateUserSettingsPayload) =>
    updateSettings.mutate(payload);

  const close = () => router.back();

  // Escape closes the modal.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const employer = user.accountType === ACCOUNT_TYPE.EMPLOYER;
  const workerProfile = workerProfileQ.data;
  const companyProfile = employerProfileQ.data;

  // Localized option sets (rebuilt per render so they follow the active locale).
  const langOpts: Opt[] = LOCALES.map((code) => ({
    v: code,
    l: LOCALE_LABELS[code],
  }));
  const themeOpts: Opt[] = [
    { v: "light", l: t("settings.themeLight"), icon: "sun" },
    { v: "dark", l: t("settings.themeDark"), icon: "moon" },
    { v: "system", l: t("settings.themeSystem"), icon: "desktop" },
  ];
  const freqOpts: Opt[] = [
    { v: "INSTANT", l: t("settings.freqInstant") },
    { v: "DAILY", l: t("settings.freqDaily") },
    { v: "WEEKLY", l: t("settings.freqWeekly") },
    { v: "OFF", l: t("settings.freqOff") },
  ];
  const searchOpts: Opt[] = [
    { v: "ACTIVE", l: t("settings.searchActive"), dot: "var(--accent-brand)" },
    { v: "PASSIVE", l: t("settings.searchOpen"), dot: "var(--warning)" },
    { v: "OFFLINE", l: t("settings.searchClosed"), dot: "var(--gray-400)" },
  ];
  const hireOpts: Opt[] = [
    {
      v: "ACTIVELY_HIRING",
      l: t("settings.hireActive"),
      dot: "var(--accent-brand)",
    },
    {
      v: "OPEN_TO_APPLICATIONS",
      l: t("settings.hireOpen"),
      dot: "var(--warning)",
    },
    { v: "PAUSED", l: t("settings.hirePaused"), dot: "var(--gray-400)" },
  ];
  const empOpts: Opt[] = [
    { v: "FULL_TIME", l: t("settings.empFull") },
    { v: "PART_TIME", l: t("settings.empPart") },
    { v: "SHIFT_WORK", l: t("settings.empShift") },
    { v: "any", l: t("settings.empAny") },
  ];
  const visOpts: Opt[] = [
    {
      v: "EVERYONE",
      l: employer ? t("settings.visAllHire") : t("settings.visAll"),
    },
    {
      v: "APPLIED_ONLY",
      l: employer ? t("settings.visAppliedHire") : t("settings.visApplied"),
    },
    { v: "HIDDEN", l: t("settings.visHidden") },
  ];

  /** Single-select UI over the profile's employment-types array. */
  const employmentChoice = (types: string[]): string =>
    types.length === 1 && empOpts.some((o) => o.v === types[0])
      ? types[0]
      : "any";

  const switchTo = (target: "seeker" | "employer") => {
    const next =
      target === "employer" ? ACCOUNT_TYPE.EMPLOYER : ACCOUNT_TYPE.WORKER;
    if (next === user.accountType) return;
    switchAccount.mutate(next, {
      onSuccess: () => toast.success(t("settings.toastAcctSwitched")),
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("settings.errAcctSwitch"),
        ),
    });
  };

  const doLogout = () => {
    if (!window.confirm(t("settings.confirmLogout"))) return;
    logout.mutate(undefined, {
      onError: (error) =>
        toast.error(
          isApiClientError(error) ? error.message : t("settings.errLogout"),
        ),
    });
  };

  const sections: Record<SectionId, ReactNode> = {
    general: (
      <>
        {!user.email && !bannerDismissed ? (
          <div className={s["set-banner"]}>
            <div className={s["set-banner-ic"]}>
              <SIc name="shield" />
            </div>
            <div className={s["set-banner-main"]}>
              <div className={s["set-banner-t"]}>
                {t("settings.bannerTitle")}
              </div>
              <div className={s["set-banner-d"]}>
                {t("settings.bannerDesc")}
              </div>
              <button
                type="button"
                className={s["set-banner-btn"]}
                onClick={() => toast(t("settings.toastEmailSoon"))}
              >
                {t("settings.bannerBtn")}
              </button>
            </div>
            <button
              type="button"
              className={s["set-banner-x"]}
              aria-label={t("settings.ariaDismiss")}
              onClick={() => setBannerDismissed(true)}
            >
              <SIc name="x" />
            </button>
          </div>
        ) : null}

        {/* TODO: Account type switch — hidden until its backend flow is ready. */}
        {ACCOUNT_TYPE_SWITCH_ENABLED ? (
          <>
            <GroupLabel>{t("settings.acctType")}</GroupLabel>
            <div className={s["set-acct"]}>
              <button
                type="button"
                className={s["set-acct-opt"]}
                aria-pressed={!employer}
                onClick={() => switchTo("seeker")}
              >
                <span className={s.t}>{t("settings.acctSeeker")}</span>
                <span className={s.d}>{t("settings.acctSeekerD")}</span>
              </button>
              <button
                type="button"
                className={s["set-acct-opt"]}
                aria-pressed={employer}
                onClick={() => switchTo("employer")}
              >
                <span className={s.t}>{t("settings.acctEmployer")}</span>
                <span className={s.d}>{t("settings.acctEmployerD")}</span>
              </button>
            </div>
          </>
        ) : null}

        <Row
          label={t("settings.lang")}
          desc={t("settings.langD")}
          control={
            <SettingsSelect
              value={locale}
              options={langOpts}
              onChange={(v) => setAppLanguage(v as Locale)}
            />
          }
        />
        <Row
          label={t("settings.appear")}
          desc={t("settings.appearD")}
          control={
            <SettingsSelect
              value={theme ?? "system"}
              options={themeOpts}
              onChange={(v) => {
                setTheme(v);
                const mapped = toAppTheme(v);
                if (mapped) patch({ theme: mapped });
              }}
            />
          }
        />
        <Row
          label={t("settings.enter")}
          desc={t("settings.enterD")}
          control={
            <Toggle
              checked={prefs?.enterToSend ?? true}
              onChange={() =>
                patch({ enterToSend: !(prefs?.enterToSend ?? true) })
              }
            />
          }
        />
      </>
    ),
    notif: (
      <>
        <GroupLabel>{t("settings.pushGroup")}</GroupLabel>
        <Row
          label={employer ? t("settings.notifMsgHire") : t("settings.notifMsg")}
          control={
            <Toggle
              checked={prefs?.notifMessages ?? true}
              onChange={() =>
                patch({ notifMessages: !(prefs?.notifMessages ?? true) })
              }
            />
          }
        />
        <Row
          label={
            employer ? t("settings.notifStatusHire") : t("settings.notifStatus")
          }
          desc={
            employer
              ? t("settings.notifStatusDHire")
              : t("settings.notifStatusD")
          }
          control={
            <Toggle
              checked={prefs?.notifStatus ?? true}
              onChange={() =>
                patch({ notifStatus: !(prefs?.notifStatus ?? true) })
              }
            />
          }
        />
        <Row
          label={
            employer ? t("settings.notifJobsHire") : t("settings.notifJobs")
          }
          desc={
            employer ? t("settings.notifJobsDHire") : t("settings.notifJobsD")
          }
          control={
            <Toggle
              checked={prefs?.notifJobs ?? true}
              onChange={() => patch({ notifJobs: !(prefs?.notifJobs ?? true) })}
            />
          }
        />
        <Row
          label={t("settings.sounds")}
          control={
            <Toggle
              checked={prefs?.soundEnabled ?? true}
              onChange={() =>
                patch({ soundEnabled: !(prefs?.soundEnabled ?? true) })
              }
            />
          }
        />
        <GroupLabel>{t("settings.emailGroup")}</GroupLabel>
        <Row
          label={employer ? t("settings.emailJobHire") : t("settings.emailJob")}
          control={
            <Toggle
              checked={prefs?.notifEmail ?? false}
              onChange={() => {
                const next = !(prefs?.notifEmail ?? false);
                patch({ notifEmail: next });
                if (next) toast(t("settings.toastAlertsOn"));
              }}
            />
          }
        />
        <Row
          label={t("settings.freq")}
          control={
            <SettingsSelect
              value={prefs?.jobAlertFrequency ?? "DAILY"}
              options={freqOpts}
              onChange={(v) =>
                patch({ jobAlertFrequency: v as JobAlertFrequency })
              }
            />
          }
        />
      </>
    ),
    jobs: employer ? (
      employerProfileQ.isLoading ? null : !companyProfile ? (
        <div className={s["set-row"]}>
          <div className={s["set-row-main"]}>
            <div className={s["set-row-d"]}>
              {t("settings.hiringNoProfile")}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Row
            label={t("settings.hStatus")}
            desc={t("settings.hStatusD")}
            control={
              <SettingsSelect
                value={companyProfile.hiringStatus}
                options={hireOpts}
                withDot
                onChange={(v) =>
                  updateHiringPrefs.mutate({ hiringStatus: v as HiringStatus })
                }
              />
            }
          />
          <Row
            label={t("settings.hEmpType")}
            control={
              <SettingsSelect
                value={employmentChoice(companyProfile.hiringRoles)}
                options={empOpts}
                onChange={(v) =>
                  updateHiringPrefs.mutate({
                    hiringRoles: v === "any" ? [] : [v as VacancyType],
                  })
                }
              />
            }
          />
          <Row
            label={t("settings.hLoc")}
            control={
              <TextEdit
                rowValue={
                  companyProfile.defaultJobLocation ?? t("settings.notAdded")
                }
                label={t("settings.hLoc")}
                placeholder={t("settings.locationPh")}
                initial={companyProfile.defaultJobLocation ?? ""}
                onSave={(v) =>
                  updateHiringPrefs.mutate({ defaultJobLocation: v })
                }
              />
            }
          />
          <Row
            label={t("settings.hRemote")}
            control={
              <Toggle
                checked={companyProfile.openToRemote}
                onChange={() =>
                  updateHiringPrefs.mutate({
                    openToRemote: !companyProfile.openToRemote,
                  })
                }
              />
            }
          />
          <Row
            label={t("settings.hScreen")}
            desc={t("settings.hScreenD")}
            control={
              <Toggle
                checked={companyProfile.aiScreening}
                onChange={() =>
                  updateHiringPrefs.mutate({
                    aiScreening: !companyProfile.aiScreening,
                  })
                }
              />
            }
          />
          <Row
            label={t("settings.hAutoInvite")}
            desc={t("settings.hAutoInviteD")}
            control={
              <Toggle
                checked={companyProfile.autoInviteTopMatches}
                onChange={() =>
                  updateHiringPrefs.mutate({
                    autoInviteTopMatches: !companyProfile.autoInviteTopMatches,
                  })
                }
              />
            }
          />
        </>
      )
    ) : workerProfileQ.isLoading ? null : !workerProfile ? (
      <div className={s["set-row"]}>
        <div className={s["set-row-main"]}>
          <div className={s["set-row-d"]}>{t("settings.jobsNoProfile")}</div>
        </div>
      </div>
    ) : (
      <>
        <Row
          label={t("settings.jStatus")}
          desc={t("settings.jStatusD")}
          control={
            <SettingsSelect
              value={workerProfile.workerStatus}
              options={searchOpts}
              withDot
              onChange={(v) =>
                updateWorkerPrefs.mutate({
                  workerStatus: v as "ACTIVE" | "PASSIVE" | "OFFLINE",
                })
              }
            />
          }
        />
        <Row
          label={t("settings.jEmp")}
          control={
            <SettingsSelect
              value={employmentChoice(workerProfile.employmentTypes)}
              options={empOpts}
              onChange={(v) =>
                updateWorkerPrefs.mutate({
                  employmentTypes: v === "any" ? [] : [v],
                })
              }
            />
          }
        />
        <Row
          label={t("settings.jSalary")}
          control={
            <SalaryEdit
              label={t("settings.jSalary")}
              current={
                workerProfile.expectedSalaryRange
                  ? {
                      min: workerProfile.expectedSalaryRange.min,
                      currency: workerProfile.expectedSalaryRange.currency,
                    }
                  : null
              }
              onSave={(min, currency) =>
                updateWorkerPrefs.mutate({
                  expectedSalaryRange: {
                    min,
                    max: workerProfile.expectedSalaryRange?.max ?? null,
                    currency,
                  },
                })
              }
            />
          }
        />
        <Row
          label={t("settings.jLoc")}
          control={
            <TextEdit
              rowValue={workerProfile.targetCities[0] ?? t("settings.notAdded")}
              label={t("settings.jLoc")}
              placeholder={t("settings.locationPh")}
              initial={workerProfile.targetCities[0] ?? ""}
              onSave={(v) => updateWorkerPrefs.mutate({ targetCities: [v] })}
            />
          }
        />
        <Row
          label={t("settings.jRemote")}
          control={
            <Toggle
              checked={workerProfile.workFormats.includes(WORK_FORMAT.REMOTE)}
              onChange={() =>
                updateWorkerPrefs.mutate({
                  workFormats: workerProfile.workFormats.includes(
                    WORK_FORMAT.REMOTE,
                  )
                    ? workerProfile.workFormats.filter(
                        (f) => f !== WORK_FORMAT.REMOTE,
                      )
                    : [...workerProfile.workFormats, WORK_FORMAT.REMOTE],
                })
              }
            />
          }
        />
        <Row
          label={t("settings.jRelocate")}
          control={
            <Toggle
              checked={workerProfile.readyToRelocate}
              onChange={() =>
                updateWorkerPrefs.mutate({
                  readyToRelocate: !workerProfile.readyToRelocate,
                })
              }
            />
          }
        />
      </>
    ),
    privacy: (
      <>
        <Row
          label={employer ? t("settings.visHire") : t("settings.vis")}
          desc={employer ? t("settings.visDHire") : t("settings.visD")}
          control={
            <SettingsSelect
              value={prefs?.resumeVisibility ?? "EVERYONE"}
              options={visOpts}
              onChange={(v) =>
                patch({ resumeVisibility: v as ResumeVisibility })
              }
            />
          }
        />
        <Row
          label={employer ? t("settings.hiddenHire") : t("settings.hidden")}
          desc={employer ? t("settings.hiddenDHire") : t("settings.hiddenD")}
          control={
            <GoRow
              value={t("settings.none")}
              onClick={() => toast(t("settings.toastNothingHidden"))}
            />
          }
        />
        <Row
          label={t("settings.online")}
          control={
            <Toggle
              checked={prefs?.showOnline ?? true}
              onChange={() =>
                patch({ showOnline: !(prefs?.showOnline ?? true) })
              }
            />
          }
        />
        <Row
          label={t("settings.receipts")}
          desc={
            employer ? t("settings.receiptsDHire") : t("settings.receiptsD")
          }
          control={
            <Toggle
              checked={prefs?.readReceipts ?? true}
              onChange={() =>
                patch({ readReceipts: !(prefs?.readReceipts ?? true) })
              }
            />
          }
        />
        <Row
          label={employer ? t("settings.callsHire") : t("settings.calls")}
          control={
            <Toggle
              checked={prefs?.allowCalls ?? true}
              onChange={() =>
                patch({ allowCalls: !(prefs?.allowCalls ?? true) })
              }
            />
          }
        />
      </>
    ),
    account: (
      <>
        <div className={s["set-row"]}>
          <div className={s["set-id"]}>
            <span className={s["set-id-av"]}>{initials(user.name)}</span>
            <div>
              <div className={s["set-id-name"]}>{user.name}</div>
              <div className={s["set-id-sub"]}>
                {employer ? t("settings.subEmployer") : t("settings.subSeeker")}
              </div>
            </div>
          </div>
          <div className={s["set-row-ctl"]}>
            <Pill
              label={t("settings.edit")}
              onClick={() => toast(t("settings.toastEditProfile"))}
            />
          </div>
        </div>

        <GroupLabel>{t("settings.contact")}</GroupLabel>
        <Row
          label={t("settings.email")}
          desc={user.email ?? t("settings.notAdded")}
          control={
            <Pill
              label={user.email ? t("settings.change") : t("settings.add")}
              onClick={() => toast(t("settings.toastEmailSoon"))}
            />
          }
        />
        {user.telegramUsername ? (
          <Row
            label="Telegram"
            desc={`@${user.telegramUsername}`}
            control={
              <span className={cn(s["set-conn"], s["is-on"])}>
                <span className={s["set-conn-dot"]} />
                {t("settings.connected")}
              </span>
            }
          />
        ) : null}

        <GroupLabel>{t("settings.connGroup")}</GroupLabel>
        <Row
          label="Google"
          desc={
            user.provider === "GOOGLE"
              ? t("settings.connected")
              : t("settings.signInFaster")
          }
          control={
            user.provider === "GOOGLE" ? (
              <span className={cn(s["set-conn"], s["is-on"])}>
                <span className={s["set-conn-dot"]} />
                {t("settings.connected")}
              </span>
            ) : (
              <Pill
                label={t("settings.connect")}
                onClick={() => toast(t("settings.toastConnectGoogle"))}
              />
            )
          }
        />

        <GroupLabel>{t("settings.danger")}</GroupLabel>
        <Row
          label={t("settings.logout")}
          desc={t("settings.logoutD")}
          control={
            <Pill
              label={t("settings.logout")}
              icon="logout"
              onClick={doLogout}
            />
          }
        />
        <Row
          stack
          label={
            employer ? t("settings.delAccountHire") : t("settings.delAccount")
          }
          desc={employer ? t("settings.delDHire") : t("settings.delD")}
          control={
            <Pill
              label={t("settings.delBtn")}
              kind="danger"
              icon="trash"
              onClick={() => {
                if (window.confirm(t("settings.confirmDelete"))) {
                  toast(t("settings.toastDeleteSched"));
                }
              }}
            />
          }
        />
      </>
    ),
    security: (
      <>
        <Row
          label={t("settings.signInMethod")}
          desc={user.provider === "TELEGRAM" ? "Telegram" : "Google"}
          control={
            <span className={s["set-verified"]}>
              <SIc name="verified" />
              {t("settings.active")}
            </span>
          }
        />
        <Row
          label={t("settings.password")}
          desc={t("settings.passwordD")}
          control={
            <Pill
              label={t("settings.setup")}
              icon="key"
              onClick={() => toast(t("settings.toastPwSoon"))}
            />
          }
        />
        <Row
          label={t("settings.twoStep")}
          desc={t("settings.twoStepD")}
          control={
            <Pill
              label={t("settings.setup")}
              icon="key"
              onClick={() => toast(t("settings.toast2faSoon"))}
            />
          }
        />
        <GroupLabel>{t("settings.sessions")}</GroupLabel>
        <Row
          label={t("settings.thisDevice")}
          desc={t("settings.activeNow")}
          control={
            <span className={cn(s["set-conn"], s["is-on"])}>
              <span className={s["set-conn-dot"]} />
              {t("settings.current")}
            </span>
          }
        />
        <Row
          stack
          label={t("settings.logoutAll")}
          control={
            <Pill
              label={t("settings.logoutAllBtn")}
              kind="danger"
              icon="logout"
              onClick={() => {
                if (window.confirm(t("settings.confirmLogoutAll"))) doLogout();
              }}
            />
          }
        />
      </>
    ),
  };

  return (
    <div
      className={s.screen}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className={s["set-modal"]}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings.title")}
      >
        <header className={s["set-topbar"]}>
          <div className={s["set-title"]}>{t("settings.title")}</div>
          <button
            type="button"
            className={s["set-iconbtn"]}
            onClick={close}
            aria-label={t("settings.ariaClose")}
          >
            <SIc name="x" />
          </button>
        </header>

        <div className={s["set-tabs"]} role="tablist">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              role="tab"
              aria-selected={sec.id === active}
              className={cn(s["set-tab"], sec.id === active && s.on)}
              onClick={() => setActive(sec.id)}
            >
              <SIc name={sec.icon} />
              {t(sec.label(employer))}
            </button>
          ))}
        </div>

        <div className={s["set-shell"]}>
          <nav className={s["set-nav"]}>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className={cn(s["set-navitem"], sec.id === active && s.on)}
                onClick={() => setActive(sec.id)}
              >
                <SIc name={sec.icon} />
                <span className={s["set-navitem-l"]}>
                  {t(sec.label(employer))}
                </span>
              </button>
            ))}
          </nav>

          <div className={s["set-content"]}>
            <div className={s["set-inner"]}>
              <div className={s["set-head"]}>
                <h1 className={s["set-h2"]}>
                  {t(
                    SECTIONS.find((sec) => sec.id === active)!.label(employer),
                  )}
                </h1>
              </div>
              {sections[active]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
