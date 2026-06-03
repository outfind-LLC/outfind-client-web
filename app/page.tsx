import { CtaSection } from "@/features/marketing/components/cta-section";
import { FeatureShowcase } from "@/features/marketing/components/feature-showcase";
import { Hero } from "@/features/marketing/components/hero";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";
import { SpecialistsSection } from "@/features/marketing/components/specialists-section";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";

/** Public landing page (statically rendered). */
export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureShowcase />
        <SpecialistsSection />
        <HowItWorks />
        <PricingSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
