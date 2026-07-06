"use client";

import { Banknote, Globe, Loader2 } from "lucide-react";

import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/**
 * Payment-method chooser shown on the Standard upgrade card. Two rails:
 *  • International card → routes to the Polar-hosted checkout (active).
 *  • Local payment (UZS · Click) → "Coming soon" until the Click gateway lands.
 * The account is upgraded to Standard server-side by the Polar `order.paid`
 * webhook, so this component only needs to kick off the international checkout.
 */
export function PaymentMethods({
  onInternational,
  isPending,
}: {
  onInternational: () => void;
  isPending: boolean;
}) {
  const t = useT();

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {t("pay.chooseMethod")}
      </p>

      {/* International — active, routes to Polar */}
      <button
        type="button"
        onClick={onInternational}
        disabled={isPending}
        className={cn(
          "border-primary/60 hover:border-primary hover:bg-primary/5",
          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
          "focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Globe className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {t("pay.intlTitle")}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {t("pay.intlDesc")}
          </span>
        </span>
        <span className="text-primary flex items-center gap-1 text-xs font-semibold">
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            t("pay.intlCta")
          )}
        </span>
      </button>

      {/* Local — coming soon, disabled */}
      <div
        aria-disabled="true"
        className="border-border/70 flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-dashed p-3 text-left opacity-70"
      >
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Banknote className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {t("pay.localTitle")}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {t("pay.localDesc")}
          </span>
        </span>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          {t("pay.comingSoon")}
        </span>
      </div>
    </div>
  );
}
