import { type CSSProperties } from "react";

import { ICONS as REG } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { CareerIconName } from "@/features/career/data/career.fixtures";
import s from "@/features/career/styles/career.module.css";

/** Career icon names → central registry entries (glyph data: `@/components/icons`). */
export const ICONS: Record<CareerIconName, string> = {
  menu: REG.menuShort,
  check: REG.check,
  arrow: REG.arrowRight,
  cv: REG.docLines,
  doc: REG.docPlain,
  badge: REG.sealCheck,
  spark: REG.sparkle,
};

export function Ic({ name, className }: { name: CareerIconName; className?: string }) {
  return (
    <span
      className={cn(s.ic, className)}
      style={{ "--i": ICONS[name] } as CSSProperties}
      aria-hidden="true"
    />
  );
}
