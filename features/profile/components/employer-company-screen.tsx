"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { routes } from "@/config/routes";
import { useSidebarStore } from "@/features/dashboard/store/sidebar.store";
import { useI18n } from "@/providers/i18n-provider";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  EMPLOYER_VERIFICATION_STATUS,
  VACANCY_STATUS,
  VACANCY_TYPE,
} from "@/interfaces/enums";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import type { Vacancy } from "@/interfaces/vacancy.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import type { TranslateFn } from "@/providers/i18n-provider";
import { useVacancies } from "@/features/vacancies/hooks/use-vacancies";
import { useEmployerVerify } from "@/features/vacancies/hooks/use-employer-verify";
import { VerifyStatusModal } from "@/features/vacancies/components/verify-status-modal";
import { Ic } from "@/features/profile/components/profile-icons";
import { CompanyEditModal } from "@/features/profile/components/company-edit-modals";
import type { CompanyEditTarget } from "@/features/profile/types/company-edit-target";
import s from "@/features/profile/styles/profile.module.css";

const EMP_LABEL: Record<string, MessageKey> = {
  [VACANCY_TYPE.FULL_TIME]: "company.empFullTime",
  [VACANCY_TYPE.PART_TIME]: "company.empPartTime",
  [VACANCY_TYPE.CONTRACT]: "company.empContract",
  [VACANCY_TYPE.SEASONAL]: "company.empSeasonal",
  [VACANCY_TYPE.INTERNSHIP]: "company.empInternship",
};
const STATUS_LABEL: Record<string, MessageKey> = {
  [VACANCY_STATUS.ACTIVE]: "company.statusActive",
  [VACANCY_STATUS.PAUSED]: "company.statusPaused",
  [VACANCY_STATUS.FILLED]: "company.statusFilled",
  [VACANCY_STATUS.EXPIRED]: "company.statusExpired",
};

