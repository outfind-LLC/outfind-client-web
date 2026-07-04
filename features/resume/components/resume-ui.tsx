"use client";

import { type CSSProperties } from "react";

import { ICONS, type IconName } from "@/components/icons";
import s from "@/features/resume/styles/resume.module.css";

/** Mask-icon span using the resume module's `.ic`. */
export function Ic({ name }: { name: IconName }) {
  return (
    <span
      className={s.ic}
      style={{ "--i": ICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}

/** Labeled single-line field. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength = 200,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className={s.field}>
      {label ? <label>{label}</label> : null}
      <input
        className={s.input}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={label ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Labeled multi-line field. */
export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 4000,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className={s.field}>
      {label ? <label>{label}</label> : null}
      <textarea
        className={s.textarea}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-label={label ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
