"use client";

import { useLanding } from "@/features/marketing/context/landing-context";
import { IconJobSearch, IconUsers } from "./icons";
import styles from "./landing.module.css";

/** Segmented "Find a job / Hire talent" product-side toggle. */
export function SideToggle({
  variant = "nav",
}: {
  variant?: "nav" | "mobile";
}) {
  const { side, setSide, copy } = useLanding();
  const className = variant === "mobile" ? styles.mmSeg : styles.seg;

  return (
    <div className={className} role="group" aria-label={copy.ui.navFind}>
      <button
        type="button"
        aria-pressed={side === "find"}
        onClick={() => setSide("find")}
      >
        {variant === "nav" && <IconJobSearch />}
        <span>{copy.ui.navFind}</span>
      </button>
      <button
        type="button"
        aria-pressed={side === "hire"}
        onClick={() => setSide("hire")}
      >
        {variant === "nav" && <IconUsers />}
        <span>{copy.ui.navHire}</span>
      </button>
    </div>
  );
}