function vacancyLocation(v: Vacancy): string {
  return [v.city, v.country].filter(Boolean).join(", ");
}
function vacancySalary(v: Vacancy): string | null {
  if (v.salaryRaw) return v.salaryRaw;
  if (v.salaryMin != null) {
    const cur = v.currency ?? "";
    return `From ${v.salaryMin.toLocaleString()} ${cur}`.trim();
  }
  return null;
}
function vacancyEmployment(v: Vacancy, t: TranslateFn): string | null {
  const parts: string[] = [];
  if (v.type) parts.push(t(EMP_LABEL[v.type] ?? "company.empFullTime"));
  if (v.isRemote) parts.push("Remote");
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Employer Company surface — pixel-perfect port of `profile.js` (employer +
 * company-detail). Overview = company card → Company detail (header, stats,
 * About, Contact, Company details with per-field edits, Locations, Job posts).
 * All fields — including tagline / founded / locations — edit via the
 * employer-profile API; job posts are live vacancies; "Post a job" opens the
 * full-screen Vacancy Wizard (same flow as the Vacancies screen). See
 * `docs/api/company.md`.
 */
export function EmployerCompanyScreen({
  profile,
}: {
  profile: EmployerProfile;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const setMobileOpen = useSidebarStore((st) => st.setMobileOpen);
  const foundedText =
    profile.foundedYear != null ? String(profile.foundedYear) : "";
  const vacanciesQuery = useVacancies();
  const vacancies = vacanciesQuery.data ?? [];
  const activeCount = vacancies.filter(
    (v) => v.status === VACANCY_STATUS.ACTIVE,
  ).length;

  // The sidebar account-menu header deep-links here with `?view=detail` to open
  // the company "About" detail directly. Synced in render (not an effect).
  const wantDetail = useSearchParams().get("view") === "detail";
  const [view, setView] = useState<"overview" | "detail">(
    wantDetail ? "detail" : "overview",
  );
  const [prevWant, setPrevWant] = useState(wantDetail);
  if (wantDetail !== prevWant) {
    setPrevWant(wantDetail);
    if (wantDetail) setView("detail");
  }
  const [editTarget, setEditTarget] = useState<CompanyEditTarget | null>(null);

  // "Post a job" navigates to the wizard SCREEN (/vacancies/new — same design
  // flow as the Vacancies screen; the sidebar stays visible).
  const { isApproved } = useEmployerVerify();
  const [pendingModal, setPendingModal] = useState(false);
  const postJob = () => {
    if (isApproved) router.push(routes.vacancyNew);
    else setPendingModal(true);
  };

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const verified =
    profile.verificationStatus === EMPLOYER_VERIFICATION_STATUS.VERIFIED;

  const postCard = (v: Vacancy) => {
    const salary = vacancySalary(v);
    const employment = vacancyEmployment(v, t);
    const loc = vacancyLocation(v);
    return (
      <div key={v.id} className={cn(s["rz-card"], s["rz-resume"])}>
        <div className={s["rz-resume-top"]}>
          <h3 className={s["rz-resume-title"]}>{v.title}</h3>
          <span className={cn(s["co-verified"])}>
            {t(STATUS_LABEL[v.status] ?? "company.statusActive")}
          </span>
        </div>
        <div className={s["rz-resume-date"]}>
          {t("company.updatedAgo", { when: formatRelativeTime(v.updatedAt) })}
        </div>
        <div className={s["rz-facts"]}>
          {v.vacancyDomain ? (
            <Fact k={t("company.factSpec")} v={v.vacancyDomain} />
          ) : null}
          {salary ? <Fact k={t("company.factSalary")} v={salary} /> : null}
          {employment ? (
            <Fact k={t("company.factEmployment")} v={employment} />
          ) : null}
          {loc ? <Fact k={t("company.factLocation")} v={loc} /> : null}
        </div>
      </div>
    );
  };

  const jobPostsSection = (
    <>
      {vacancies.length > 0 ? (
        vacancies.map(postCard)
      ) : (
        <div className={cn(s["rz-card"], s["rz-empty"])}>
          <span className={s["rz-empty-ic"]}>
            <Ic name="briefcase" />
          </span>
          <div className={s["rz-empty-t"]}>{t("company.emptyTitle")}</div>
          <div className={s["rz-empty-d"]}>{t("company.emptyDesc")}</div>
          <button
            type="button"
            className={cn(s["rz-btn"], s["rz-btn-primary"])}
            style={{ marginTop: 12 }}
            onClick={postJob}
          >
            <Ic name="plus" />
            {t("company.postJob")}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className={s.screen}>
      <header className={s.topbar}>
        {view === "detail" ? (
          <button
            type="button"
            className={cn(s["pf-navleft"], s["is-back"])}
            aria-label={t("company.ariaBack")}
            onClick={() => setView("overview")}
          >
            <Ic name="back" />
          </button>
        ) : (
          <button
            type="button"
            className={cn(s["pf-navleft"], s["is-menu"])}
            aria-label={t("company.ariaOpenMenu")}
            onClick={() => setMobileOpen(true)}
          >
            <Ic name="menu" />
          </button>
        )}
        <div className={s["pf-topbar-t"]}>
          {view === "detail" ? t("company.detailTitle") : t("nav.company")}
        </div>
      </header>

      {view === "overview" ? (
        <div className={s.page}>
          {/* Company card → detail */}
          <div className={cn(s["rz-card"], s["rz-acct-card"])}>
            <button
              type="button"
              className={s["rz-acct"]}
              aria-label={profile.companyName}
              onClick={() => setView("detail")}
            >
              <span className={s["rz-avatar"]}>
                {profile.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.companyLogoUrl} alt="" />
                ) : (
                  <Ic name="company" />
                )}
              </span>
              <span className={s["rz-acct-main"]}>
                <span className={s["rz-acct-name"]}>{profile.companyName}</span>
                <span className={s["rz-acct-sub"]}>
                  {profile.tagline ||
                    profile.industry ||
                    location ||
                    profile.corporateEmail}
                </span>
              </span>
              <span className={s["rz-chev"]}>
                <Ic name="chev" />
              </span>
            </button>
          </div>

          <div className={s["rz-head"]}>
            <h2>{t("company.posts")}</h2>
            <button
              type="button"
              className={cn(s["rz-btn"], s["rz-btn-secondary"])}
              onClick={postJob}
            >
              <Ic name="plus" />
              {t("company.postJob")}
            </button>
          </div>
          {jobPostsSection}
        </div>
      ) : (
        <div className={s.page}>
          {/* Header */}
          <div className={cn(s["pd-card"], s["pd-head"], s["co-head"])}>
            <div className={s["pd-head-row"]}>
              <div className={s["pd-head-main"]}>
                <h2 className={s["pd-name"]}>{profile.companyName}</h2>
                {profile.tagline ? (
                  <div className={s["pd-bd"]}>{profile.tagline}</div>
                ) : null}
                {verified ? (
                  <div className={s["co-badge-row"]}>
                    <span className={s["co-verified"]}>
                      <Ic name="check" />
                      {t("company.verified")}
                    </span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className={s["pd-edit-link"]}
                onClick={() => setEditTarget({ type: "identity" })}
              >
                <Ic name="pen" />
                <span className={s["pd-edit-t"]}>{t("company.edit")}</span>
              </button>
              <div className={cn(s["pd-photo"], s["pd-photo-co"])}>
                {profile.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.companyLogoUrl} alt="" />
                ) : (
                  <Ic name="company" />
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={cn(s["pd-card"], s["co-statcard"])}>
            <div className={s["co-stats"]}>
              <Stat n={activeCount} l={t("company.openRoles")} />
              <span className={s["co-stat-div"]} />
              <Stat n={profile.totalApplications} l={t("company.applicants")} />
              <span className={s["co-stat-div"]} />
              <Stat n="—" l={t("company.hires")} />
            </div>
          </div>

          {/* About */}
          <SectionTitle title={t("company.about")} />
          <div className={cn(s["pd-card"], s["co-about"])}>
            {profile.description ? (
              <p className={s["co-about-text"]}>{profile.description}</p>
            ) : (
              <p className={cn(s["co-about-text"], s["pd-empty"])}>
                {t("company.aboutPh")}
              </p>
            )}
            <button
              type="button"
              className={s["pd-card-edit"]}
              onClick={() => setEditTarget({ type: "about" })}
            >
              {t("company.editAbout")}
            </button>
          </div>

          {/* Contact */}
          <SectionTitle title={t("company.contact")} />
          <div className={s["pd-contact"]}>
            <div className={s["co-contact-grid"]}>
              <ContactCard
                icon="phone"
                label={t("company.phone")}
                value={profile.phone}
                onClick={() =>
                  setEditTarget({ type: "contact", field: "phone" })
                }
                t={t}
              />
              <ContactCard
                icon="mail"
                label={t("company.email")}
                value={profile.corporateEmail}
                t={t}
              />
              <ContactCard
                icon="globe"
                label={t("company.website")}
                value={profile.website}
                onClick={() =>
                  setEditTarget({ type: "contact", field: "website" })
                }
                t={t}
              />
            </div>
          </div>

          {/* Company details */}
          <SectionTitle title={t("company.details")} />
          <div className={cn(s["pd-card"], s["pd-kvcard"])}>
            <Kv
              label={t("company.industry")}
              value={profile.industry}
              onClick={() =>
                setEditTarget({ type: "field", field: "industry" })
              }
              t={t}
            />
            <Kv
              label={t("company.size")}
              value={profile.companySize}
              onClick={() => setEditTarget({ type: "field", field: "size" })}
              t={t}
            />
            <Kv
              label={t("company.founded")}
              value={foundedText || null}
              onClick={() => setEditTarget({ type: "field", field: "founded" })}
              t={t}
            />
            <Kv
              label={t("company.hq")}
              value={location || null}
              onClick={() => setEditTarget({ type: "field", field: "hq" })}
              t={t}
            />
          </div>

          {/* Locations */}
          <div className={s["pd-shead"]}>
            <h3 className={s["pd-h"]}>{t("company.locations")}</h3>
            <button
              type="button"
              className={s["pd-add"]}
              onClick={() => setEditTarget({ type: "location", index: null })}
            >
              <Ic name="plus" />
              {t("company.addLocation")}
            </button>
          </div>
          <div className={cn(s["pd-card"], s["pd-listcard"])}>
            {profile.locations.length > 0 ? (
              profile.locations.map((loc, i) => (
                <div key={loc.id} className={cn(s["pd-item"], s["pd-coloc"])}>
                  <div className={s["pd-item-main"]}>
                    <div className={s["pd-item-t"]}>{loc.city}</div>
                    {loc.address ? (
                      <div className={s["pd-item-s"]}>{loc.address}</div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={s["pd-edit"]}
                    onClick={() =>
                      setEditTarget({ type: "location", index: i })
                    }
                  >
                    <Ic name="pen" />
                    <span className={s["pd-edit-t"]}>{t("company.edit")}</span>
                  </button>
                </div>
              ))
            ) : (
              <div className={cn(s["pd-item"], s["pd-coloc"])}>
                <div className={s["pd-item-main"]}>
                  <div className={cn(s["pd-item-t"], s["pd-empty"])}>
                    {t("company.notSpecified")}
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              className={s["pd-card-edit"]}
              onClick={() => setEditTarget({ type: "location", index: null })}
            >
              {t("company.addLocation")}
            </button>
          </div>

          {/* Job posts */}
          <div className={s["rz-head"]}>
            <h2>{t("company.posts")}</h2>
            <button
              type="button"
              className={cn(s["rz-btn"], s["rz-btn-secondary"])}
              onClick={postJob}
            >
              <Ic name="plus" />
              {t("company.postJob")}
            </button>
          </div>
          {jobPostsSection}
        </div>
      )}

      {editTarget ? (
        <CompanyEditModal
          target={editTarget}
          profile={profile}
          onClose={() => setEditTarget(null)}
        />
      ) : null}
      {pendingModal ? (
        <VerifyStatusModal
          kind="pending"
          onClose={() => setPendingModal(false)}
        />
      ) : null}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className={s["rz-fact"]}>
      <span className={s.k}>{k}</span>
      <span className={s.v}>{v}</span>
    </div>
  );
}
function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div className={s["co-stat"]}>
      <span className={s["co-stat-n"]}>{n}</span>
      <span className={s["co-stat-l"]}>{l}</span>
    </div>
  );
}
function SectionTitle({ title }: { title: string }) {
  return (
    <div className={s["pd-title"]}>
      <h2 className={s["pd-h"]}>{title}</h2>
    </div>
  );
}
function ContactCard({
  icon,
  label,
  value,
  onClick,
  t,
}: {
  icon: "phone" | "mail" | "globe";
  label: string;
  value: string | null;
  onClick?: () => void;
  t: TranslateFn;
}) {
  return (
    <button
      type="button"
      className={s["pd-cc"]}
      onClick={onClick}
      disabled={!onClick}
    >
      <Ic name={icon} />
      <span className={s["pd-cc-txt"]}>
        <span className={s["pd-cc-l"]}>{label}</span>
        <span className={s["pd-cc-v"]}>
          {value || t("company.notSpecified")}
        </span>
      </span>
    </button>
  );
}
function Kv({
  label,
  value,
  onClick,
  t,
}: {
  label: string;
  value: string | null;
  onClick: () => void;
  t: TranslateFn;
}) {
  return (
    <div className={s["pd-kv"]}>
      <div className={s["pd-kv-main"]}>
        <div className={s["pd-kv-l"]}>{label}</div>
        <div className={cn(s["pd-kv-v"], !value && s["pd-empty"])}>
          {value || t("company.notSpecified")}
        </div>
      </div>
      <button type="button" className={s["pd-edit"]} onClick={onClick}>
        <Ic name="pen" />
        <span className={s["pd-edit-t"]}>{t("company.edit")}</span>
      </button>
    </div>
  );
}
