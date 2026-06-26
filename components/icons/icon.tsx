import { type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { ICONS, type IconName } from "./registry";
import styles from "./icon.module.css";

/**
 * The single mask-icon component. Renders a `<span>` whose background is masked
 * by the named glyph, so it inherits `currentColor` and scales with font-size.
 * Pass `className` to override size/colour; pass `title` to expose an accessible
 * label (otherwise it's decorative / `aria-hidden`).
 */
export function Icon({
  name,
  className,
  title,
}: {
  name: IconName;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(styles.ic, className)}
      style={{ "--i": ICONS[name] } as CSSProperties}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      title={title}
    />
  );
}
