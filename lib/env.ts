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
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${parsed.error
      .issues.map((i) => ` - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

export const env = parsed.data;
export type ClientEnv = typeof env;
