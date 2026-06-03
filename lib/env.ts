import { z } from "zod";

/**
 * Public (browser-exposed) environment.
 * Only `NEXT_PUBLIC_*` keys are inlined into the client bundle, so every value
 * here is safe to ship. Validated once at module load — a misconfigured deploy
 * fails fast instead of erroring deep inside a fetch.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),
  // Numeric bot id (the part before ":" in the bot token) — required for the
  // in-page Telegram popup login. Optional; Telegram is hidden without it.
  NEXT_PUBLIC_TELEGRAM_BOT_ID: z.coerce.number().int().positive().optional(),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  // Treat an empty string (unset-but-present in .env) as absent so the optional
  // check passes instead of failing the `min(1)` rule.
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || undefined,
  NEXT_PUBLIC_TELEGRAM_BOT_ID:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${parsed.error.issues
      .map((i) => ` - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

export const env = parsed.data;
export type ClientEnv = typeof env;
