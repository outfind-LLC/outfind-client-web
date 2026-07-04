"use client";

import { useState } from "react";

import type { StyleConfig } from "@/interfaces/resume.interface";
import type { AtsResult } from "@/features/resume/lib/ats";
import { Ic } from "./resume-ui";
import type { TranslateFn } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import s from "@/features/resume/styles/resume.module.css";

interface Meta {
  isPublic: boolean;
  slug: string | null;
  showContacts: boolean;
}

/** Options tab — ATS score, public sharing, and paper size. */
export function OptionsPanel({
  style,
  ats,
  meta,
  t,
  onSetStyle,
  onTogglePublic,
  onToggleContacts,
}: {
  style: StyleConfig;
  ats: AtsResult;
  meta: Meta;
  t: TranslateFn;
  onSetStyle: (patch: Partial<StyleConfig>) => void;
  onTogglePublic: () => void;
  onToggleContacts: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const publicUrl =
    meta.slug && typeof window !== "undefined"
      ? `${window.location.origin}/cv/${meta.slug}`
      : null;

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const tier = ats.score >= 80 ? "hi" : ats.score >= 55 ? "mid" : "lo";
  const tierColor =
    tier === "hi" ? "#1f8f4d" : tier === "mid" ? "#c77d13" : "#cc3333";
  const tierLabel =
    tier === "hi" ? "cv.atsGood" : tier === "mid" ? "cv.atsOk" : "cv.atsLow";
  const failed = ats.checks.filter((c) => !c.ok);

  return (
    <div>
      {/* ATS score */}
      <div className={s.atsCard}>
        <div className={s.atsTop}>
          <div
            className={s.atsRing}
            style={{ background: tierColor }}
            aria-hidden="true"
          >
            {ats.score}
          </div>
          <div className={s.atsHead}>
            <div className={s.atsLabel}>{t("cv.atsScore")}</div>
            <div className={s.atsSub}>{t(tierLabel)}</div>
          </div>
        </div>
        {failed.length === 0 ? (
          <p className={s.atsSub}>{t("cv.atsAllGood")}</p>
        ) : (
          <>
            <div className={s.atsSub} style={{ marginBottom: 8 }}>
              {t("cv.atsRecommend")}
            </div>
            <ul className={s.atsList}>
              {failed.map((c) => (
                <li key={c.key}>
                  <span className={cn(s.atsMark, s.atsFail)}>
                    <Ic name="close" />
                  </span>
                  {t(c.key)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Public sharing */}
      <div className={s.shareCard}>
        <div className={s.toggleRow}>
          <span className={s.toggleLabel}>{t("cv.publicToggle")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={meta.isPublic}
            aria-label={t("cv.publicToggle")}
            className={s.switch}
            onClick={onTogglePublic}
          />
        </div>
        {meta.isPublic ? (
          <>
            <div className={s.toggleRow}>
              <span className={s.toggleLabel}>{t("cv.showContacts")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={meta.showContacts}
                aria-label={t("cv.showContacts")}
                className={s.switch}
                onClick={onToggleContacts}
              />
            </div>
            {publicUrl ? (
              <div className={s.linkRow}>
                <span className={s.linkUrl}>{publicUrl}</span>
                <button
                  type="button"
                  className={cn(s.btn, s.btnGhost)}
                  onClick={() => void copyLink()}
                >
                  <Ic name={copied ? "checkBold" : "copy"} />
                  {copied ? t("cv.copied") : t("cv.copyLink")}
                </button>
                <a
                  className={cn(s.btn, s.btnGhost)}
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ic name="externalLink" />
                  {t("cv.openLink")}
                </a>
              </div>
            ) : null}
          </>
        ) : (
          <p className={s.atsSub} style={{ marginTop: 4 }}>
            {t("cv.publicDesc")}
          </p>
        )}
      </div>

      {/* Paper size */}
      <div className={s.shareCard}>
        <div className={s.dGroupTitle} style={{ marginBottom: 10 }}>
          {t("cv.pageSize")}
        </div>
        <div className={s.segRow}>
          <button
            type="button"
            aria-pressed={style.pageSize === "a4"}
            onClick={() => onSetStyle({ pageSize: "a4" })}
          >
            {t("cv.a4")}
          </button>
          <button
            type="button"
            aria-pressed={style.pageSize === "letter"}
            onClick={() => onSetStyle({ pageSize: "letter" })}
          >
            {t("cv.letter")}
          </button>
        </div>
      </div>
    </div>
  );
}
