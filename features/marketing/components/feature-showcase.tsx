"use client";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import {
  EMPLOYER_FEATURES,
  WORKER_FEATURES,
  type FeatureItem,
} from "@/features/marketing/constants/landing";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

/** Feature grid with a worker / employer audience switch. */
export function FeatureShowcase() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            One conversation. Everything you need.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            Whether you&apos;re looking for work or hiring, Jobsterr brings the
            right AI specialist into the chat.
          </p>
        </Reveal>

        <Tabs defaultValue="workers" className="mt-10 items-center">
          <TabsList className="mb-8">
            <TabsTrigger value="workers" className="px-6">
              For workers
            </TabsTrigger>
            <TabsTrigger value="employers" className="px-6">
              For employers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workers" className="w-full">
            <FeatureGrid items={WORKER_FEATURES} />
          </TabsContent>
          <TabsContent value="employers" className="w-full">
            <FeatureGrid items={EMPLOYER_FEATURES} />
          </TabsContent>
        </Tabs>
      </Container>
    </section>
  );
}

function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Reveal key={feature.title} delay={index * 60}>
            <Card className="border-border/60 hover:border-primary/40 h-full transition-all hover:shadow-lg">
              <CardHeader>
                <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
