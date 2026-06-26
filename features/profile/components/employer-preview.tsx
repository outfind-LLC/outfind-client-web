"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useI18n } from "@/providers/i18n-provider";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { SessionUser } from "@/interfaces/auth.interface";
import type { Resume } from "@/features/profile/types/resume";
import {
  drivingSummary,
  educationItems,
  groupExperiences,
  languageLevel,
} from "@/features/profile/lib/profile-data";
import { Ic } from "@/features/profile/components/profile-icons";
import s from "@/features/profile/styles/profile.module.css";

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
}

/**
 * "See how employers see it" — a full-screen, read-only résumé document mirroring
 * the prototype's employer preview. Composed entirely from the real worker profile
 * (no edit affordances). Print/Download are stubbed to a toast (PDF pipeline is a
 * backend concern — see docs/api/profile.md §4.6 / §8).
 */
export function EmployerPreview({
  profile,
  user,
  resume,
  onClose,
}: {
  profile: WorkerProfile;
  user: SessionUser;
  resume: Resume;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();

  // Close on Escape + lock the page behind the full-screen overlay.
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

  const companies = groupExperiences(profile, t, locale);
  const education = educationItems(profile);
  const driving = drivingSummary(profile, t);
  const facts = [
    { l: t("profile.factSpec"), v: resume.specialization },
    { l: t("profile.factEmployment"), v: resume.employment },
    { l: t("profile.factSalary"), v: resume.salary },
  ].filter((f) => f.v);

  return (
    <div className={s["emp-screen"]} role="dialog" aria-modal="true" aria-label={t("profile.previewTitle")}>
      <header className={s["emp-topbar"]}>
        <button type="button" className={s["emp-iconbtn"]} aria-label={t("profile.ariaClose")} onClick={onClose}>
          <Ic name="back" />
        </button>
        <div className={s["emp-topbar-title"]}>{t("profile.previewTitle")}</div>
        <button
          type="button"
          className={s["emp-iconbtn"]}
          aria-label={t("profile.ariaPrint")}
          onClick={() => toast(t("profile.toastDownload"))}
        >
          <Ic name="print" />
        </button>
        <button type="button" className={s["emp-dl"]} onClick={() => toast(t("profile.toastDownload"))}>
          <Ic name="download" />
          {t("profile.downloadPdf")}
        </button>
      </header>

      <div className={s["emp-scroll"]}>
        <div className={s["emp-doc-wrap"]}>
          <div className={s["emp-doc"]}>
            <div className={s["emp-head"]}>
              <div className={s["emp-photo"]}>{initials(user.name)}</div>
              <div className={s["emp-head-main"]}>
                <div className={s["emp-name"]}>{user.name}</div>
                {profile.currentCity ? <div className={s["emp-sub"]}>{profile.currentCity}</div> : null}
                <span className={s["emp-updated"]}>
                  {t("profile.updatedAgo", { when: formatRelativeTime(resume.updatedAt) })}
                </span>
              </div>
            </div>

            {user.email || user.telegramUsername ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.empContacts")}</h3>
                {user.email ? <div className={s["emp-phone"]}>{user.email}</div> : null}
                {user.telegramUsername ? (
                  <div className={s["emp-msgrs"]}>
                    <span className={s["emp-msgr"]}>
                      <span className={cn(s["emp-msgr-ic"], s.telegram)}>
                        <Ic name="telegram" />
                      </span>
                      {t("profile.telegram")}
                    </span>
                  </div>
                ) : null}
              </section>
            ) : null}

            {facts.length > 0 ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{resume.title}</h3>
                <div className={s["emp-kv"]}>
                  {facts.map((f) => (
                    <div key={f.l} className={s["emp-kv-row"]}>
                      <span className={s.k}>{f.l}</span> <span className={s.v}>{f.v}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {profile.skills.length > 0 ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.empSkills")}</h3>
                <div className={s["emp-chips"]}>
                  {profile.skills.map((skill) => (
                    <span key={skill} className={s["emp-chip"]}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {profile.languages.length > 0 ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.languages")}</h3>
                <div className={s["emp-chips"]}>
                  {profile.languages.map((lang) => (
                    <span key={lang.id} className={s["emp-chip"]}>
                      {lang.language} <em>{languageLevel(lang.proficiency, t)}</em>
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {education.length > 0 ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.education")}</h3>
                <div className={s["emp-edu"]}>
                  {education.map((ed) => (
                    <div key={ed.id} className={s["emp-edu-item"]}>
                      <div className={s["emp-edu-org"]}>{ed.org}</div>
                      <div className={s["emp-edu-sub"]}>
                        {[ed.field, ed.meta].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {companies.length > 0 ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.empWorkExp")}</h3>
                <div className={s["emp-exp"]}>
                  {companies.flatMap((co) =>
                    co.roles.map((role) => (
                      <div key={role.id} className={s["emp-exp-item"]}>
                        <div className={s["emp-exp-role"]}>{role.role}</div>
                        <div className={s["emp-exp-co"]}>{co.company}</div>
                        <div className={s["emp-exp-dates"]}>{role.dates}</div>
                        {role.bullets.length > 0 ? (
                          <ul className={s["emp-bullets"]}>
                            {role.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    )),
                  )}
                </div>
              </section>
            ) : null}

            {driving || profile.currentCountry ? (
              <section className={s["emp-block"]}>
                <h3 className={s["emp-h"]}>{t("profile.empAdditional")}</h3>
                <div className={s["emp-kv"]}>
                  {driving ? (
                    <div className={s["emp-kv-row"]}>
                      <span className={s.k}>{t("profile.empDriving")}</span> <span className={s.v}>{driving}</span>
                    </div>
                  ) : null}
                  {profile.currentCountry ? (
                    <div className={s["emp-kv-row"]}>
                      <span className={s.k}>{t("profile.empCitizenship")}</span>{" "}
                      <span className={s.v}>{profile.currentCountry}</span>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
