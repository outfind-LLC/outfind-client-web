import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names while resolving conflicts.
 * Used by every UI primitive — keep it dependency-light.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
