/**
 * Type-safe key lookup + interpolation over the message catalogues.
 *
 * `MessageKey` is the union of every valid `"namespace.key"` path, derived from
 * the canonical `Messages` shape — so `t("nav.careerMigration")` is checked at
 * compile time and a typo won't build. `translate` resolves the key for the
 * active locale, falls back to English then to the raw key, and interpolates
 * `{name}` placeholders.
 */
import { en, type Messages } from "./messages/en";

/** Union of all `"namespace.key"` paths in the catalogue (one level of nesting). */
export type MessageKey = {
  [N in keyof Messages]: `${N & string}.${keyof Messages[N] & string}`;
}[keyof Messages];

type Params = Record<string, string | number>;

function lookup(messages: Messages, key: MessageKey): string | undefined {
  const [namespace, leaf] = key.split(".") as [keyof Messages, string];
  const group = messages[namespace] as Record<string, string> | undefined;
  return group?.[leaf];
}

export function translate(
  messages: Messages,
  key: MessageKey,
  params?: Params,
): string {
  // active locale → English fallback → the raw key (never throws / blanks out).
  const value = lookup(messages, key) ?? lookup(en, key) ?? key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}
