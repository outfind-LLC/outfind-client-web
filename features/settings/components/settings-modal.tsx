"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
import { useSoundSettings } from "@/features/settings/hooks/use-sound-settings";
import { useLocalSettings } from "@/features/settings/hooks/use-local-settings";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import s from "@/features/settings/styles/settings.module.css";

/* ---------------- Icons (exact prototype paths) ---------------- */
function sIcon(inner: string, sw = 1.5): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const SETTINGS_ICONS = {
  gear: sIcon(
    "<circle cx='12' cy='12' r='3'/><path d='M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.04z'/>",
  ),
  bell: sIcon("<path d='M18 8.5a6 6 0 1 0-12 0c0 6-2.5 8-2.5 8h17S18 14.5 18 8.5z'/><path d='M13.7 20a2 2 0 0 1-3.4 0'/>"),
  briefcase: sIcon("<rect x='2.5' y='7' width='19' height='13' rx='2.5'/><path d='M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7'/><path d='M2.5 12.5h19'/>"),
  shield: sIcon("<path d='M12 3l7 2.8V11c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V5.8z'/><path d='M9 12l2 2 4-4.2'/>"),
  user: sIcon("<circle cx='12' cy='8' r='3.6'/><path d='M5.5 19.5c.7-3.2 3.3-5 6.5-5s5.8 1.8 6.5 5'/>"),
  lock: sIcon("<rect x='4.5' y='10.5' width='15' height='10' rx='2.5'/><path d='M8 10.5V7.5a4 4 0 0 1 8 0v3'/><circle cx='12' cy='15.5' r='1.3'/>"),
  chev: sIcon("<path d='M9 5l6.5 6.3a1 1 0 0 1 0 1.4L9 19'/>", 1.8),
  chevD: sIcon("<path d='M5 9l6.3 6.5a1 1 0 0 0 1.4 0L19 9'/>", 1.8),
  check: sIcon("<path d='M5 13l4 4L19 7'/>", 2),
  x: sIcon("<path d='M6 6l12 12M18 6L6 18'/>", 1.8),
  mail: sIcon("<rect x='2.5' y='5' width='19' height='14' rx='3'/><path d='M5 8l5.5 4a2.5 2.5 0 0 0 3 0L19 8'/>"),
  phone: sIcon("<path d='M5 7c0-1 0-1.5.3-1.9.6-.8 1.7-1.1 2.6-.8.5.2.9.8 1.6 2 .3.5.5.8.5 1.2.1.4 0 .8-.2 1.5l-.5 1.3c-.1.3-.1.4 0 .7a8 8 0 0 0 4 4c.3.1.4.1.7 0l1.3-.5c.7-.2 1.1-.3 1.5-.2.4 0 .7.2 1.2.5 1.2.7 1.8 1.1 2 1.6.3.9 0 2-.8 2.6-.4.3-.9.3-1.9.3A14 14 0 0 1 5 7z'/>"),
  key: sIcon("<circle cx='8' cy='15' r='4.5'/><path d='M11.2 11.8L20 3'/><path d='M16 7l2.5 2.5M14 9l2 2'/>"),
  verified: sIcon("<path d='M12 2.2l2.3 1.7 2.85-.2.9 2.72 2.35 1.63-.85 2.73.85 2.73-2.35 1.63-.9 2.72-2.85-.2L12 21.8l-2.3-1.7-2.85.2-.9-2.72-2.35-1.63.85-2.73-.85-2.73 2.35-1.63.9-2.72 2.85.2z'/>", 1.6),
  trash: sIcon("<path d='M5 7h14'/><path d='M10 11v5M14 11v5'/><path d='M6 7l.7 11.2A2 2 0 0 0 8.7 20h6.6a2 2 0 0 0 2-1.8L18 7'/><path d='M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'/>"),
  logout: sIcon("<path d='M15 12H5m0 0l3.5-3.5M5 12l3.5 3.5'/><path d='M12 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4'/>"),
  sun: sIcon("<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'/>"),
  moon: sIcon("<path d='M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'/>"),
  desktop: sIcon("<rect x='3' y='4' width='18' height='12' rx='2'/><path d='M8 20h8M12 16v4'/>"),
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

/* ---------------- Language (shared peoplor_lang store) ---------------- */
const LANGS = [
  { v: "en", l: "English" },
  { v: "ru", l: "Русский" },
  { v: "uz", l: "Oʻzbekcha" },
] as const;
const LANG_KEY = "peoplor_lang";
const LANG_EVENT = "peoplor:lang";
function subscribeLang(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(LANG_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LANG_EVENT, cb);
  };
}
function readLang(): string {
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    if (LANGS.some((l) => l.v === v)) return v as string;
  } catch {
    /* ignore */
  }
  return "en";
}
function serverLang(): string {
  return "en";
}
function setStoredLang(v: string) {
  try {
    window.localStorage.setItem(LANG_KEY, v);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(LANG_EVENT));
  document.documentElement.lang = v;
}

