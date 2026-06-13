import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { SPECIALISTS } from "@/features/marketing/constants/landing";
import { Badge } from "@/ui/badge";

/** Showcase of the AI specialists that power each task in the chat. */
export function SpecialistsSection() {
  return (
    <section
      id="specialists"
      className="border-border/60 bg-muted/30 scroll-mt-20 border-y py-16 sm:py-24"
    >
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            A team of AI specialists
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            Each one is an expert at a single job. Peoplor picks the right one
            for whatever you ask — you never have to.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALISTS.map((specialist, index) => (
            <Reveal key={specialist.name} delay={index * 50}>
              <div className="border-border/60 bg-card hover:border-primary/40 flex h-full flex-col gap-2 rounded-xl border p-5 transition-all hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{specialist.name}</h3>
                  <Badge
                    variant={
                      specialist.audience === "Workers" ? "brand" : "secondary"
                    }
                  >
                    {specialist.audience}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {specialist.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
