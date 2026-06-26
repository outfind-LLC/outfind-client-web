/**
 * Central icon registry — import from here.
 *   import { Icon } from "@/components/icons";
 *   <Icon name="bookmark" />
 * Or grab the raw mask url for the prototype's `.ic` spans:
 *   import { ICONS } from "@/components/icons";
 *   <span className={s.ic} style={{ "--i": ICONS.bookmark }} />
 */
export { Icon } from "./icon";
export { ICONS, type IconName } from "./registry";
export type { IconDef } from "./types";
