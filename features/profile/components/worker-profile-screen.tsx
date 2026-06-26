"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { SessionUser } from "@/interfaces/auth.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import { deriveResume } from "@/features/profile/lib/profile-data";
import { Ic, type IconName } from "@/features/profile/components/profile-icons";
import { WorkerProfileDetail } from "@/features/profile/components/worker-profile-detail";
import { EmployerPreview } from "@/features/profile/components/employer-preview";
import { ProfileEditModal } from "@/features/profile/components/profile-edit-modals";
import type { EditTarget } from "@/features/profile/types/edit-target";
import s from "@/features/profile/styles/profile.module.css";

interface MenuState {
  id: string;
  top: number;
  left: number;
}

/**
 * Worker profile screen — the prototype's profile dashboard. Owns the view state
 * (Overview ↔ Detail) + the full-screen employer preview. Pixel-perfect port of
 * `profile.scoped.css`. Data is live (the worker profile); the résumé in the
 * overview is derived (the mock seam) until `/worker/profile/resumes` ships. Edit
 * affordances are present and call a toast — the edit modals are the next phase.
 */
export function WorkerProfileScreen({ profile, user }: { profile: WorkerProfile; user: SessionUser }) {
  const { t, locale } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);

  const resume = useMemo(() => deriveResume(profile, t, locale), [profile, t, locale]);
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [hidden, setHidden] = useState(false);
  const [preview, setPreview] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const avatarUrl = profile.photoUrl ?? user.avatarUrl;
  const sub = user.email ?? (user.telegramUsername ? `@${user.telegramUsername}` : "");
  const editSoon = () => toast(t("profile.toastEdit"));
  const handleEdit = (target: EditTarget) => {
    if (target.type === "soon") toast(t("profile.toastEdit"));
    else setEditTarget(target);
  };

  const openMenu = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    const r = event.currentTarget.getBoundingClientRect();
    setMenu({ id, top: r.bottom + 6, left: Math.max(12, r.right - 220) });
  };
  const act = (key: MessageKey) => {
    setMenu(null);
    toast(t(key));
  };
  const toggleVisibility = () => {
    setMenu(null);
    setHidden((h) => !h);
    toast(t(hidden ? "profile.toastVisible" : "profile.toastHidden"));
  };
  const visible = resume ? resume.isVisibleInSearch && !hidden : true;

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        {view === "detail" ? (
          <button
            type="button"
            className={cn(s["pf-navleft"], s["is-back"])}
            aria-label={t("profile.ariaBack")}
            onClick={() => setView("overview")}
          >
            <Ic name="back" />
          </button>
        ) : (
          <button
            type="button"
            className={cn(s["pf-navleft"], s["is-menu"])}
            aria-label={t("profile.ariaOpenMenu")}
            onClick={() => setMobileOpen(true)}
          >
            <Ic name="menu" />
          </button>
        )}
      </header>

      {view === "detail" ? (
        <WorkerProfileDetail profile={profile} user={user} onEdit={handleEdit} />
      ) : (
        <div className={s.page}>
          {/* Account card → detail view */}
          <div className={cn(s["rz-card"], s["rz-acct-card"])}>
            <button
              type="button"
              className={s["rz-acct"]}
              aria-label={t("profile.accountSettings")}
              onClick={() => setView("detail")}
            >
              <span className={s["rz-avatar"]}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" />
                ) : (
                  <Ic name="user" />
                )}
              </span>
              <span className={s["rz-acct-main"]}>
                <span className={s["rz-acct-name"]}>{user.name}</span>
                {sub ? <span className={s["rz-acct-sub"]}>{sub}</span> : null}
              </span>
              <span className={s["rz-chev"]}>
                <Ic name="chev" />
              </span>
            </button>
          </div>

          <div className={s["rz-head"]}>
            <h2>{t("profile.myResumes")}</h2>
          </div>

          {resume ? (
            <div className={s["rz-card"]}>
              <div className={s["rz-resume-top"]}>
                <h3 className={s["rz-resume-title"]}>{resume.title}</h3>
                <button
                  type="button"
                  className={s["rz-menu"]}
                  aria-label={t("profile.resumeOptions")}
                  aria-haspopup="menu"
                  aria-expanded={menu?.id === resume.id}
                  onClick={(e) => openMenu(e, resume.id)}
                >
                  <Ic name="dots" />
                </button>
              </div>
              <div className={s["rz-resume-date"]}>
                {t("profile.updatedAgo", { when: formatRelativeTime(resume.updatedAt) })}
              </div>
              <div className={s["rz-facts"]}>
                <Fact k={t("profile.factSpec")} v={resume.specialization} t={t} />
                <Fact k={t("profile.factSalary")} v={resume.salary} t={t} />
                <Fact k={t("profile.factEmployment")} v={resume.employment} t={t} />
                <Fact k={t("profile.factLocation")} v={resume.location} t={t} />
                <Fact k={t("profile.factExperience")} v={resume.experience} t={t} />
              </div>
            </div>
          ) : (
            <div className={s["rz-card"]}>
              <div className={s["rz-empty"]}>
                <span className={s["rz-empty-ic"]}>
                  <Ic name="file" />
                </span>
                <div className={s["rz-empty-t"]}>{t("profile.emptyTitle")}</div>
                <div className={s["rz-empty-d"]}>{t("profile.emptyDesc")}</div>
                <button type="button" className={cn(s["rz-btn"], s["rz-btn-primary"])} onClick={editSoon}>
                  <Ic name="plus" />
                  {t("profile.createResume")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {menu && resume ? (
        <>
          <div className={s["rz-scrim"]} onClick={() => setMenu(null)} aria-hidden="true" />
          <div className={s["rz-popmenu"]} role="menu" style={{ top: menu.top, left: menu.left }}>
            <PopItem
              icon="eye"
              label={t("profile.popPreview")}
              onClick={() => {
                setMenu(null);
                setPreview(true);
              }}
            />
            <PopItem icon="pen" label={t("profile.popEdit")} onClick={() => act("profile.toastEdit")} />
            <PopItem icon="copy" label={t("profile.popDuplicate")} onClick={() => act("profile.toastDuplicate")} />
            <PopItem icon="download" label={t("profile.popDownload")} onClick={() => act("profile.toastDownload")} />
            <PopItem icon="share" label={t("profile.popShare")} onClick={() => act("profile.toastShare")} />
            <PopItem
              icon={visible ? "eyeOff" : "eye"}
              label={visible ? t("profile.popHide") : t("profile.popShow")}
              onClick={toggleVisibility}
            />
            <div className={s["rz-popsep"]} />
            <PopItem icon="trash" label={t("profile.popDelete")} danger onClick={() => act("profile.toastDelete")} />
          </div>
        </>
      ) : null}

      {preview && resume ? (
        <EmployerPreview profile={profile} user={user} resume={resume} onClose={() => setPreview(false)} />
      ) : null}

      {editTarget && editTarget.type !== "soon" ? (
        <ProfileEditModal target={editTarget} profile={profile} onClose={() => setEditTarget(null)} />
      ) : null}
    </div>
  );
}

function Fact({ k, v, t }: { k: string; v: string | null; t: TranslateFn }) {
  return (
    <div className={s["rz-fact"]}>
      <span className={s.k}>{k}</span>
      <span className={s.v}>{v ?? t("profile.notSpecified")}</span>
    </div>
  );
}

function PopItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" role="menuitem" className={cn(s["rz-popitem"], danger && s.danger)} onClick={onClick}>
      <Ic name={icon} />
      {label}
    </button>
  );
}
