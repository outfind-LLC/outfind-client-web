import { Quote } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { TESTIMONIALS } from "@/features/marketing/constants/landing";

/** Social proof — short quotes from workers and employers. */
export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            People are getting hired
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            Real momentum across the region — from first job to next move.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 80}>
              <figure className="border-border/60 bg-card flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-sm">
                <Quote className="text-brand-accent size-7" />
                <blockquote className="text-foreground/90 flex-1 leading-relaxed text-pretty">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="border-border/60 border-t pt-4">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
