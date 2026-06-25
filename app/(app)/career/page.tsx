"use client";

import { useSession } from "@/features/auth/hooks/use-session";
import { useT } from "@/providers/i18n-provider";

/**
 * Career & migration (worker) / Global hiring (employer).
 *
 * Placeholder while the full screen is built next — it keeps the new sidebar
 * destination reachable (no 404) and already shows the correct, localised title
 * for the account type. See `docs/screens/05-career-and-global-hiring.md`.
 */
export default function CareerPage() {
  const { isEmployer } = useSession();
  const t = useT();
  const title = isEmployer ? t("nav.globalHiring") : t("nav.careerMigration");

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
        {t("common.comingSoon")}
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
