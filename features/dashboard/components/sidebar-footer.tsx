"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import { isApiClientError } from "@/lib/api/error";
import { LOCALE_LABELS, LOCALES } from "@/lib/i18n/config";
import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/interfaces/auth.interface";
import { PLAN_TYPE } from "@/interfaces/enums";
import { Ic, LangCaret, LangGlobe, LangTick } from "./app-icons";
import {
  AccountModal,
  HelpModal,
  LogoutModal,
  UpgradeModal,
} from "@/features/dashboard/components/account-menu-modals";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

// Hide the "Upgrade" affordances only for plans already at the top tier (nothing
// to upgrade to); everyone else — free and mid-tier — sees them, like the prototype.
const TOP_TIER_PLANS: string[] = [
  PLAN_TYPE.PREMIUM,
  PLAN_TYPE.EMPLOYER_ENTERPRISE,
];

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
  const { locale, setLocale, t } = useI18n();

  const planLabel = plan?.name ?? t("common.freePlan");
  const canUpgrade = !plan || !TOP_TIER_PLANS.includes(plan.planType);

  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<
    null | "account" | "help" | "logout" | "upgrade"
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
          isApiClientError(error) ? error.message : t("accountMenu.logoutError"),
        ),
    });
  };

  const closeMenuThen = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };
  const openModal = (name: "account" | "help" | "logout" | "upgrade") => {
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
                setLocale(code);
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
      <div className={s["profile-menu"]} data-open={menuOpen ? "true" : "false"}>
        <Link
          href={routes.profile}
          className={s["pm-head"]}
          onClick={closeMenuThen}
        >
          <Avatar user={user} />
          <div className={s["pm-meta"]}>
            <div className={s["pm-name"]}>{user.name}</div>
            <div className={s["pm-mail"]}>{user.email ?? planLabel}</div>
          </div>
        </Link>
        <div className={s["pm-sep"]} />
        {canUpgrade ? (
          <button
            type="button"
            className={cn(s["pm-item"], s["pm-upgrade"])}
            onClick={() => openModal("upgrade")}
          >
            <Ic name="zap" />
            <span>{t("accountMenu.upgradePlan")}</span>
          </button>
        ) : null}
        <button
          type="button"
          className={s["pm-item"]}
          onClick={() => openModal("account")}
        >
          <Ic name="user" />
          <span>{t("accountMenu.account")}</span>
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
        <Avatar user={user} />
        <span className={s.pmeta}>
          <span className={s.pname}>{user.name}</span>
          <span className={s.pmail}>{planLabel}</span>
        </span>
        {canUpgrade ? (
          <span className={s["upgrade-badge"]}>{t("common.upgrade")}</span>
        ) : null}
      </button>

      {modal === "upgrade" ? (
        <UpgradeModal onClose={() => setModal(null)} />
      ) : null}
      {modal === "account" ? (
        <AccountModal user={user} onClose={() => setModal(null)} />
      ) : null}
      {modal === "help" ? <HelpModal onClose={() => setModal(null)} /> : null}
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

function Avatar({ user }: { user: SessionUser }) {
  return (
    <span className={s.avatar} aria-hidden="true">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" />
      ) : (
        initial(user.name)
      )}
    </span>
  );
}
