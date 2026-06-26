"use client";

import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { SessionUser } from "@/interfaces/auth.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import {
  contactTiles,
  drivingSummary,
  educationItems,
  groupExperiences,
  languageLevel,
  searchSettings,
  type ContactTile,
} from "@/features/profile/lib/profile-data";
import { Ic, type IconName } from "@/features/profile/components/profile-icons";
import type { EditTarget } from "@/features/profile/types/edit-target";
import s from "@/features/profile/styles/profile.module.css";

const CONTACT_ICON: Record<ContactTile["key"], IconName> = {
  phone: "phone",
  email: "mail",
  telegram: "telegram",
  whatsapp: "whatsapp",
};
const CONTACT_LABEL: Record<ContactTile["key"], MessageKey> = {
  phone: "profile.phone",
  email: "profile.email",
  telegram: "profile.telegram",
  whatsapp: "profile.whatsapp",
};

/**
 * Worker profile detail — the prototype's editable résumé view. Read rendering is
 * pixel-perfect + live. Each pencil / Add emits an `EditTarget`; sections backed
 * by existing CRUD (education, languages, search settings, driving) open a real
 * editor, the rest (header DOB, contacts, work experience) report "soon" until
 * their NEW backend fields ship (docs/api/profile.md).
 */
export function WorkerProfileDetail({
  profile,
  user,
  onEdit,
}: {
  profile: WorkerProfile;
  user: SessionUser;
  onEdit: (target: EditTarget) => void;
}) {
  const { t, locale } = useI18n();

  const { filled, empty } = contactTiles(user);
  const { live, search } = searchSettings(profile, t);
  const driving = drivingSummary(profile, t);
  const education = educationItems(profile);
  const companies = groupExperiences(profile, t, locale);
  const avatarUrl = profile.photoUrl ?? user.avatarUrl;
  const totalExp = profile.experienceYears != null ? t("profile.yearsOfExp", { n: profile.experienceYears }) : "";

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={cn(s["pd-card"], s["pd-head"])}>
        <div className={s["pd-head-row"]}>
          <div className={s["pd-head-main"]}>
            <h2 className={s["pd-name"]}>{user.name}</h2>
          </div>
          <button
            type="button"
            className={s["pd-edit-link"]}
            aria-label={t("profile.ariaEditProfile")}
            onClick={() => onEdit({ type: "soon" })}
          >
            <Ic name="pen" />
            <span className={s["pd-edit-t"]}>{t("profile.edit")}</span>
          </button>
          <div className={s["pd-photo"]}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            ) : (
              <Ic name="user" />
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <h3 className={cn(s["pd-h"], s["pd-title"])}>{t("profile.contactInfo")}</h3>
      <div className={s["pd-contact"]}>
        <div className={s["pd-contact-grid"]}>
          {filled.map((c) => (
            <button
              key={c.key}
              type="button"
              className={cn(s["pd-cc"], s.wide, s.added, c.brand && s.brand, c.brand && s[c.brand])}
              aria-label={t(CONTACT_LABEL[c.key])}
              onClick={() => onEdit({ type: "soon" })}
            >
              <Ic name={CONTACT_ICON[c.key]} />
              <span className={s["pd-cc-txt"]}>
                <span className={s["pd-cc-l"]}>{t(CONTACT_LABEL[c.key])}</span>
                <span className={s["pd-cc-v"]}>{c.value}</span>
              </span>
            </button>
          ))}
        </div>
        {empty.length > 0 ? (
          <div className={s["pd-contact-empties"]}>
            {empty.map((key) => (
              <button
                key={key}
                type="button"
                className={cn(s["pd-cc"], s.brand, s[key])}
                aria-label={t(CONTACT_LABEL[key])}
                onClick={() => onEdit({ type: "soon" })}
              >
                <Ic name={CONTACT_ICON[key]} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Search settings */}
      <h3 className={cn(s["pd-h"], s["pd-title"])}>{t("profile.searchSettings")}</h3>
      <div className={cn(s["pd-card"], s["pd-kvcard"], s["pd-searchcard"])}>
        <Kv label={t("profile.whereLive")} value={live} onClick={() => onEdit({ type: "searchLocation" })} t={t} />
        <Kv label={t("profile.whereSearch")} value={search} onClick={() => onEdit({ type: "searchArea" })} t={t} />
        <button type="button" className={s["pd-card-edit"]} onClick={() => onEdit({ type: "searchLocation" })}>
          {t("profile.edit")}
        </button>
      </div>

      {/* Education */}
      <Shead title={t("profile.education")} onAdd={() => onEdit({ type: "education", item: null })} t={t} />
      <div className={cn(s["pd-card"], s["pd-listcard"])}>
        {education.length > 0 ? (
          education.map((ed) => {
            const raw = profile.education.find((e) => e.id === ed.id) ?? null;
            return (
              <div key={ed.id} className={cn(s["pd-item"], s["pd-edu"])}>
                <div className={s["pd-item-main"]}>
                  <div className={s["pd-item-t"]}>{ed.org}</div>
                  {ed.field ? <div className={s["pd-item-s"]}>{ed.field}</div> : null}
                  {ed.meta ? <div className={s["pd-item-m"]}>{ed.meta}</div> : null}
                </div>
                <EditPencil onClick={() => onEdit({ type: "education", item: raw })} t={t} />
              </div>
            );
          })
        ) : (
          <div className={cn(s["pd-item"], s["pd-edu"], s["pd-emptyrow"])}>
            <div className={s["pd-item-main"]}>
              <div className={cn(s["pd-item-t"], s["pd-empty"])}>{t("profile.notSpecified")}</div>
            </div>
          </div>
        )}
        <button type="button" className={s["pd-card-edit"]} onClick={() => onEdit({ type: "education", item: null })}>
          {t("profile.edit")}
        </button>
      </div>

      {/* Driving experience */}
      {driving ? (
        <>
          <h3 className={cn(s["pd-h"], s["pd-title"])}>{t("profile.drivingExp")}</h3>
          <div className={cn(s["pd-card"], s["pd-kvcard"])}>
            <Kv label={t("profile.drivingExp")} value={driving} onClick={() => onEdit({ type: "driving" })} t={t} />
          </div>
        </>
      ) : null}

      {/* Languages */}
      <Shead title={t("profile.languages")} onAdd={() => onEdit({ type: "language", item: null })} t={t} />
      <div className={cn(s["pd-card"], s["pd-listcard"])}>
        {profile.languages.length > 0 ? (
          profile.languages.map((lang) => (
            <div key={lang.id} className={cn(s["pd-item"], s["pd-lang"])}>
              <div className={s["pd-item-main"]}>
                <div className={s["pd-item-t"]}>{lang.language}</div>
                <div className={s["pd-item-s"]}>{languageLevel(lang.proficiency, t)}</div>
              </div>
              <EditPencil onClick={() => onEdit({ type: "language", item: lang })} t={t} />
            </div>
          ))
        ) : (
          <div className={cn(s["pd-item"], s["pd-lang"], s["pd-emptyrow"])}>
            <div className={s["pd-item-main"]}>
              <div className={cn(s["pd-item-t"], s["pd-empty"])}>{t("profile.notSpecified")}</div>
            </div>
          </div>
        )}
        <button type="button" className={s["pd-card-edit"]} onClick={() => onEdit({ type: "language", item: null })}>
          {t("profile.edit")}
        </button>
      </div>

      {/* Work experience */}
      <Shead title={t("profile.workExp", { exp: totalExp })} onAdd={() => onEdit({ type: "experience", item: null })} t={t} />
      <div className={cn(s["pd-card"], s["pd-co"], s["pd-workcard"])}>
        {companies.length > 0 ? (
          companies.map((co) => (
            <div key={co.company} className={s["pd-co-block"]}>
              <div className={s["pd-co-head"]}>
                <div className={s["pd-co-logo"]}>
                  <Ic name="company" />
                </div>
                <div>
                  <div className={s["pd-co-name"]}>{co.company}</div>
                  <div className={s["pd-co-years"]}>{t("profile.yearsOfExp", { n: co.years })}</div>
                </div>
              </div>
              <div className={s["pd-tl"]}>
                {co.roles.map((role) => {
                  const rawExp = profile.experiences.find((e) => e.id === role.id) ?? null;
                  return (
                  <div key={role.id} className={s["pd-pos"]}>
                    <span className={s["pd-pos-dot"]} />
                    <div>
                      <div className={s["pd-pos-top"]}>
                        <div className={s["pd-pos-role"]}>{role.role}</div>
                        <EditPencil onClick={() => onEdit({ type: "experience", item: rawExp })} t={t} />
                      </div>
                      <div className={s["pd-pos-dates"]}>{role.dates}</div>
                      {role.bullets.map((b, i) => (
                        <p key={i} className={s["pd-pos-p"]}>
                          {b}
                        </p>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={cn(s["pd-item"], s["pd-emptyrow"])}>
            <div className={s["pd-item-main"]}>
              <div className={cn(s["pd-item-t"], s["pd-empty"])}>{t("profile.notSpecified")}</div>
            </div>
          </div>
        )}
        <button type="button" className={s["pd-card-edit"]} onClick={() => onEdit({ type: "experience", item: null })}>
          {t("profile.edit")}
        </button>
      </div>
    </div>
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
  t: (k: MessageKey, p?: Record<string, string | number>) => string;
}) {
  return (
    <div className={s["pd-kv"]}>
      <div className={s["pd-kv-main"]}>
        <div className={s["pd-kv-l"]}>{label}</div>
        <div className={s["pd-kv-v"]}>{value ?? t("profile.notSpecified")}</div>
      </div>
      <EditPencil onClick={onClick} t={t} />
    </div>
  );
}

function EditPencil({ onClick, t }: { onClick: () => void; t: (k: MessageKey) => string }) {
  return (
    <button type="button" className={s["pd-edit"]} aria-label={t("profile.edit")} onClick={onClick}>
      <Ic name="pen" />
      <span className={s["pd-edit-t"]}>{t("profile.edit")}</span>
    </button>
  );
}

function Shead({
  title,
  onAdd,
  t,
}: {
  title: string;
  onAdd: () => void;
  t: (k: MessageKey) => string;
}) {
  return (
    <div className={s["pd-shead"]}>
      <h3 className={s["pd-h"]}>{title}</h3>
      <button type="button" className={s["pd-add"]} onClick={onAdd}>
        <Ic name="plus" />
        {t("profile.add")}
      </button>
    </div>
  );
}
