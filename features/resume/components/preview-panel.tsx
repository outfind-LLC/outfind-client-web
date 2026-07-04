"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type {
  ResumeDocument,
  StyleConfig,
} from "@/interfaces/resume.interface";
import type { AtsResult } from "@/features/resume/lib/ats";
import { ResumeRender } from "@/features/resume/templates/resume-render";
import { Ic } from "./resume-ui";
import type { TranslateFn } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import s from "@/features/resume/styles/resume.module.css";

interface Meta {
  isPublic: boolean;
  slug: string | null;
  showContacts: boolean;
}

/** Fit the 794px sheet to the current viewport on first paint. */
function initialZoom(): number {
  if (typeof window === "undefined") return 0.62;
  const avail =
    window.innerWidth < 1024
      ? window.innerWidth - 48
      : Math.min(540, window.innerWidth * 0.44);
  return Math.min(0.9, Math.max(0.4, avail / 794));
}

export function PreviewPanel({
  document,
  style,
  name,
  ats,
  meta,
  t,
  onSetStyle,
  onTogglePublic,
  onToggleContacts,
}: {
  document: ResumeDocument;
  style: StyleConfig;
  name: string;
  ats: AtsResult;
  meta: Meta;
  t: TranslateFn;
  onSetStyle: (patch: Partial<StyleConfig>) => void;
  onTogglePublic: () => void;
  onToggleContacts: () => void;
}) {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Auto-fit: the sheet fills the available preview width (capped at 100%) so
  // text renders as large and crisp as the pane allows. Manual zoom overrides.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(initialZoom);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const zoom = manualZoom ?? fit;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setFit(
        Math.min(1, Math.max(0.4, +((el.clientWidth - 56) / 794).toFixed(3))),
      );
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // Measure the sheet's natural height so the scaled wrapper reserves the right
  // space (a CSS transform keeps the original box, which would leave a big gap).
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(0);
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSheetH(el.offsetHeight));
    ro.observe(el);
    setSheetH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const publicUrl =
    meta.slug && typeof window !== "undefined"
      ? `${window.location.origin}/cv/${meta.slug}`
      : null;

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadResumePdf } =
        await import("@/features/resume/lib/resume-pdf");
      await downloadResumePdf(document, style, name);
    } catch {
      toast.error(t("cv.downloadError"));
    } finally {
      setDownloading(false);
    }
  };

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
    <>
      <div className={s.pvBar}>
        <button
          type="button"
          className={cn(s.btn, s.btnPrimary)}
          disabled={downloading}
          onClick={() => void download()}
        >
          {downloading ? <span className={s.spin} /> : <Ic name="download" />}
          {downloading ? t("cv.downloading") : t("cv.download")}
        </button>

        <div className={s.pvSpacer} />

        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.zoomOut")}
          onClick={() => setManualZoom(Math.max(0.4, +(zoom - 0.1).toFixed(2)))}
        >
          <Ic name="close" />
        </button>
        <span className={s.zoomVal}>{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.zoomIn")}
          onClick={() => setManualZoom(Math.min(1.6, +(zoom + 0.1).toFixed(2)))}
        >
          <Ic name="plus" />
        </button>
        <button
          type="button"
          className={s.iconBtn}
          aria-label={t("cv.darkCanvas")}
          aria-pressed={dark}
          onClick={() => setDark((d) => !d)}
        >
          <Ic name={dark ? "sun" : "moon"} />
        </button>
      </div>

      <div className={s.pvScroll} data-dark={dark} ref={scrollRef}>
        <div style={{ width: "100%", maxWidth: 820 }}>
          {/* The resume — the hero of this pane */}
          <div
            className={s.pvStageWrap}
            style={{
              width: 794 * zoom,
              height: sheetH ? sheetH * zoom : undefined,
            }}
          >
            <div
              ref={sheetRef}
              className={s.pvStage}
              style={{ transform: `scale(${zoom})`, width: 794 }}
            >
              <ResumeRender document={document} style={style} />
            </div>
          </div>

          {/* Page-size + ATS + share, compact, below the sheet */}
          <div className={s.pvMeta}>
            <div
              className={s.segRow}
              style={{ maxWidth: 220, margin: "0 auto" }}
            >
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
                    <span className={s.toggleLabel}>
                      {t("cv.showContacts")}
                    </span>
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
                    </div>
                  ) : null}
                </>
              ) : (
                <p className={s.atsSub}>{t("cv.publicDesc")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
