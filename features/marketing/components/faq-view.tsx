"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { routes } from "@/config/routes";
import { useLanding } from "@/features/marketing/context/landing-context";
import { FAQ_DATA, type FaqItem } from "@/features/marketing/i18n/faq-data";
import { IconArrowLeft, IconChevronRight } from "./icons";
import styles from "./landing.module.css";

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.qa} data-open={open}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.qaQ}>{item.q}</span>
        <IconChevronRight className={styles.chev} />
      </button>
      <div
        className={styles.ans}
        // Measure-to-animate: reading scrollHeight here is intentional and safe —
        // toggling `open` re-renders this row, so the height is always current.
        // eslint-disable-next-line react-hooks/refs
        style={{ maxHeight: open ? (innerRef.current?.scrollHeight ?? 0) : 0 }}
      >
        <div ref={innerRef}>
          <p>{item.a}</p>
        </div>
      </div>
    </div>
  );
}

/** Help center — the prototype's "Questions, answered" FAQ accordion. */
export function FaqView() {
  const { copy, lang } = useLanding();

  return (
    <section className={styles.secPad}>
      <div className={styles.wrap}>
        <Link href={routes.home} className={styles.pageBack} aria-label="Go back">
          <IconArrowLeft />
        </Link>

        <div className={styles.secHead}>
          <h2>{copy.ui.faqH2}</h2>
        </div>

        <div className={styles.faq}>
          {FAQ_DATA[lang].map((item) => (
            <FaqRow key={item.q} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
