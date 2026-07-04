"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { toast } from "sonner";

import { ICONS } from "@/components/icons";
import {
  useUpdateProfileInfo,
  useUpsertLanguages,
} from "@/features/profile/hooks/use-worker-profile-mutations";
import { useI18n } from "@/providers/i18n-provider";
import { isApiClientError } from "@/lib/api/error";
import type { WorkerProfile } from "@/interfaces/worker-profile.interface";
import type { MessageKey } from "@/lib/i18n/translate";
import s from "@/features/cv/styles/cv.module.css";

const LEVELS: { value: string; labelKey: MessageKey }[] = [
  { value: "BASIC", labelKey: "cv.levelBasic" },
  { value: "CONVERSATIONAL", labelKey: "cv.levelConversational" },
  { value: "PROFESSIONAL", labelKey: "cv.levelProfessional" },
  { value: "NATIVE", labelKey: "cv.levelNative" },
];

interface LangRow {
  language: string;
  proficiency: string;
}

/** Which profile pieces the CV needs before generation makes sense. */
export function missingForCv(profile: WorkerProfile) {
  return {
    profession: !profile.profession?.trim(),
    city: !profile.currentCity?.trim(),
    skills: profile.skills.length === 0,
    languages: profile.languages.length === 0,
  };
}

/**
 * Guided fill for whatever the profile is missing — writes straight to the
 * worker profile (the single source of truth); the builder regains control
 * once the profile query refreshes.
 */
export function CvSetupForm({ profile }: { profile: WorkerProfile }) {
  const { t } = useI18n();
  const missing = missingForCv(profile);
  const updateInfo = useUpdateProfileInfo();
  const upsertLanguages = useUpsertLanguages();

  const [profession, setProfession] = useState(profile.profession ?? "");
  const [city, setCity] = useState(profile.currentCity ?? "");
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [langs, setLangs] = useState<LangRow[]>([
    { language: "", proficiency: "CONVERSATIONAL" },
  ]);

  const busy = updateInfo.isPending || upsertLanguages.isPending;

  const parsedSkills = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const validLangs = langs.filter((row) => row.language.trim());

  const canSubmit =
    !busy &&
    (!missing.profession || profession.trim().length > 0) &&
    (!missing.city || city.trim().length > 0) &&
    (!missing.skills || parsedSkills.length > 0) &&
    (!missing.languages || validLangs.length > 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      const info: Parameters<typeof updateInfo.mutateAsync>[0] = {};
      if (missing.profession) info.profession = profession.trim();
      if (missing.city) info.currentCity = city.trim();
      if (missing.skills) info.skills = parsedSkills;
      if (Object.keys(info).length > 0) await updateInfo.mutateAsync(info);
      if (missing.languages && validLangs.length > 0) {
        await upsertLanguages.mutateAsync(
          validLangs.map((row) => ({
            language: row.language.trim(),
            proficiency: row.proficiency,
          })),
        );
      }
    } catch (error) {
      toast.error(isApiClientError(error) ? error.message : t("cv.setupError"));
    }
  };

  return (
    <form className={s.card} onSubmit={submit}>
      <h2 className={s.cardTitle}>{t("cv.setupTitle")}</h2>
      <p className={s.cardDesc}>{t("cv.setupDesc")}</p>

      {missing.profession ? (
        <div className={s.field}>
          <label htmlFor="cv-profession">{t("cv.fieldProfession")}</label>
          <input
            id="cv-profession"
            value={profession}
            placeholder={t("cv.fieldProfessionPh")}
            maxLength={100}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>
      ) : null}

      {missing.city ? (
        <div className={s.field}>
          <label htmlFor="cv-city">{t("cv.fieldCity")}</label>
          <input
            id="cv-city"
            value={city}
            placeholder={t("cv.fieldCityPh")}
            maxLength={100}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      ) : null}

      {missing.skills ? (
        <div className={s.field}>
          <label htmlFor="cv-skills">{t("cv.fieldSkills")}</label>
          <input
            id="cv-skills"
            value={skills}
            placeholder={t("cv.fieldSkillsPh")}
            maxLength={400}
            onChange={(e) => setSkills(e.target.value)}
          />
          <div className={s.hint}>{t("cv.fieldSkillsHint")}</div>
        </div>
      ) : null}

      {missing.languages ? (
        <div className={s.field}>
          <label>{t("cv.fieldLanguages")}</label>
          {langs.map((row, index) => (
            <div key={index} className={s.langRow}>
              <input
                value={row.language}
                placeholder={t("cv.languagePh")}
                maxLength={60}
                aria-label={t("cv.fieldLanguages")}
                onChange={(e) =>
                  setLangs((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, language: e.target.value }
                        : item,
                    ),
                  )
                }
              />
              <select
                value={row.proficiency}
                aria-label={t("cv.fieldLanguages")}
                onChange={(e) =>
                  setLangs((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, proficiency: e.target.value }
                        : item,
                    ),
                  )
                }
              >
                {LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {t(level.labelKey)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={t("cv.removeLanguage")}
                onClick={() =>
                  setLangs((prev) =>
                    prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
                  )
                }
              >
                <span
                  className={s.ic}
                  style={{ "--i": ICONS.close } as CSSProperties}
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={s.addLang}
            onClick={() =>
              setLangs((prev) => [
                ...prev,
                { language: "", proficiency: "CONVERSATIONAL" },
              ])
            }
          >
            <span
              className={s.ic}
              style={{ "--i": ICONS.plus } as CSSProperties}
              aria-hidden="true"
            />
            {t("cv.addLanguage")}
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        className={`${s.btn} ${s.btnPrimary}`}
        disabled={!canSubmit}
      >
        {busy ? <span className={s.spin} /> : null}
        {busy ? t("cv.saving") : t("cv.saveContinue")}
      </button>
    </form>
  );
}
