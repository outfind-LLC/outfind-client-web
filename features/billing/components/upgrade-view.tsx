"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/features/auth/hooks/use-session";
import { useCheckout } from "@/features/billing/hooks/use-billing";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import { usePublicPricing } from "@/features/billing/hooks/use-pricing";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { PublicPlan } from "@/interfaces/plan.interface";
import { ACCOUNT_TYPE, PLAN_AUDIENCE } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

type BillingInterval = "month" | "year";

function formatPrice(cents: number): string {
  if (cents <= 0) return "Free";
  const value = cents / 100;
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

/** In-app upgrade screen: the caller's audience plans, current one marked, with
 * checkout for higher tiers. Plans come live from `/plans`. */
export function UpgradeView() {
  const { user } = useSession();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const checkout = useCheckout();
  const { plan: currentPlan } = useMyPlan();

  const audience =
    user?.accountType === ACCOUNT_TYPE.EMPLOYER
      ? PLAN_AUDIENCE.EMPLOYER
      : PLAN_AUDIENCE.WORKER;
  const { data, isLoading, isError } = usePublicPricing(audience);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-96 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Plans aren't available yet"
        description="Upgrade options will appear here as soon as billing is set up."
      />
    );
  }

  const plans = [...data].sort(
    (a, b) => a.priceMonthlyCents - b.priceMonthlyCents,
  );
  const currentPrice =
    plans.find((plan) => plan.planType === currentPlan?.planType)
      ?.priceMonthlyCents ?? 0;

  const startCheckout = (plan: PublicPlan) => {
    checkout.mutate(
      { planCode: plan.code, interval: billingInterval },
      {
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't start checkout. Please try again.",
          ),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          You&apos;re on the{" "}
          <span className="text-foreground font-medium">
            {currentPlan?.name ?? "Free"}
          </span>{" "}
          plan.
        </p>
        <IntervalToggle value={billingInterval} onChange={setBillingInterval} />
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.planType === currentPlan?.planType;
          const isUpgrade = plan.priceMonthlyCents > currentPrice;
          const price =
            billingInterval === "month"
              ? plan.priceMonthlyCents
              : plan.priceYearlyCents;

          return (
            <article
              key={plan.code}
              className={cn(
                "bg-card flex h-full flex-col rounded-2xl border p-6",
                isCurrent
                  ? "border-primary ring-primary/20 ring-1"
                  : plan.isFeatured
                    ? "border-primary/60 shadow-primary/5 shadow-lg"
                    : "border-border/60",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {isCurrent ? (
                  <Badge variant="secondary">Current</Badge>
                ) : plan.isFeatured ? (
                  <Badge variant="brand">Popular</Badge>
                ) : null}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {formatPrice(price)}
                </span>
                {price > 0 ? (
                  <span className="text-muted-foreground text-sm">
                    /{billingInterval === "month" ? "mo" : "yr"}
                  </span>
                ) : null}
              </div>

              {plan.tagline || plan.description ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {plan.tagline ?? plan.description}
                </p>
              ) : null}

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features
                  .filter((feature) => feature.included)
                  .map((feature) => (
                    <li
                      key={feature.key}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Check className="text-success mt-0.5 size-4 shrink-0" />
                      <span className="text-foreground/90">
                        {feature.name}
                        {feature.value &&
                        feature.value !== "—" &&
                        feature.value.toLowerCase() !== "included" ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {feature.value}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="mt-8">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    variant={plan.isFeatured ? "brand" : "default"}
                    className="w-full"
                    onClick={() => startCheckout(plan)}
                    disabled={checkout.isPending}
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" disabled>
                    Included
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function IntervalToggle({
  value,
  onChange,
}: {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
}) {
  const options: { value: BillingInterval; label: string }[] = [
    { value: "month", label: "Monthly" },
    { value: "year", label: "Yearly" },
  ];
  return (
    <div className="border-border/60 inline-flex gap-1 rounded-lg border p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
