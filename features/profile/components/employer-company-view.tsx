"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { routes } from "@/config/routes";
import { ICONS as REG } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  EMPLOYER_VERIFICATION_STATUS,
  type EmployerVerificationStatus,
} from "@/interfaces/enums";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import s from "@/features/profile/styles/company.module.css";

/* Company icon names → central registry entries (glyph data: @/components/icons) */
const ICONS = {
  company: REG.companyTall,
  pencil: REG.pencil,
  check: REG.check,
  clock: REG.clock,
  alert: REG.alert,
  mail: REG.mailRound,
  phone: REG.phoneClassic,
  globe: REG.globe,
  briefcase: REG.briefcaseAlt,
  users: REG.usersRound,
  pin: REG.pin,
  open: REG.externalLink,
} as const;
function CIc({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return <span className={cn(s.ic, className)} style={{ "--i": ICONS[name] } as CSSProperties} aria-hidden="true" />;
}

const VERIFY: Record<
  EmployerVerificationStatus,
  { label: string; cls?: string; icon: keyof typeof ICONS }
> = {
  [EMPLOYER_VERIFICATION_STATUS.VERIFIED]: { label: "Verified", icon: "check" },
  [EMPLOYER_VERIFICATION_STATUS.PENDING]: { label: "Pending verification", cls: "pending", icon: "clock" },
  [EMPLOYER_VERIFICATION_STATUS.REJECTED]: { label: "Verification rejected", cls: "rejected", icon: "alert" },
};

/**
 * Employer company profile — the prototype's company view (header, stats strip,
 * About, Contact grid, Details, Job posts). Read view; editing routes to the
 * existing company form via `onEdit`.
 */
export function EmployerCompanyView({
  profile,
  onEdit,
}: {
  profile: EmployerProfile;
  onEdit: () => void;
}) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const v = VERIFY[profile.verificationStatus];

  const contacts: { icon: keyof typeof ICONS; label: string; value: string; href?: string }[] = [
    { icon: "mail", label: "Email", value: profile.corporateEmail, href: `mailto:${profile.corporateEmail}` },
    ...(profile.phone ? [{ icon: "phone" as const, label: "Phone", value: profile.phone, href: `tel:${profile.phone}` }] : []),
    { icon: "globe", label: "Company URL", value: profile.companyUrl, href: profile.companyUrl },
    ...(profile.website ? [{ icon: "globe" as const, label: "Website", value: profile.website, href: profile.website }] : []),
  ];

  const details: { label: string; value: string }[] = [
    ...(profile.industry ? [{ label: "Industry", value: profile.industry }] : []),
    ...(profile.companySize ? [{ label: "Company size", value: profile.companySize }] : []),
    ...(location ? [{ label: "Location", value: location }] : []),
  ];

  return (
    <div className={s.screen}>
      <div className={s.page}>
        {/* Header */}
        <div className={s["rz-card"]}>
          <div className={s["co-head"]}>
            <span className={s["rz-avatar"]}>
              {profile.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.companyLogoUrl} alt="" />
              ) : (
                <CIc name="company" />
              )}
            </span>
            <div className={s["rz-acct-main"]}>
              <div className={s["rz-acct-name"]}>{profile.companyName}</div>
              {profile.industry || location ? (
                <div className={s["rz-acct-sub"]}>
                  {[profile.industry, location].filter(Boolean).join(" · ")}
                </div>
              ) : null}
              <div className={s["co-badge-row"]}>
                <span className={cn(s["co-verified"], v.cls && s[v.cls])}>
                  <CIc name={v.icon} />
                  {v.label}
                </span>
              </div>
            </div>
            <button type="button" className={s["rz-edit"]} onClick={onEdit} aria-label="Edit company profile">
              <CIc name="pencil" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={cn(s["rz-card"], s["co-statcard"])}>
          <div className={s["co-stats"]}>
            <div className={s["co-stat"]}>
              <span className={s["co-stat-n"]}>{profile.totalVacanciesPosted}</span>
              <span className={s["co-stat-l"]}>Vacancies</span>
            </div>
            <div className={s["co-stat-div"]} />
            <div className={s["co-stat"]}>
              <span className={s["co-stat-n"]}>{profile.totalApplications}</span>
              <span className={s["co-stat-l"]}>Applications</span>
            </div>
            <div className={s["co-stat-div"]} />
            <div className={s["co-stat"]}>
              <span className={s["co-stat-n"]}>{profile.trustScore}</span>
              <span className={s["co-stat-l"]}>Trust score</span>
            </div>
          </div>
        </div>

        {/* About */}
        {profile.description ? (
          <>
            <div className={s["pd-title"]}>
              <h2 className={s["pd-h"]}>About</h2>
            </div>
            <div className={cn(s["rz-card"], s["co-about"])}>
              <p className={s["co-about-text"]}>{profile.description}</p>
            </div>
          </>
        ) : null}

        {/* Contact */}
        <div className={s["pd-title"]}>
          <h2 className={s["pd-h"]}>Contact</h2>
        </div>
        <div className={s["co-contact-grid"]}>
          {contacts.map((c) => (
            <a
              key={c.label}
              className={s["pd-cc"]}
              href={c.href}
              target={c.href?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <CIc name={c.icon} />
              <span className={s["pd-cc-txt"]}>
                <span className={s["pd-cc-l"]}>{c.label}</span>
                <span className={s["pd-cc-v"]}>{c.value}</span>
              </span>
            </a>
          ))}
        </div>

        {/* Details */}
        {details.length > 0 ? (
          <>
            <div className={s["pd-title"]}>
              <h2 className={s["pd-h"]}>Details</h2>
            </div>
            <div className={cn(s["rz-card"], s["pd-kvcard"])}>
              {details.map((d) => (
                <div key={d.label} className={s["pd-kv"]}>
                  <div className={s["pd-kv-main"]}>
                    <div className={s["pd-kv-l"]}>{d.label}</div>
                    <div className={s["pd-kv-v"]}>{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Job posts */}
        <div className={s["rz-head"]}>
          <h2>Job posts</h2>
          <Link href={routes.vacancies} className={s["rz-link"]}>
            Manage <CIc name="open" />
          </Link>
        </div>
        {profile.totalVacanciesPosted > 0 ? (
          <div className={s["rz-card"]}>
            <h3 className={s["rz-resume-title"]}>
              {profile.totalVacanciesPosted} active{" "}
              {profile.totalVacanciesPosted === 1 ? "vacancy" : "vacancies"}
            </h3>
            <div className={s["rz-resume-date"]}>
              {profile.totalApplications} applications received
            </div>
            <div className={s["rz-facts"]}>
              <Link href={routes.vacancies} className={cn(s["rz-btn"], s["rz-btn-secondary"])} style={{ marginTop: 16 }}>
                Open Vacancies
              </Link>
            </div>
          </div>
        ) : (
          <div className={cn(s["rz-card"], s["rz-empty"])}>
            <span className={s["rz-empty-ic"]}>
              <CIc name="briefcase" />
            </span>
            <div className={s["rz-empty-t"]}>No job posts yet</div>
            <div className={s["rz-empty-d"]}>
              Post your first vacancy so candidates can find and apply to your roles.
            </div>
            <Link href={routes.vacancyNew} className={cn(s["rz-btn"], s["rz-btn-primary"])} style={{ marginTop: 12 }}>
              Post a job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
