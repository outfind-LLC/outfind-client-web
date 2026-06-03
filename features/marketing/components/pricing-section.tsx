"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { routes } from "@/config/routes";
import {
  EMPLOYER_PRICING,
  WORKER_PRICING,
  type PricingTier,
} from "@/features/marketing/constants/landing";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

/**
 * Pricing preview. Marketing copy only — the authoritative plan catalog and
 * per-feature limits come from the backend (`/plans`) on the in-app pricing page.
 */
export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-border/60 bg-muted/30 scroll-mt-20 border-t py-16 sm:py-24"
    >
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            Start free. Upgrade when Jobsterr is doing the heavy lifting for
            you.
          </p>
        </Reveal>

        <Tabs defaultValue="workers" className="mt-10 items-center">
          <TabsList className="mb-10">
            <TabsTrigger value="workers" className="px-6">
              For workers
            </TabsTrigger>
            <TabsTrigger value="employers" className="px-6">
              For employers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workers" className="w-full">
            <PricingGrid tiers={WORKER_PRICING} />
          </TabsContent>
          <TabsContent value="employers" className="w-full">
            <PricingGrid tiers={EMPLOYER_PRICING} />
          </TabsContent>
        </Tabs>
      </Container>
    </section>
  );
}

function PricingGrid({ tiers }: { tiers: PricingTier[] }) {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-3">
      {tiers.map((tier, index) => (
        <Reveal key={tier.name} delay={index * 70} className="h-full">
          <div
            className={cn(
              "bg-card flex h-full flex-col rounded-2xl border p-6 transition-all",
              tier.featured
                ? "border-primary shadow-primary/10 ring-primary/20 shadow-xl ring-1"
                : "border-border/60 hover:border-primary/30 hover:shadow-md",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              {tier.featured ? (
                <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Popular
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">
                {tier.price}
              </span>
              {tier.cadence ? (
                <span className="text-muted-foreground text-sm">
                  {tier.cadence}
                </span>
              ) : null}
            </div>

            <p className="text-muted-foreground mt-2 text-sm">
              {tier.description}
            </p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  <span className="text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-8 w-full"
              variant={tier.featured ? "brand" : "outline"}
            >
              <Link href={routes.auth}>{tier.cta}</Link>
            </Button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
