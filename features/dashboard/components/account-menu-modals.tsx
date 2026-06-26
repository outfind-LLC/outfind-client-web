"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useSession } from "@/features/auth/hooks/use-session";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { useUpdateProfileInfo } from "@/features/profile/hooks/use-worker-profile-mutations";
import { isApiClientError } from "@/lib/api/error";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Ic } from "@/features/dashboard/components/app-icons";
import type { SessionUser } from "@/interfaces/auth.interface";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/* Help-item icons (exact prototype glyphs), masked via the module's `.ic`. */
function mask(inner: string, sw = 1.6): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const HELP_ICONS = {
  book: mask("<path d='M5 6a2 2 0 0 1 2-2h12v15H7a2 2 0 0 0-2 2z'/><path d='M5 19a2 2 0 0 1 2-2h12'/>"),
  chat: mask("<path d='M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1 1 20 11.5z'/>"),
  mail: mask("<rect x='3' y='5' width='18' height='14' rx='2.5'/><path d='M4 7.5l8 5 8-5'/>"),
};
function HelpIc({ name }: { name: keyof typeof HELP_ICONS }) {
  return <span className={s.ic} style={{ "--i": HELP_ICONS[name] } as CSSProperties} aria-hidden="true" />;
}

/* ---------------- shared shell ---------------- */
function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
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
  }, [onClose]);

  return (
    <div
      className={s["modal-scrim"]}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={s["modal-head"]}>
          <div className={s["modal-title"]}>{title}</div>
          <button type="button" className={s["modal-close"]} aria-label={t("accountMenu.ariaClose")} onClick={onClose}>
            <Ic name="close" />
          </button>
        </div>
        <div className={s["modal-body"]}>{children}</div>
        {footer ? <div className={s["modal-foot"]}>{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- Account ---------------- */
export function AccountModal({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const { isWorker } = useSession();
  const workerProfile = useWorkerProfile(Boolean(isWorker));
  const update = useUpdateProfileInfo();

  const profileLocation = workerProfile.data
    ? [workerProfile.data.currentCity, workerProfile.data.currentCountry].filter(Boolean).join(", ")
    : "";

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState("");
  // Controlled-with-fallback: shows the profile's location until the user edits it,
  // so it stays correct even if the worker profile resolves after the modal opens
  // (no setState-in-effect).
  const [locationEdit, setLocationEdit] = useState<string | null>(null);
  const location = locationEdit ?? profileLocation;
  const [lang, setLang] = useState<Locale>(locale);

  const save = async () => {
    if (lang !== locale) setLocale(lang);
    // The only profile-backed field today is the worker's location; name/email/phone
    // need an account-update endpoint (see docs/api/profile.md §5).
    if (isWorker && location !== profileLocation) {
      const [city, ...rest] = location.split(",").map((p) => p.trim());
      try {
        await update.mutateAsync({
          currentCity: city || null,
          currentCountry: rest.join(", ") || null,
        });
      } catch (e) {
        toast.error(isApiClientError(e) ? e.message : t("accountMenu.accSaved"));
        return;
      }
    }
    toast(t("accountMenu.accSaved"));
    onClose();
  };

  return (
    <Modal
      title={t("accountMenu.account")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cn(s.btn, s["btn-ghost"], s["btn-md"])} onClick={onClose}>
            {t("accountMenu.accCancel")}
          </button>
          <button
            type="button"
            className={cn(s.btn, s["btn-primary"], s["btn-md"])}
            onClick={save}
            disabled={update.isPending}
          >
            {t("accountMenu.accSave")}
          </button>
        </>
      }
    >
      <FieldInput label={t("accountMenu.accName")} value={name} onChange={setName} />
      <FieldInput label={t("accountMenu.accEmail")} value={email} onChange={setEmail} type="email" />
      <FieldInput label={t("accountMenu.accPhone")} value={phone} onChange={setPhone} type="tel" />
      <FieldInput label={t("accountMenu.accLocation")} value={location} onChange={setLocationEdit} />
      <div className={s.field}>
        <label>{t("accountMenu.accPrefLang")}</label>
        <select value={lang} onChange={(e) => setLang(e.target.value as Locale)}>
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className={s.field}>
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ---------------- Help ---------------- */
export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const email = t("accountMenu.helpEmailValue");
  return (
    <Modal title={t("accountMenu.help")} onClose={onClose}>
      <p className={s["modal-note"]}>{t("accountMenu.helpNote")}</p>
      <div className={s["help-list"]}>
        <HelpRow icon="book" title={t("accountMenu.helpCenter")} desc={t("accountMenu.helpCenterD")} />
        <HelpRow icon="chat" title={t("accountMenu.helpContact")} desc={t("accountMenu.helpContactD")} />
        <a className={s["help-item"]} href={`mailto:${email}`}>
          <HelpIc name="mail" />
          <span>
            <span className={s.t}>{t("accountMenu.helpEmail")}</span>
            <span className={s.d}>{email}</span>
          </span>
        </a>
      </div>
    </Modal>
  );
}

function HelpRow({ icon, title, desc }: { icon: keyof typeof HELP_ICONS; title: string; desc: string }) {
  return (
    <button type="button" className={s["help-item"]}>
      <HelpIc name={icon} />
      <span>
        <span className={s.t}>{title}</span>
        <span className={s.d}>{desc}</span>
      </span>
    </button>
  );
}

/* ---------------- Logout ---------------- */
export function LogoutModal({
  onClose,
  onConfirm,
  pending,
}: {
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const { t } = useI18n();
  return (
    <Modal
      title={t("accountMenu.logout")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cn(s.btn, s["btn-ghost"], s["btn-md"])} onClick={onClose}>
            {t("accountMenu.accCancel")}
          </button>
          <button
            type="button"
            className={cn(s.btn, s["btn-primary"], s["btn-md"])}
            onClick={onConfirm}
            disabled={pending}
          >
            {t("accountMenu.logout")}
          </button>
        </>
      }
    >
      <div className={s["modal-confirm"]}>
        <p className={s["modal-confirm-t"]}>{t("accountMenu.logoutConfirm")}</p>
      </div>
    </Modal>
  );
}

/* ---------------- Upgrade plan ---------------- */
/**
 * The prototype's Upgrade modal: a Free (current) card + a featured Pro card with
 * per-audience feature bullets. Plan copy mirrors the design's static teaser; the
 * actual plans + Polar checkout live on the `/upgrade` page, where the "Upgrade to
 * Pro" CTA routes (see docs/api/profile.md / billing). Worker vs employer differ
 * only in the note + feature bullets.
 */
export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const { isWorker } = useSession();
  const employer = !isWorker;

  const freeFeats = employer
    ? [t("upgrade.freeF1Hire"), t("upgrade.freeF2Hire"), t("upgrade.freeF3Hire")]
    : [t("upgrade.freeF1"), t("upgrade.freeF2"), t("upgrade.freeF3")];
  const proFeats = employer
    ? [t("upgrade.proF1Hire"), t("upgrade.proF2Hire"), t("upgrade.proF3Hire"), t("upgrade.proF4Hire")]
    : [t("upgrade.proF1"), t("upgrade.proF2"), t("upgrade.proF3"), t("upgrade.proF4")];

  const goPro = () => {
    onClose();
    router.push(routes.upgrade);
  };

  return (
    <Modal
      title={t("upgrade.title")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cn(s.btn, s["btn-ghost"], s["btn-md"])} onClick={onClose}>
            {t("upgrade.maybeLater")}
          </button>
          <button type="button" className={cn(s.btn, s["btn-primary"], s["btn-md"])} onClick={goPro}>
            {t("upgrade.toPro")}
          </button>
        </>
      }
    >
      <p className={s["modal-note"]}>{employer ? t("upgrade.noteHire") : t("upgrade.note")}</p>

      <div className={s.plan}>
        <div className={s["plan-top"]}>
          <div className={s["plan-name"]}>
            Free
            <span className={cn(s["plan-badge"], s.muted)}>{t("upgrade.current")}</span>
          </div>
          <div className={s["plan-price"]}>
            $0<span className={s.per}>{t("upgrade.perMo")}</span>
          </div>
        </div>
        <ul className={s["plan-feats"]}>
          {freeFeats.map((feat) => (
            <li key={feat}>
              <Ic name="checkThin" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn(s.plan, s.featured)}>
        <div className={s["plan-top"]}>
          <div className={s["plan-name"]}>Pro</div>
          <div className={s["plan-price"]}>
            $9<span className={s.per}>{t("upgrade.perMo")}</span>
          </div>
        </div>
        <ul className={s["plan-feats"]}>
          {proFeats.map((feat) => (
            <li key={feat}>
              <Ic name="checkThin" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