/* ---------------- Option sets ---------------- */
interface Opt {
  v: string;
  l: string;
  dot?: string;
  icon?: SettingsIcon;
}
const THEME_OPTS: Opt[] = [
  { v: "light", l: "Light", icon: "sun" },
  { v: "dark", l: "Dark", icon: "moon" },
  { v: "system", l: "System", icon: "desktop" },
];
const FREQ_OPTS: Opt[] = [
  { v: "instant", l: "Instantly" },
  { v: "daily", l: "Daily digest" },
  { v: "weekly", l: "Weekly digest" },
  { v: "off", l: "Off" },
];
const SEARCH_OPTS: Opt[] = [
  { v: "active", l: "Actively looking", dot: "var(--accent-brand)" },
  { v: "open", l: "Open to offers", dot: "var(--warning)" },
  { v: "closed", l: "Not looking", dot: "var(--gray-400)" },
];
const HIRE_OPTS: Opt[] = [
  { v: "active", l: "Actively hiring", dot: "var(--accent-brand)" },
  { v: "open", l: "Open to applications", dot: "var(--warning)" },
  { v: "paused", l: "Hiring paused", dot: "var(--gray-400)" },
];
const EMP_OPTS: Opt[] = [
  { v: "full", l: "Full-time" },
  { v: "part", l: "Part-time" },
  { v: "shift", l: "Shift work" },
  { v: "any", l: "Any" },
];
function visOpts(employer: boolean): Opt[] {
  return [
    { v: "all", l: employer ? "Visible to all candidates" : "Visible to all employers" },
    { v: "applied", l: employer ? "Only people who apply" : "Only companies I apply to" },
    { v: "hidden", l: "Hidden" },
  ];
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
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
          style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, left: "auto" }}
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
                <span className={s["set-pop-dot"]} style={{ background: o.dot }} />
              ) : o.icon ? (
                <span className={s["set-pop-dot"]} style={{ background: "transparent" }}>
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
      className={cn(s["set-pill"], kind === "danger" ? s["set-pill-danger"] : s["set-pill-ghost"])}
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

const SECTIONS: { id: SectionId; label: (e: boolean) => string; icon: SettingsIcon }[] = [
  { id: "general", label: () => "General", icon: "gear" },
  { id: "notif", label: () => "Notifications", icon: "bell" },
  { id: "jobs", label: (e) => (e ? "Hiring" : "Job search"), icon: "briefcase" },
  { id: "privacy", label: () => "Privacy", icon: "shield" },
  { id: "account", label: () => "Account", icon: "user" },
  { id: "security", label: () => "Security & login", icon: "lock" },
];
type SectionId = "general" | "notif" | "jobs" | "privacy" | "account" | "security";

/**
 * Settings — the prototype's modal-on-desktop / tabs-on-mobile surface, rendered
 * as a route overlay. Theme (next-themes), language, account type, logout, and
 * sounds are wired to live app state; the remaining preferences persist locally
 * until the settings API ships (see api-need.md).
 */
export function SettingsModal() {
  const router = useRouter();
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const switchAccount = useSwitchAccount();
  const logout = useLogout();
  const { settings: sound, update: updateSound } = useSoundSettings();
  const { settings: local, update } = useLocalSettings();
  const lang = useSyncExternalStore(subscribeLang, readLang, serverLang);
  const [active, setActive] = useState<SectionId>("general");

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

  const editValue = (title: string, current: string, key: "expectedSalary" | "preferredCity") => {
    const next = window.prompt(title, current);
    if (next && next.trim()) update({ [key]: next.trim() });
  };

  const switchTo = (target: "seeker" | "employer") => {
    const next = target === "employer" ? ACCOUNT_TYPE.EMPLOYER : ACCOUNT_TYPE.WORKER;
    if (next === user.accountType) return;
    switchAccount.mutate(next, {
      onSuccess: () => toast.success("Account type updated"),
      onError: (error) =>
        toast.error(isApiClientError(error) ? error.message : "Couldn't switch account"),
    });
  };

  const doLogout = () => {
    if (!window.confirm("Log out on this device?")) return;
    logout.mutate(undefined, {
      onError: (error) =>
        toast.error(isApiClientError(error) ? error.message : "Couldn't log out"),
    });
  };

  const sections: Record<SectionId, ReactNode> = {
    general: (
      <>
        {!user.email && !local.bannerDismissed ? (
          <div className={s["set-banner"]}>
            <div className={s["set-banner-ic"]}>
              <SIc name="shield" />
            </div>
            <div className={s["set-banner-main"]}>
              <div className={s["set-banner-t"]}>Secure your account</div>
              <div className={s["set-banner-d"]}>
                Add an email so you can recover access and get hiring updates even
                if you lose your phone number.
              </div>
              <button
                type="button"
                className={s["set-banner-btn"]}
                onClick={() => toast("Adding an email is coming soon")}
              >
                Add email
              </button>
            </div>
            <button
              type="button"
              className={s["set-banner-x"]}
              aria-label="Dismiss"
              onClick={() => update({ bannerDismissed: true })}
            >
              <SIc name="x" />
            </button>
          </div>
        ) : null}

        <GroupLabel>Account type</GroupLabel>
        <div className={s["set-acct"]}>
          <button
            type="button"
            className={s["set-acct-opt"]}
            aria-pressed={!employer}
            onClick={() => switchTo("seeker")}
          >
            <span className={s.t}>Find a job</span>
            <span className={s.d}>Search roles and apply</span>
          </button>
          <button
            type="button"
            className={s["set-acct-opt"]}
            aria-pressed={employer}
            onClick={() => switchTo("employer")}
          >
            <span className={s.t}>Hire talent</span>
            <span className={s.d}>Post jobs and find candidates</span>
          </button>
        </div>

        <Row
          label="Language"
          desc="Changes the language across Peoplor"
          control={
            <SettingsSelect value={lang} options={LANGS as unknown as Opt[]} onChange={setStoredLang} />
          }
        />
        <Row
          label="Appearance"
          desc="Choose how Peoplor looks on this device"
          control={
            <SettingsSelect
              value={theme ?? "system"}
              options={THEME_OPTS}
              onChange={setTheme}
            />
          }
        />
        <Row
          label="Send with Enter"
          desc="Press Enter to send a message; Shift+Enter for a new line"
          control={
            <Toggle
              checked={local.enterToSend}
              onChange={() => update({ enterToSend: !local.enterToSend })}
            />
          }
        />
      </>
    ),
    notif: (
      <>
        <GroupLabel>Push notifications</GroupLabel>
        <Row
          label={employer ? "Messages from candidates" : "Messages from employers"}
          control={
            <Toggle
              checked={local.notif_messages}
              onChange={() => update({ notif_messages: !local.notif_messages })}
            />
          }
        />
        <Row
          label={employer ? "Candidate activity" : "Application status updates"}
          desc={
            employer
              ? "When a candidate applies, replies or accepts"
              : "When an employer views, replies or makes a decision"
          }
          control={
            <Toggle
              checked={local.notif_status}
              onChange={() => update({ notif_status: !local.notif_status })}
            />
          }
        />
        <Row
          label={employer ? "New matching candidates" : "New matching jobs"}
          desc={
            employer
              ? "Candidates that fit your open roles"
              : "Jobs that fit your search and resume"
          }
          control={
            <Toggle
              checked={local.notif_jobs}
              onChange={() => update({ notif_jobs: !local.notif_jobs })}
            />
          }
        />
        <Row
          label="Sounds"
          control={
            <Toggle
              checked={sound.enabled}
              onChange={() => updateSound({ enabled: !sound.enabled })}
            />
          }
        />
        <GroupLabel>Email</GroupLabel>
        <Row
          label={employer ? "Email me candidate alerts" : "Email me job alerts"}
          control={
            <Toggle
              checked={local.notif_email}
              onChange={() => {
                const next = !local.notif_email;
                update({ notif_email: next });
                if (next) toast("Job alerts on — sent to your email");
              }}
            />
          }
        />
        <Row
          label="Alert frequency"
          control={
            <SettingsSelect
              value={local.jobAlertFreq}
              options={FREQ_OPTS}
              onChange={(v) => update({ jobAlertFreq: v as never })}
            />
          }
        />
      </>
    ),
    jobs: employer ? (
      <>
        <Row
          label="Hiring status"
          desc="Shows on your company profile"
          control={
            <SettingsSelect
              value={local.hireStatus}
              options={HIRE_OPTS}
              withDot
              onChange={(v) => update({ hireStatus: v as never })}
            />
          }
        />
        <Row
          label="Roles you hire for"
          control={
            <SettingsSelect
              value={local.employmentType}
              options={EMP_OPTS}
              onChange={(v) => update({ employmentType: v as never })}
            />
          }
        />
        <Row
          label="Default job location"
          control={<GoRow value={local.preferredCity} onClick={() => editValue("Default job location", local.preferredCity, "preferredCity")} />}
        />
        <Row
          label="Hiring for remote roles"
          control={<Toggle checked={local.openRemote} onChange={() => update({ openRemote: !local.openRemote })} />}
        />
        <Row
          label="AI screening"
          desc="Let Peoplor screen applicants before they reach you"
          control={<Toggle checked={local.aiScreen} onChange={() => update({ aiScreen: !local.aiScreen })} />}
        />
        <Row
          label="Auto-invite top matches"
          desc="Automatically message candidates above 90% match"
          control={<Toggle checked={local.autoInvite} onChange={() => update({ autoInvite: !local.autoInvite })} />}
        />
      </>
    ) : (
      <>
        <Row
          label="Job search status"
          desc="Lets employers know whether to reach out"
          control={
            <SettingsSelect
              value={local.searchStatus}
              options={SEARCH_OPTS}
              withDot
              onChange={(v) => update({ searchStatus: v as never })}
            />
          }
        />
        <Row
          label="Preferred employment"
          control={
            <SettingsSelect
              value={local.employmentType}
              options={EMP_OPTS}
              onChange={(v) => update({ employmentType: v as never })}
            />
          }
        />
        <Row
          label="Expected salary"
          control={<GoRow value={local.expectedSalary} onClick={() => editValue("Expected salary", local.expectedSalary, "expectedSalary")} />}
        />
        <Row
          label="Preferred location"
          control={<GoRow value={local.preferredCity} onClick={() => editValue("Preferred location", local.preferredCity, "preferredCity")} />}
        />
        <Row
          label="Open to remote work"
          control={<Toggle checked={local.openRemote} onChange={() => update({ openRemote: !local.openRemote })} />}
        />
        <Row
          label="Ready to relocate"
          control={<Toggle checked={local.readyRelocate} onChange={() => update({ readyRelocate: !local.readyRelocate })} />}
        />
      </>
    ),
    privacy: (
      <>
        <Row
          label={employer ? "Company profile visibility" : "Resume visibility"}
          desc={employer ? "Who can find and view your company" : "Who can find and view your resume"}
          control={
            <SettingsSelect
              value={local.resumeVisibility}
              options={visOpts(employer)}
              onChange={(v) => update({ resumeVisibility: v as never })}
            />
          }
        />
        <Row
          label={employer ? "Hidden from" : "Hidden companies"}
          desc={employer ? "Hide your posts from specific people" : "Hide your resume from specific employers"}
          control={<GoRow value="None" onClick={() => toast("Nothing hidden yet")} />}
        />
        <Row
          label="Show when I'm online"
          control={<Toggle checked={local.showOnline} onChange={() => update({ showOnline: !local.showOnline })} />}
        />
        <Row
          label="Send read receipts"
          desc={employer ? "Candidates see when you've read their message" : "Employers see when you've read their message"}
          control={<Toggle checked={local.readReceipts} onChange={() => update({ readReceipts: !local.readReceipts })} />}
        />
        <Row
          label={employer ? "Allow candidates to call us" : "Allow employers to call me"}
          control={<Toggle checked={local.allowCalls} onChange={() => update({ allowCalls: !local.allowCalls })} />}
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
              <div className={s["set-id-sub"]}>{employer ? "Employer" : "Job seeker"}</div>
            </div>
          </div>
          <div className={s["set-row-ctl"]}>
            <Pill label="Edit" onClick={() => toast("Edit your details in Profile")} />
          </div>
        </div>

        <GroupLabel>Contact</GroupLabel>
        <Row
          label="Email"
          desc={user.email ?? "Not added yet"}
          control={
            <Pill
              label={user.email ? "Change" : "Add"}
              onClick={() => toast("Adding an email is coming soon")}
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
                Connected
              </span>
            }
          />
        ) : null}

        <GroupLabel>Connected accounts</GroupLabel>
        <Row
          label="Google"
          desc={user.provider === "GOOGLE" ? "Connected" : "Sign in faster"}
          control={
            user.provider === "GOOGLE" ? (
              <span className={cn(s["set-conn"], s["is-on"])}>
                <span className={s["set-conn-dot"]} />
                Connected
              </span>
            ) : (
              <Pill label="Connect" onClick={() => toast("Connecting Google…")} />
            )
          }
        />

        <GroupLabel>Danger zone</GroupLabel>
        <Row
          label="Log out"
          desc="Sign out on this device"
          control={<Pill label="Log out" icon="logout" onClick={doLogout} />}
        />
        <Row
          stack
          label={employer ? "Delete company account" : "Delete account"}
          desc={
            employer
              ? "Permanently remove your company, job posts and chats"
              : "Permanently remove your profile, resumes and chats"
          }
          control={
            <Pill
              label="Delete"
              kind="danger"
              icon="trash"
              onClick={() => {
                if (window.confirm("Delete your account? This permanently removes your profile, resumes and chats.")) {
                  toast("Account scheduled for deletion");
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
          label="Sign-in method"
          desc={user.provider === "TELEGRAM" ? "Telegram" : "Google"}
          control={
            <span className={s["set-verified"]}>
              <SIc name="verified" />
              Active
            </span>
          }
        />
        <Row
          label="Password"
          desc="Add a password to sign in without an SMS code"
          control={<Pill label="Set up" icon="key" onClick={() => toast("Set up a password — coming soon")} />}
        />
        <Row
          label="Two-step verification"
          desc="Require a second step when signing in on a new device"
          control={<Toggle checked={local.twoStep} onChange={() => update({ twoStep: !local.twoStep })} />}
        />
        <GroupLabel>Sessions</GroupLabel>
        <Row
          label="This device"
          desc="Active now"
          control={
            <span className={cn(s["set-conn"], s["is-on"])}>
              <span className={s["set-conn-dot"]} />
              Current
            </span>
          }
        />
        <Row
          stack
          label="Log out of all devices"
          control={
            <Pill
              label="Log out everywhere"
              kind="danger"
              icon="logout"
              onClick={() => {
                if (window.confirm("Log out of all devices?")) doLogout();
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
      <div className={s["set-modal"]} role="dialog" aria-modal="true" aria-label="Settings">
        <header className={s["set-topbar"]}>
          <div className={s["set-title"]}>Settings</div>
          <button
            type="button"
            className={s["set-iconbtn"]}
            onClick={close}
            aria-label="Close settings"
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
              {sec.label(employer)}
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
                <span className={s["set-navitem-l"]}>{sec.label(employer)}</span>
              </button>
            ))}
          </nav>

          <div className={s["set-content"]}>
            <div className={s["set-inner"]}>
              <div className={s["set-head"]}>
                <h1 className={s["set-h2"]}>
                  {SECTIONS.find((sec) => sec.id === active)?.label(employer)}
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
