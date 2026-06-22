"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useLanding } from "@/features/marketing/context/landing-context";
import { LANG_LABELS, LANGS } from "@/features/marketing/i18n/landing-copy";
import { IconBurger, IconCheck, IconClose } from "./icons";
import { LanguageDropdown } from "./language-dropdown";
import { PeoplorMark } from "./peoplor-mark";
import { SideToggle } from "./side-toggle";
import styles from "./landing.module.css";

/** Public site header: logo, find/hire toggle, language picker, sign in. */
export function SiteHeader() {
  const { copy, lang, setLang, setSide, openAuth } = useLanding();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link
            href={routes.home}
            className={styles.navLogo}
            aria-label={siteConfig.name}
          >
            <PeoplorMark />
            <span className={styles.navWordmark}>{siteConfig.name}</span>
          </Link>

          <div className={styles.navCenter}>
            <SideToggle variant="nav" />
          </div>

          <div className={styles.navLinks}>
            <LanguageDropdown />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDark}`}
              onClick={() => openAuth("")}
            >
              {copy.ui.navSignin}
            </button>
          </div>

          <button
            type="button"
            className={styles.navBurger}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <IconClose /> : <IconBurger />}
          </button>
        </div>
      </header>

      {/* Mobile menu (≤980px) */}
      <div className={styles.mobileMenu} data-open={menuOpen}>
        <SideToggle variant="mobile" />

        <nav className={styles.mmLinks}>
          <Link href={routes.pricing} onClick={() => setMenuOpen(false)}>
            {copy.ui.navPricing}
          </Link>
        </nav>

        <div className={styles.mmLang}>
          <p className={styles.mmLangLabel}>{copy.ui.langLabel}</p>
          <div className={styles.langddList}>
            {LANGS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={option === lang}
                className={styles.langOpt}
                onClick={() => setLang(option)}
              >
                {LANG_LABELS[option]}
                <IconCheck className={styles.optTick} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.mmActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setMenuOpen(false);
              openAuth("");
            }}
          >
            {copy.ui.navSignin}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => {
              setSide("find");
              setMenuOpen(false);
              openAuth("");
            }}
          >
            {copy.ui.navFind}
          </button>
        </div>
      </div>
    </>
  );
}
