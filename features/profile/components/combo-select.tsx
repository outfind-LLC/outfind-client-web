"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Ic } from "@/features/profile/components/profile-icons";
import s from "@/features/profile/styles/profile.module.css";

export interface ComboOption {
  value: string;
  label: string;
}

/** Shared open/close-on-outside-click + Escape behaviour for the popups. */
function usePopup() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
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
  return { open, setOpen, ref };
}

function useFiltered(options: ComboOption[], query: string): ComboOption[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);
}

/** Whether to show the search box (only worth it past a handful of options). */
const SEARCH_THRESHOLD = 6;

/**
 * A nice single-select dropdown with a search box (replaces a bare `<select>`).
 * Renders inside the modal's field layout (label + control).
 */
export function ComboSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder: string;
}) {
  const { t } = useI18n();
  const { open, setOpen, ref } = usePopup();
  const [query, setQuery] = useState("");
  const filtered = useFiltered(options, query);
  const selected = options.find((o) => o.value === value) ?? null;
  const searchable = options.length > SEARCH_THRESHOLD;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={s["pf-field"]}>
      <span className={s["pf-field-l"]}>{label}</span>
      <div className={cn(s["pf-combo"], open && s.open)} ref={ref}>
        <button
          type="button"
          className={cn(s["pf-control"], s["pf-combo-btn"])}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={cn(s["pf-combo-val"], !selected && s["pf-combo-ph"])}
          >
            {selected?.label ?? placeholder}
          </span>
          <Ic name="chev" />
        </button>
        {open ? (
          <div className={s["pf-combo-pop"]} role="listbox">
            {searchable ? (
              <div className={s["pf-combo-search"]}>
                <input
                  className={s["pf-combo-search-inp"]}
                  autoFocus
                  value={query}
                  placeholder={t("profile.comboSearch")}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            ) : null}
            <div className={s["pf-combo-list"]}>
              {filtered.length > 0 ? (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    className={cn(
                      s["pf-combo-opt"],
                      o.value === value && s.sel,
                    )}
                    onClick={() => pick(o.value)}
                  >
                    <span>{o.label}</span>
                    {o.value === value ? <Ic name="check" /> : null}
                  </button>
                ))
              ) : (
                <div className={s["pf-combo-empty"]}>
                  {t("profile.comboNoResults")}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A multi-select dropdown with a search box + selected chips. Used for
 * citizenship / work-permit / target countries. Caps at `max` when provided.
 */
export function MultiCombo({
  label,
  values,
  onChange,
  options,
  placeholder,
  max,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: ComboOption[];
  placeholder: string;
  max?: number;
}) {
  const { t } = useI18n();
  const { open, setOpen, ref } = usePopup();
  const [query, setQuery] = useState("");
  const filtered = useFiltered(options, query);
  const searchable = options.length > SEARCH_THRESHOLD;
  const atMax = max != null && values.length >= max;

  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else if (!atMax) onChange([...values, v]);
  };
  const labelFor = (v: string) =>
    options.find((o) => o.value === v)?.label ?? v;

  return (
    <div className={s["pf-field"]}>
      <span className={s["pf-field-l"]}>{label}</span>
      {values.length > 0 ? (
        <div className={s["pf-tags"]}>
          {values.map((v) => (
            <span key={v} className={s["pf-tag"]}>
              {labelFor(v)}
              <button
                type="button"
                className={s["pf-tag-x"]}
                aria-label={t("profile.tagRemove", { item: labelFor(v) })}
                onClick={() => toggle(v)}
              >
                <Ic name="close" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className={cn(s["pf-combo"], open && s.open)} ref={ref}>
        <button
          type="button"
          className={cn(s["pf-control"], s["pf-combo-btn"])}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn(s["pf-combo-val"], s["pf-combo-ph"])}>
            {values.length > 0
              ? t("profile.comboSelected", { n: values.length })
              : placeholder}
          </span>
          <Ic name="chev" />
        </button>
        {open ? (
          <div
            className={s["pf-combo-pop"]}
            role="listbox"
            aria-multiselectable
          >
            {searchable ? (
              <div className={s["pf-combo-search"]}>
                <input
                  className={s["pf-combo-search-inp"]}
                  autoFocus
                  value={query}
                  placeholder={t("profile.comboSearch")}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            ) : null}
            <div className={s["pf-combo-list"]}>
              {filtered.length > 0 ? (
                filtered.map((o) => {
                  const on = values.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={on}
                      disabled={!on && atMax}
                      className={cn(s["pf-combo-opt"], on && s.sel)}
                      onClick={() => toggle(o.value)}
                    >
                      <span>{o.label}</span>
                      {on ? <Ic name="check" /> : null}
                    </button>
                  );
                })
              ) : (
                <div className={s["pf-combo-empty"]}>
                  {t("profile.comboNoResults")}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {max != null ? (
        <span className={s["pf-hint"]}>
          {t("profile.tagsCount", { n: values.length, max })}
        </span>
      ) : null}
    </div>
  );
}
