"use client";

import { useState } from "react";

import { useLanding } from "@/features/marketing/context/landing-context";
import {
  IconDocCheck,
  IconFileText,
  IconMic,
  IconSearch,
  IconSend,
  IconZap,
} from "./icons";
import { PeoplorMark } from "./peoplor-mark";
import styles from "./landing.module.css";

/**
 * Prompt-first hero — animated brand mark + headline + chat-style composer +
 * suggestion chips + safety line. Submitting (or tapping a chip) seeds the query
 * and opens the auth modal, exactly like the prototype.
 */
export function Hero() {
  const { copy, side, openAuth } = useLanding();
  const sideCopy = copy[side];
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    openAuth(trimmed);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroHead}>
          <PeoplorMark variant="mono" animated className={styles.heroMark} />
          <h1 className={styles.heroH1}>{sideCopy.h1}</h1>
        </div>

        <form
          className={styles.composer}
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            submit(value);
          }}
        >
          <input
            type="text"
            value={value}
            placeholder={sideCopy.ph}
            aria-label={sideCopy.ph}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="button" className={styles.mic} aria-label="Use voice">
            <IconMic />
          </button>
          <button
            type="submit"
            className={styles.send}
            aria-label="Send"
            disabled={!value.trim()}
          >
            <IconSend />
          </button>
        </form>

        {side === "find" ? (
          // Mode chips mirroring the in-app /jobs landing (CV / AI / Search /
          // Visa). Tapping one opens sign-up — the modes live behind auth.
          <div className={styles.chips}>
            {[
              { label: copy.ui.modeCv, Icon: IconFileText },
              { label: copy.ui.modeAssist, Icon: IconZap },
              { label: copy.ui.modeSearch, Icon: IconSearch },
              { label: copy.ui.modeVisa, Icon: IconDocCheck },
            ].map(({ label, Icon }, index) => (
              <button
                key={label}
                type="button"
                className={styles.chip}
                style={{ "--d": index + 1 } as React.CSSProperties}
                onClick={() => openAuth()}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.chips}>
            {sideCopy.chips.map((chip, index) => (
              <button
                key={chip}
                type="button"
                className={styles.chip}
                style={{ "--d": index + 1 } as React.CSSProperties}
                onClick={() => submit(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className={styles.heroSafety}>{sideCopy.safety}</p>
    </section>
  );
}
