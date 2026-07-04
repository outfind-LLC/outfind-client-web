"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { useSetAppLanguage } from "@/features/settings/hooks/use-user-settings";
import { isApiClientError } from "@/lib/api/error";
import { LOCALE_LABELS, LOCALES } from "@/lib/i18n/config";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/interfaces/auth.interface";
import { Ic, LangCaret, LangGlobe, LangTick } from "./app-icons";
import {
  FeedbackModal,
  HelpModal,
  LogoutModal,
  UpgradeModal,
} from "@/features/dashboard/components/account-menu-modals";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "U";
}

/**
 * Sidebar footer: the language picker (opens upward) and the account control —
 * a profile row that opens a popover menu (Upgrade / Account / Settings / Help /
 * Logout), mirroring the prototype. Language + labels run through the shared i18n
 * layer, so switching here updates the whole app (and the marketing surface).
 */
export function SidebarFooter({ user }: { user: SessionUser }) {
  const { plan } = useMyPlan();
  const logout = useLogout();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const { locale, t } = useI18n();
  const setAppLanguage = useSetAppLanguage();

  const planLabel = plan?.name ?? t("common.freePlan");
  const isEmployer = user.accountType === ACCOUNT_TYPE.EMPLOYER;
  // Employers see their COMPANY identity in the footer (name + logo); workers see
  // their own. The company profile is a cached query, enabled only for employers.
  const employerProfile = useEmployerProfile(isEmployer);
  const company = employerProfile.data;
  const displayName = isEmployer
    ? (company?.companyName ?? user.name)
    : user.name;
  const displayAvatar = isEmployer
    ? (company?.companyLogoUrl ?? null)
    : (user.avatarUrl ?? null);
  // The avatar/name header opens the account's own profile surface in its DETAIL
  // view: the company "About" page for employers, the résumé editor for workers
  // (matches the prototype's `__profileShowCompany`, which lands on view=detail).
  const profileHref = isEmployer
    ? `${routes.company}?view=detail`
    : `${routes.profile}?view=detail`;

  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<
    null | "help" | "logout" | "upgrade" | "feedback"
  >(null);
  const footRef = useRef<HTMLDivElement>(null);

  // Close both popovers on outside click / Escape.
  useEffect(() => {
    if (!langOpen && !menuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!footRef.current?.contains(event.target as Node)) {
        setLangOpen(false);
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLangOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [langOpen, menuOpen]);

  const onLogout = () => {
    logout.mutate(undefined, {
      onError: (error) =>
        toast.error(
          isApiClientError(error)
            ? error.message
            : t("accountMenu.logoutError"),
        ),
    });
  };

  const closeMenuThen = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };
  const openModal = (name: "help" | "logout" | "upgrade" | "feedback") => {
    setMenuOpen(false);
    setModal(name);
  };

  return (
    <div className={s["sb-foot"]} ref={footRef}>
      {/* Language picker */}
      <div className={s.langdd} data-open={langOpen ? "true" : "false"}>
        <button
          type="button"
          className={s["langdd-btn"]}
          aria-haspopup="true"
          aria-expanded={langOpen}
          aria-label={t("common.language")}
          onClick={() => {
            setLangOpen((v) => !v);
            setMenuOpen(false);
          }}
        >
          <LangGlobe className={s.globe} />
          <span className={s["lang-cur"]}>{LOCALE_LABELS[locale]}</span>
          <LangCaret className={s.caret} />
        </button>
        <div className={s["langdd-menu"]}>
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              className={s["lang-opt"]}
              aria-pressed={code === locale}
              onClick={() => {
                setAppLanguage(code);
                setLangOpen(false);
              }}
            >
              {LOCALE_LABELS[code]}
              <LangTick className={s.tick} />
            </button>
          ))}
        </div>
      </div>

      {/* Account menu (opens above the profile row) */}
      <div
        className={s["profile-menu"]}
        data-open={menuOpen ? "true" : "false"}
      >
        <Link
          href={profileHref}
          className={s["pm-head"]}
          onClick={closeMenuThen}
        >
          <Avatar name={displayName} avatarUrl={displayAvatar} />
          <div className={s["pm-meta"]}>
            <div className={s["pm-name"]}>{displayName}</div>
            <div className={s["pm-mail"]}>{planLabel}</div>
          </div>
        </Link>
        <div className={s["pm-sep"]} />
        <button
          type="button"
          className={cn(s["pm-item"], s["pm-upgrade"])}
          onClick={() => openModal("upgrade")}
        >
          <Ic name="zap" />
          <span>{t("accountMenu.upgradePlan")}</span>
        </button>
        <Link
          href={routes.settings}
          className={s["pm-item"]}
          onClick={closeMenuThen}
        >
          <Ic name="settings" />
          <span>{t("accountMenu.settings")}</span>
        </Link>
        <button
          type="button"
          className={s["pm-item"]}
          onClick={() => openModal("help")}
        >
          <Ic name="help" />
          <span>{t("accountMenu.help")}</span>
        </button>
        <button
          type="button"
          className={s["pm-item"]}
          onClick={() => openModal("feedback")}
        >
          <Ic name="star" />
          <span>{t("accountMenu.feedback")}</span>
        </button>
        <div className={s["pm-sep"]} />
        <button
          type="button"
          className={cn(s["pm-item"], s["pm-danger"])}
          onClick={() => openModal("logout")}
        >
          <Ic name="logout" />
          <span>{t("accountMenu.logout")}</span>
        </button>
      </div>

      {/* Profile row */}
      <button
        type="button"
        className={s["sb-profile"]}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((v) => !v);
          setLangOpen(false);
        }}
      >
        <Avatar name={displayName} avatarUrl={displayAvatar} />
        <span className={s.pmeta}>
          <span className={s.pname}>{displayName}</span>
          <span className={s.pmail}>{planLabel}</span>
        </span>
        <span className={s["upgrade-badge"]}>{t("common.upgrade")}</span>
      </button>

      {modal === "upgrade" ? (
        <UpgradeModal onClose={() => setModal(null)} />
      ) : null}
      {modal === "help" ? <HelpModal onClose={() => setModal(null)} /> : null}
      {modal === "feedback" ? (
        <FeedbackModal onClose={() => setModal(null)} />
      ) : null}
      {modal === "logout" ? (
        <LogoutModal
          onClose={() => setModal(null)}
          onConfirm={onLogout}
          pending={logout.isPending}
        />
      ) : null}
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  return (
    <span className={s.avatar} aria-hidden="true">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" />
      ) : (
        initial(name)
      )}
    </span>
  );
}
