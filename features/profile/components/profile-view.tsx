"use client";

import type { ReactNode } from "react";
import { UserRound } from "lucide-react";

import { Container } from "@/components/container";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { useWorkerProfile } from "@/features/profile/hooks/use-profile";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { Ic } from "@/features/profile/components/profile-icons";
import { WorkerProfileScreen } from "./worker-profile-screen";
import { WorkerProfileSetup } from "./worker-profile-setup";
import s from "@/features/profile/styles/profile.module.css";

/**
 * Profile (`/profile`) — **worker only**. The route lives in the `(worker)` group,
 * whose layout redirects employers to their own surfaces, so this never renders
 * for an employer (the company profile is at `/company`).
 *
 * The loaded profile is the full-bleed {@link WorkerProfileScreen}; setup / errors
 * keep the standard padded shell. While session/profile are loading we render a
 * full-bleed skeleton that shares the real screen's shell — so a refresh doesn't
 * flash the padded page header before swapping to the full-bleed layout.
 */
export function ProfileView() {
  const { user, isWorker } = useSession();
  const workerQuery = useWorkerProfile(Boolean(isWorker));

  // Loaded worker profile → the real full-bleed screen.
  if (user && isWorker && workerQuery.data) {
    return <WorkerProfileScreen profile={workerQuery.data} user={user} />;
  }

  // Worker with no profile yet (404) → guided setup; other errors → message.
  if (user && isWorker && workerQuery.isError) {
    const notFound =
      isApiClientError(workerQuery.error) && workerQuery.error.status === 404;
    return (
      <Shell>{notFound ? <WorkerProfileSetup /> : <ProfileError />}</Shell>
    );
  }

  // Non-workers (e.g. admins) have no résumé profile here.
  if (user && !isWorker) {
    return (
      <Shell>
        <ProfileError />
      </Shell>
    );
  }

  // Loading (session and/or profile) → full-bleed skeleton matching the screen.
  return <WorkerProfileLoading />;
}

/** The standard padded profile shell (used for setup / error states). */
function Shell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <Container className="py-8">
      <PageHeader
        icon={UserRound}
        title={t("nav.profile")}
        description={t("profile.headerSub")}
      />
      {children}
    </Container>
  );
}

/**
 * Full-bleed loading skeleton. Reuses the exact shell of {@link WorkerProfileScreen}
 * (topbar + page) so the header is stable across the loading→loaded transition.
 */
function WorkerProfileLoading() {
  const { t } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={cn(s["pf-navleft"], s["is-menu"])}
          aria-label={t("profile.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s["pf-topbar-t"]}>{t("nav.profile")}</div>
      </header>
      <div className={s.page} aria-busy="true" aria-live="polite">
        <div
          className={cn(s["rz-card"], s["rz-acct-card"], "animate-pulse")}
          style={{ height: 72 }}
        />
        <div className={s["rz-head"]}>
          <h2>{t("profile.myResumes")}</h2>
        </div>
        <div
          className={cn(s["rz-card"], "animate-pulse")}
          style={{ height: 176 }}
        />
      </div>
    </div>
  );
}

function ProfileError() {
  const { t } = useI18n();
  return (
    <p className="text-muted-foreground text-sm">{t("profile.loadError")}</p>
  );
}
