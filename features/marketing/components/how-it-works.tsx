import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { HOW_IT_WORKS } from "@/features/marketing/constants/landing";

/** Three-step explainer of the product flow. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Get going in under a minute
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            No forms, no filters, no friction. Just start talking.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => (
            <Reveal key={step.title} delay={index * 80}>
              <li className="relative flex flex-col gap-3">
                <span className="from-brand to-brand-2 shadow-primary/20 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
