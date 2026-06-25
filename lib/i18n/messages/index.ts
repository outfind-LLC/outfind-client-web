import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

/** All catalogues keyed by locale. */
export const MESSAGES: Record<Locale, Messages> = { en, ru, uz };

export { en };
export type { Messages };
