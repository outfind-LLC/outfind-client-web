"use client";

import { useEffect, useRef, useState } from "react";

import { useLanding } from "@/features/marketing/context/landing-context";
import {
  LANG_LABELS,
  LANG_SHORT,
  LANGS,
} from "@/features/marketing/i18n/landing-copy";
import { IconCheck, IconChevronDown, IconGlobe } from "./icons";
import styles from "./landing.module.css";

/** Brand language picker (globe + EN/RU/UZ), matching the prototype dropdown. */
export function LanguageDropdown() {
  const { lang, setLang } = useLanding();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.langdd} data-open={open} ref={ref}>
      <button
        type="button"
        className={styles.langddBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={LANG_LABELS[lang]}
        onClick={() => setOpen((value) => !value)}
      >
        <IconGlobe className={styles.globe} />
        {LANG_SHORT[lang]}
        <IconChevronDown className={styles.caret} />
      </button>
      <div className={styles.langddMenu} role="menu">
        {LANGS.map((option) => (
          <button
            key={option}
            type="button"
            role="menuitemradio"
            aria-checked={option === lang}
            aria-pressed={option === lang}
            className={styles.langOpt}
            onClick={() => {
              setLang(option);
              setOpen(false);
            }}
          >
            {LANG_LABELS[option]}
            <IconCheck className={styles.optTick} />
          </button>
        ))}
      </div>
    </div>
  );
}
