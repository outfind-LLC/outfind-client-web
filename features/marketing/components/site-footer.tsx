"use client";

import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useLanding } from "@/features/marketing/context/landing-context";
import { IconMail, IconTelegram } from "./icons";
import { PeoplorMark } from "./peoplor-mark";
import styles from "./landing.module.css";

/** Marketing footer: brand + tagline, product/legal links, social + copyright. */
export function SiteFooter() {
  const { copy, setSide } = useLanding();
  const ui = copy.ui;

  return (
    <footer className={styles.ft}>
      <div className={styles.wrap}>
        <div className={styles.ftGrid}>
          <div className={styles.ftBrand}>
            <Link
              href={routes.home}
              className={styles.ftLogo}
              aria-label={siteConfig.name}
            >
              <PeoplorMark />
              <span className={styles.navWordmark}>{siteConfig.name}</span>
            </Link>
            <p>{ui.footTagline}</p>
          </div>

          <div className={styles.ftCol}>
            <h4>{ui.footProduct}</h4>
            <Link href={routes.pricing}>{ui.navPricing}</Link>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setSide("find");
              }}
            >
              {ui.navFind}
            </a>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setSide("hire");
              }}
            >
              {ui.navHire}
            </a>
          </div>

          <div className={styles.ftCol}>
            <h4>{ui.footResources}</h4>
            <Link href={routes.help}>{ui.footHelp}</Link>
            <a href="#">{ui.footPrivacy}</a>
            <a href="#">{ui.footTerms}</a>
          </div>
        </div>

        <div className={styles.ftBottom}>
          <p>{ui.footRights}</p>
          <div className={styles.ftSocial}>
            <a href="mailto:hello@peoplor.com" aria-label="Email">
              <IconMail />
            </a>
            <a
              href={siteConfig.links.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
            >
              <IconTelegram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
