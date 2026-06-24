"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import {
  EMPLOYER_VERIFICATION_STATUS,
  type EmployerVerificationStatus,
} from "@/interfaces/enums";
import type { EmployerProfile } from "@/interfaces/employer-profile.interface";
import s from "@/features/profile/styles/company.module.css";

/* icons (exact prototype paths) */
function sIcon(inner: string, sw = 1.5): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const ICONS = {
  company: sIcon("<path d='M3 21h18'/><path d='M5 21V6.4c0-1.13 0-1.7.35-2.05C5.7 4 6.27 4 7.4 4h5.2c1.13 0 1.7 0 2.05.35.35.35.35.92.35 2.05V21'/><path d='M15 9h1.6c1.13 0 1.7 0 2.05.35.35.35.35.92.35 2.05V21'/><path d='M8.5 8h3M8.5 11.5h3M8.5 15h3'/>", 1.6),
  pencil: sIcon("<path d='M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17z'/><path d='M13.5 6.5l3 3'/>", 1.6),
  check: sIcon("<path d='M5 13l4 4L19 7'/>", 2),
  clock: sIcon("<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>", 1.6),
  alert: sIcon("<path d='M12 3l9 16H3z'/><path d='M12 10v4M12 17h.01'/>", 1.6),
  mail: sIcon("<rect x='2.5' y='5' width='19' height='14' rx='3'/><path d='M5 8l5.5 4a2.5 2.5 0 0 0 3 0L19 8'/>", 1.5),
  phone: sIcon("<path d='M5 7c0-1 0-1.5.3-1.9.6-.8 1.7-1.1 2.6-.8.5.2.9.8 1.6 2 .3.5.5.8.5 1.2.1.4 0 .8-.2 1.5l-.5 1.3c-.1.3-.1.4 0 .7a8 8 0 0 0 4 4c.3.1.4.1.7 0l1.3-.5c.7-.2 1.1-.3 1.5-.2.4 0 .7.2 1.2.5 1.2.7 1.8 1.1 2 1.6.3.9 0 2-.8 2.6-.4.3-.9.3-1.9.3A14 14 0 0 1 5 7z'/>", 1.6),
  globe: sIcon("<circle cx='12' cy='12' r='9'/><path d='M3 12h18'/><path d='M12 3c2.4 2.5 2.4 15 0 18M12 3c-2.4 2.5-2.4 15 0 18'/>", 1.5),
  briefcase: sIcon("<rect x='2.5' y='7' width='19' height='13' rx='2.5'/><path d='M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7'/><path d='M2.5 12.5h19'/>", 1.6),
  users: sIcon("<circle cx='9' cy='8' r='3.4'/><path d='M3.5 19c.6-3 3-4.7 5.5-4.7s4.9 1.7 5.5 4.7'/><path d='M16 5.2a3.4 3.4 0 0 1 0 6.6M21 19c-.4-2-1.6-3.4-3.2-4'/>", 1.5),
  pin: sIcon("<path d='M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z'/><circle cx='12' cy='10' r='2.5'/>", 1.6),
  open: sIcon("<path d='M14 4h6v6'/><path d='M20 4l-9 9'/><path d='M18 14v3.5c0 1.4-1.1 2.5-2.5 2.5H6.5C5.1 20 4 18.9 4 17.5V8.5C4 7.1 5.1 6 6.5 6H10'/>", 1.7),
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
