"use client";

import { useState } from "react";

import type {
  ResumeDocument,
  ResumeTemplateId,
  StyleConfig,
} from "@/interfaces/resume.interface";
import { RESUME_TEMPLATES } from "@/interfaces/resume.interface";
import { FONT_OPTIONS, TEMPLATE_PRESETS } from "@/features/resume/lib/defaults";
import { ResumeRender } from "@/features/resume/templates/resume-render";
import { Ic } from "./resume-ui";
import type { TranslateFn } from "@/providers/i18n-provider";
import type { MessageKey } from "@/lib/i18n/translate";
import s from "@/features/resume/styles/resume.module.css";

const TEMPLATE_LABEL: Record<ResumeTemplateId, MessageKey> = {
  modern: "cv.tplModern",
  creative: "cv.tplCreative",
  executive: "cv.tplExecutive",
  minimal: "cv.tplMinimal",
  ats: "cv.tplAts",
  academic: "cv.tplAcademic",
};

/**
 * Design panel — simple by default: pick a template (each encodes a complete,
 * good-looking style) and an accent color. Everything fine-grained lives behind
 * "More options", so the common path stays uncluttered.
 */
export function DesignPanel({
  document,
  style,
  t,
  onChange,
}: {
  document: ResumeDocument;
  style: StyleConfig;
  t: TranslateFn;
  onChange: (style: StyleConfig) => void;
}) {
  const [more, setMore] = useState(false);
  const set = (patch: Partial<StyleConfig>) => onChange({ ...style, ...patch });

  return (
    <div>
      {/* Templates */}
      <div className={s.dGroup}>
        <div className={s.dGroupTitle}>{t("cv.template")}</div>
        <div className={s.tplGrid}>
          {RESUME_TEMPLATES.map((id) => (
            <button
              key={id}
              type="button"
              className={s.tplCard}
              aria-pressed={style.template === id}
              onClick={() =>
                onChange({
                  ...TEMPLATE_PRESETS[id],
                  accentColor: style.accentColor,
                })
              }
            >
              <div className={s.tplPrev}>
                <div className={s.tplPrevInner}>
                  <ResumeRender
                    document={document}
                    style={{
                      ...TEMPLATE_PRESETS[id],
                      accentColor: style.accentColor,
                    }}
                  />
                </div>
              </div>
              <div className={s.tplName}>{t(TEMPLATE_LABEL[id])}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color + layout — the two most impactful quick choices */}
      <div className={s.dGroup}>
        <div className={s.ctrl}>
          <label>{t("cv.accentColor")}</label>
          <input
            className={s.color}
            type="color"
            value={style.accentColor}
            onChange={(e) => set({ accentColor: e.target.value })}
          />
        </div>
        <div className={s.ctrl}>
          <label>{t("cv.layout")}</label>
          <div className={s.segRow}>
            <button
              type="button"
              aria-pressed={style.layout === "single"}
              onClick={() => set({ layout: "single" })}
            >
              {t("cv.layoutSingle")}
            </button>
            <button
              type="button"
              aria-pressed={style.layout === "two-column"}
              onClick={() => set({ layout: "two-column" })}
            >
              {t("cv.layoutTwo")}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced (collapsed by default) */}
      <button
        type="button"
        className={s.addBtn}
        onClick={() => setMore((v) => !v)}
      >
        <Ic name={more ? "chevronUp" : "chevronDown"} />
        {t("cv.moreOptions")}
      </button>

      {more ? (
        <div style={{ marginTop: 14 }}>
          <div className={s.dGroup}>
            <div className={s.dGroupTitle}>{t("cv.typography")}</div>
            <div className={s.ctrl}>
              <label>{t("cv.font")}</label>
              <select
                className={s.select}
                value={style.fontFamily}
                onChange={(e) => set({ fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <RangeCtrl
              label={t("cv.fontSize")}
              value={style.fontScale}
              min={0.85}
              max={1.25}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => set({ fontScale: v })}
            />
            <RangeCtrl
              label={t("cv.lineSpacing")}
              value={style.lineHeight}
              min={1.2}
              max={1.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(v) => set({ lineHeight: v })}
            />
            <div className={s.ctrl}>
              <label>{t("cv.primaryColor")}</label>
              <input
                className={s.color}
                type="color"
                value={style.primaryColor}
                onChange={(e) => set({ primaryColor: e.target.value })}
              />
            </div>
          </div>

          <div className={s.dGroup}>
            <div className={s.dGroupTitle}>{t("cv.spacingGroup")}</div>
            <div className={s.ctrl}>
              <label>{t("cv.header")}</label>
              <div className={s.segRow}>
                {(["left", "center", "banner"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={style.headerStyle === h}
                    onClick={() => set({ headerStyle: h })}
                  >
                    {t(
                      h === "left"
                        ? "cv.headerLeft"
                        : h === "center"
                          ? "cv.headerCenter"
                          : "cv.headerBanner",
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.ctrl}>
              <label>{t("cv.margins")}</label>
              <div className={s.segRow}>
                {(["sm", "md", "lg"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={style.margin === m}
                    onClick={() => set({ margin: m })}
                  >
                    {t(
                      m === "sm"
                        ? "cv.marginSm"
                        : m === "md"
                          ? "cv.marginMd"
                          : "cv.marginLg",
                    )}
                  </button>
                ))}
              </div>
            </div>
            <RangeCtrl
              label={t("cv.sectionSpacing")}
              value={style.sectionSpacing}
              min={10}
              max={40}
              step={2}
              format={(v) => `${v}px`}
              onChange={(v) => set({ sectionSpacing: v })}
            />
            <div className={s.toggleRow}>
              <span className={s.toggleLabel}>{t("cv.icons")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={style.showIcons}
                aria-label={t("cv.icons")}
                className={s.switch}
                onClick={() => set({ showIcons: !style.showIcons })}
              />
            </div>
            <div className={s.toggleRow}>
              <span className={s.toggleLabel}>{t("cv.photo")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={style.showPhoto}
                aria-label={t("cv.photo")}
                className={s.switch}
                onClick={() => set({ showPhoto: !style.showPhoto })}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RangeCtrl({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className={s.ctrl}>
      <label>
        {label}
        <span className={s.ctrlVal}>{format(value)}</span>
      </label>
      <input
        className={s.range}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
