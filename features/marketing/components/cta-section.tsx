import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { routes } from "@/config/routes";
import { Button } from "@/ui/button";

/** Closing call-to-action band before the footer. */
export function CtaSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="from-brand to-brand-2 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_40%)] opacity-20"
            />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
                Your next role is one message away
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/80">
                Join Peoplor free and let AI do the hard parts of your job
                search — or your next hire.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="text-brand bg-white hover:bg-white/90"
                >
                  <Link href={routes.signup}>
                    Get started free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
