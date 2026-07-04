"use client";

import { useEffect, useRef, useState } from "react";

import type {
  ResumeDocument,
  StyleConfig,
} from "@/interfaces/resume.interface";
import { ResumeRender } from "@/features/resume/templates/resume-render";
import { Ic } from "./resume-ui";
import type { TranslateFn } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import s from "@/features/resume/styles/resume.module.css";

/** Fit the 794px sheet to the current viewport on first paint. */
function initialZoom(): number {
  if (typeof window === "undefined") return 0.62;
  const avail =
    window.innerWidth < 1024
      ? window.innerWidth - 48
      : Math.min(760, window.innerWidth * 0.5);
  return Math.min(1, Math.max(0.4, avail / 794));
}

/** Live resume preview — just the sheet + a compact toolbar. */
export function PreviewPanel({
  document,
  style,
  downloading,
  t,
  onDownload,
}: {
  document: ResumeDocument;
  style: StyleConfig;
  downloading: boolean;
  t: TranslateFn;
  onDownload: () => void;
}) {
  const [dark, setDark] = useState(false);

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

  return (
    <>
      <div className={s.pvBar}>
        <button
          type="button"
          className={cn(s.btn, s.btnPrimary)}
          disabled={downloading}
          onClick={onDownload}
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
      </div>
    </>
  );
}
