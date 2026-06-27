"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Ic } from "@/features/profile/components/profile-icons";
import s from "@/features/profile/styles/profile.module.css";

type View = "day" | "month" | "year";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function toISO(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
/** Parse an ISO "YYYY-MM-DD" — returns null for anything else (graceful for the
 *  local identity seam, which may hold legacy free-text values). */
function parseISO(v: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  if (m < 0 || m > 11 || d < 1 || d > 31) return null;
  return { y, m, d };
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}
/** Monday-first count of blank leading cells before day 1. */
function leadingBlanks(y: number, m: number): number {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

/**
 * A custom day + month + year date picker in a single field — replaces the native
 * `<input type="date">` (and the old month-select + free-text-year row). Clicking
 * the field opens an inline calendar: pick a day, or tap the title to drill into a
 * month grid → year grid for fast jumps across decades. Value is an ISO
 * "YYYY-MM-DD" string; `min`/`max` (also ISO) bound the selectable range. Styled
 * with the profile module's tokens; closes on outside-click / Escape.
 */
export function DatePickerField({
  value,
  onChange,
  disabled = false,
  placeholder,
  defaultYear,
  min,
  max,
}: {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  placeholder: string;
  defaultYear: number;
  min?: string;
  max?: string;
}) {
  const { t, locale } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);

  const parsed = parseISO(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("day");
  const [viewYear, setViewYear] = useState(parsed?.y ?? defaultYear);
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? 0);

  // Close on outside click / Escape (listeners only — state set in callbacks).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const weekdays = useMemo(
    // 2024-01-01 is a Monday → 7 Monday-first short labels in the active locale.
    () => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" })),
    [locale],
  );
  const monthsShort = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(locale, { month: "short" })),
    [locale],
  );
  const today = useMemo(() => {
    const d = new Date();
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const display = parsed
    ? new Date(parsed.y, parsed.m, parsed.d).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const outDay = (d: number) => {
    const iso = toISO(viewYear, viewMonth, d);
    return Boolean((min && iso < min) || (max && iso > max));
  };
  const outMonth = (y: number, m: number) => {
    const first = toISO(y, m, 1);
    const last = toISO(y, m, daysInMonth(y, m));
    return Boolean((min && last < min) || (max && first > max));
  };
  const outYear = (y: number) => outMonth(y, 11) && outMonth(y, 0);

  const toggle = () => {
    if (disabled) return;
    const base = parseISO(value);
    setViewYear(base?.y ?? defaultYear);
    setViewMonth(base?.m ?? 0);
    setView("day");
    setOpen((o) => !o);
  };
  const pickDay = (d: number) => {
    onChange(toISO(viewYear, viewMonth, d));
    setOpen(false);
  };
  const stepMonth = (delta: number) => {
    const next = viewMonth + delta + viewYear * 12;
    setViewYear(Math.floor(next / 12));
    setViewMonth(((next % 12) + 12) % 12);
  };

  const pageStart = viewYear - 6;
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks(viewYear, viewMonth) }, () => null),
    ...Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
  ];

  const title =
    view === "day"
      ? new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })
      : view === "month"
        ? String(viewYear)
        : `${pageStart} – ${pageStart + 11}`;
  const onTitle = () => setView(view === "day" ? "month" : view === "month" ? "year" : "year");

  // Year/month of the calendar page ±delta months away (for day-view nav).
  const shifted = (delta: number) => {
    const n = viewMonth + delta + viewYear * 12;
    return { y: Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
  };
  const goPrev = () =>
    view === "day" ? stepMonth(-1) : view === "month" ? setViewYear((y) => y - 1) : setViewYear((y) => y - 12);
  const goNext = () =>
    view === "day" ? stepMonth(1) : view === "month" ? setViewYear((y) => y + 1) : setViewYear((y) => y + 12);
  const prevDisabled =
    view === "day"
      ? outMonth(shifted(-1).y, shifted(-1).m)
      : view === "month"
        ? outYear(viewYear - 1)
        : outYear(pageStart - 1);
  const nextDisabled =
    view === "day"
      ? outMonth(shifted(1).y, shifted(1).m)
      : view === "month"
        ? outYear(viewYear + 1)
        : outYear(pageStart + 12);

  return (
    <div className={s["pf-dp"]} ref={wrapRef}>
      <button
        type="button"
        className={cn(s["pf-control"], s["pf-dp-field"], !display && s["is-empty"])}
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-open={open ? "true" : "false"}
      >
        <Ic name="cal" className={s["pf-dp-cal"]} />
        <span className={s["pf-dp-val"]}>{display || placeholder}</span>
        <Ic name="chev" className={s["pf-dp-caret"]} />
      </button>

      {open ? (
        <div className={s["pf-dp-pop"]} role="dialog" aria-label={title}>
          <div className={s["pf-dp-head"]}>
            <button
              type="button"
              className={s["pf-dp-nav"]}
              onClick={goPrev}
              disabled={prevDisabled}
              aria-label={t("profile.wpPrev")}
            >
              <Ic name="chev" className={s["pf-dp-prev"]} />
            </button>
            <button
              type="button"
              className={s["pf-dp-title"]}
              onClick={onTitle}
              disabled={view === "year"}
            >
              {title}
            </button>
            <button
              type="button"
              className={s["pf-dp-nav"]}
              onClick={goNext}
              disabled={nextDisabled}
              aria-label={t("profile.wpNext")}
            >
              <Ic name="chev" />
            </button>
          </div>

          {view === "day" ? (
            <>
              <div className={s["pf-dp-wk"]}>
                {weekdays.map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>
              <div className={s["pf-dp-grid"]}>
                {cells.map((d, i) =>
                  d === null ? (
                    <span key={`b${i}`} className={s["pf-dp-blank"]} />
                  ) : (
                    <button
                      key={d}
                      type="button"
                      className={cn(
                        s["pf-dp-day"],
                        parsed && parsed.y === viewYear && parsed.m === viewMonth && parsed.d === d && s["is-selected"],
                        today === toISO(viewYear, viewMonth, d) && s["is-today"],
                      )}
                      disabled={outDay(d)}
                      onClick={() => pickDay(d)}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>
            </>
          ) : view === "month" ? (
            <div className={s["pf-dp-mg"]}>
              {monthsShort.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    s["pf-dp-cell"],
                    parsed && parsed.y === viewYear && parsed.m === i && s["is-selected"],
                  )}
                  disabled={outMonth(viewYear, i)}
                  onClick={() => {
                    setViewMonth(i);
                    setView("day");
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <div className={s["pf-dp-yg"]}>
              {Array.from({ length: 12 }, (_, i) => pageStart + i).map((y) => (
                <button
                  key={y}
                  type="button"
                  className={cn(s["pf-dp-cell"], parsed && parsed.y === y && s["is-selected"])}
                  disabled={outYear(y)}
                  onClick={() => {
                    setViewYear(y);
                    setView("month");
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className={s["pf-dp-foot"]}>
            <button
              type="button"
              className={s["pf-dp-foot-btn"]}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              {t("profile.wpClear")}
            </button>
            <button
              type="button"
              className={cn(s["pf-dp-foot-btn"], s["pf-dp-foot-today"])}
              disabled={Boolean((min && today < min) || (max && today > max))}
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
            >
              {t("profile.wpToday")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
