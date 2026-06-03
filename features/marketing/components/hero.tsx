import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { routes } from "@/config/routes";
import { REGIONS } from "@/features/marketing/constants/landing";
import { Button } from "@/ui/button";
import { ChatPreview } from "./chat-preview";

/** Above-the-fold hero: value proposition, primary CTAs, and a live chat demo. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand/10 absolute -top-40 left-1/4 size-[36rem] rounded-full blur-3xl" />
        <div className="bg-brand-accent/10 absolute -top-24 right-1/4 size-[32rem] rounded-full blur-3xl" />
      </div>

      <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <span className="border-border/70 bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="text-brand-accent size-3.5" />
              The AI-first job platform
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Your job search, finally as simple as a{" "}
              <span className="from-brand to-brand-2 bg-gradient-to-r bg-clip-text text-transparent">
                conversation
              </span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Search jobs, build your CV, prep for interviews, and get hired —
              all by chatting with AI specialists built for Central Asia, the
              Middle East, and Europe.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="brand">
                <Link href={routes.auth}>
                  Start for free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="text-foreground font-medium">Built for</span>
              {REGIONS.map((region) => (
                <span key={region} className="inline-flex items-center gap-1.5">
                  <span className="bg-brand-accent size-1.5 rounded-full" />
                  {region}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:pl-6">
          <ChatPreview />
        </Reveal>
      </Container>
    </section>
  );
}
