import { type CSSProperties } from "react";

import { ICONS as REG } from "@/components/icons";
import { cn } from "@/lib/utils";
import s from "@/features/profile/styles/profile.module.css";

/** Profile icon names → central registry entries (glyph data: `@/components/icons`). */
export const ICONS = {
  user: REG.userRound,
  chev: REG.chevronRight,
  cal: REG.calendar,
  globe: REG.globe,
  briefcase: REG.briefcaseAlt,
  dots: REG.dotsHorizontal,
  menu: REG.menuShort,
  back: REG.backThin,
  close: REG.closeThin,
  file: REG.file,
  plus: REG.plusBold,
  eye: REG.eye,
  eyeOff: REG.eyeOff,
  pen: REG.pen,
  copy: REG.copy,
  download: REG.download,
  share: REG.share,
  trash: REG.trash,
  phone: REG.phoneClassicThin,
  mail: REG.mailRound,
  company: REG.companyTallThin,
  print: REG.print,
  check: REG.checkStrong,
  telegram: REG.telegram,
  whatsapp: REG.whatsapp,
} as const;

export type IconName = keyof typeof ICONS;

export function Ic({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={cn(s.ic, className)} style={{ "--i": ICONS[name] } as CSSProperties} aria-hidden="true" />
  );
}
