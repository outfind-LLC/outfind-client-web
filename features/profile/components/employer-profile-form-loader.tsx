"use client";

import { Container } from "@/components/container";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { useEmployerProfile } from "@/features/profile/hooks/use-profile";
import { cn } from "@/lib/utils";
import { Ic } from "@/features/profile/components/profile-icons";
import { EmployerCompanyScreen } from "@/features/profile/components/employer-company-screen";
import { EmployerProfileForm } from "@/features/profile/components/employer-profile-form";
import s from "@/features/profile/styles/profile.module.css";

/**
 * Company route (`/company`): the pixel-perfect company screen (overview → detail
 * with per-section edits + Post-a-job) when a profile exists; the create form when
 * it doesn't. The full-bleed screen owns its own topbar + scroll, so it renders
 * outside the padded `Container`.
 *
 * While session/profile load we render a full-bleed skeleton that shares the real
 * screen's shell — so a refresh doesn't flash a padded skeleton before swapping to
 * the full-bleed layout.
 */
export function EmployerProfileFormLoader() {
  const { user, isEmployer } = useSession();
  const profileSet = Boolean(user?.isEmployerProfileSet);
  const { data, isError } = useEmployerProfile(profileSet);

  // Loaded company profile → full-bleed screen.
  if (user && isEmployer && profileSet && data) {
    return <EmployerCompanyScreen profile={data} />;
  }

  // Non-employers can't manage a company profile.
  if (user && !isEmployer) {
    return (
      <Container className="max-w-3xl py-8">
        <p className="text-muted-foreground text-sm">
          Only employer accounts can manage a company profile.
        </p>
      </Container>
    );
  }

  // Employer whose profile failed to load.
  if (user && isEmployer && profileSet && isError) {
    return (
      <Container className="max-w-3xl py-8">
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load your profile. Please try again.
        </p>
      </Container>
    );
  }

  // Employer without a profile yet → the create form.
  if (user && isEmployer && !profileSet) {
    return (
      <Container className="max-w-3xl py-8">
        <EmployerProfileForm />
      </Container>
    );
  }

  // Loading (session and/or profile) → full-bleed skeleton matching the screen.
  return <CompanyLoadingSkeleton />;
}

/**
 * Full-bleed loading skeleton. Reuses the exact shell of {@link EmployerCompanyScreen}
 * (topbar + page) so the header is stable across the loading→loaded transition.
 */
function CompanyLoadingSkeleton() {
  const { t } = useI18n();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        <button
          type="button"
          className={cn(s["pf-navleft"], s["is-menu"])}
          aria-label={t("company.ariaOpenMenu")}
          onClick={() => setMobileOpen(true)}
        >
          <Ic name="menu" />
        </button>
        <div className={s["pf-topbar-t"]}>{t("nav.company")}</div>
      </header>
      <div className={s.page} aria-busy="true" aria-live="polite">
        <div
          className={cn(s["rz-card"], s["rz-acct-card"], "animate-pulse")}
          style={{ height: 72 }}
        />
        <div className={s["rz-head"]}>
          <h2>{t("company.posts")}</h2>
        </div>
        <div
          className={cn(s["rz-card"], "animate-pulse")}
          style={{ height: 176 }}
        />
      </div>
    </div>
  );
}
