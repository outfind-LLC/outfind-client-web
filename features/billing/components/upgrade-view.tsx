"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { useSession } from "@/features/auth/hooks/use-session";
import { useCheckout, usePaygCheckout } from "@/features/billing/hooks/use-billing";
import { useMyPlan } from "@/features/billing/hooks/use-my-plan";
import { usePublicPricing } from "@/features/billing/hooks/use-pricing";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { isApiClientError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { PaygGrantType } from "@/interfaces/billing.interface";
import type { PublicPlan } from "@/interfaces/plan.interface";
import { ACCOUNT_TYPE, PLAN_AUDIENCE } from "@/interfaces/enums";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

type BillingInterval = "month" | "year";

/**
 * Yearly pricing isn't finalized yet, so only monthly plans are shown. The
 * interval toggle and yearly checkout logic stay in place — flip this to `true`
 * (once plans carry real yearly prices) to re-enable them with no other changes.
 */
const SHOW_YEARLY_BILLING = false;

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
  // Forced to monthly until yearly is enabled; keeps the rest of the UI generic.
  const interval: BillingInterval = SHOW_YEARLY_BILLING
    ? billingInterval
    : "month";
  const checkout = useCheckout();
  const { plan: currentPlan } = useMyPlan();
  const queryClient = useQueryClient();

  // Returning from a successful Polar checkout (POLAR_SUCCESS_URL →
  // /upgrade?checkout=success): confirm it, refresh the plan/usage, and clean
  // the URL so a refresh doesn't re-toast.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    toast.success("Payment successful — your plan is being updated.");
    void queryClient.invalidateQueries({ queryKey: qk.myEntitlements });
    void queryClient.invalidateQueries({ queryKey: qk.subscription });
    // Model access is computed per-plan server-side — refetch so newly unlocked
    // models stop showing as locked.
    void queryClient.invalidateQueries({ queryKey: qk.aiModels() });

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState({}, "", url.toString());
  }, [queryClient]);

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
        icon={Zap}
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
      { planCode: plan.code, interval },
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
        {SHOW_YEARLY_BILLING ? (
          <IntervalToggle
            value={billingInterval}
            onChange={setBillingInterval}
          />
        ) : null}
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.planType === currentPlan?.planType;
          const isUpgrade = plan.priceMonthlyCents > currentPrice;
          const price =
            interval === "month"
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
                    /{interval === "month" ? "mo" : "yr"}
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

      {audience === PLAN_AUDIENCE.EMPLOYER ? <PaygSection /> : null}
    </div>
  );
}

const PAYG_OPTIONS: {
  grantType: PaygGrantType;
  title: string;
  price: string;
  window: string;
  blurb: string;
}[] = [
  {
    grantType: "WEEKLY_JOB",
    title: "Weekly job slot",
    price: "$1",
    window: "7 days",
    blurb: "Post one vacancy and unlock the AI hiring tools for a week.",
  },
  {
    grantType: "MONTHLY_JOB",
    title: "Monthly job slot",
    price: "$3",
    window: "30 days",
    blurb: "Post one vacancy and unlock the AI hiring tools for a month.",
  },
];

/** One-time vacancy slots for employers who don't want a subscription. */
function PaygSection() {
  const payg = usePaygCheckout();

  const buy = (grantType: PaygGrantType) =>
    payg.mutate(
      { grantType },
      {
        onError: (error) =>
          toast.error(
            isApiClientError(error)
              ? error.message
              : "Couldn't start checkout. Please try again.",
          ),
      },
    );

  return (
    <div className="border-border/60 space-y-4 border-t pt-8">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Zap className="text-brand size-4" />
          Pay as you go
        </h2>
        <p className="text-muted-foreground text-sm">
          No subscription — buy a single time-boxed vacancy slot.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {PAYG_OPTIONS.map((option) => (
          <div
            key={option.grantType}
            className="bg-card border-border/60 flex flex-col rounded-2xl border p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{option.title}</h3>
              <span className="text-2xl font-bold tracking-tight">
                {option.price}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {option.window} access
            </p>
            <p className="text-foreground/90 mt-3 flex-1 text-sm">
              {option.blurb}
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => buy(option.grantType)}
              disabled={payg.isPending}
            >
              Buy slot
            </Button>
          </div>
        ))}
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
