import type { Metadata } from "next";

import { AuthModal } from "@/features/marketing/components/auth-modal";
import { PricingView } from "@/features/marketing/components/pricing-view";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { LandingProvider } from "@/features/marketing/context/landing-context";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for job seekers and employers — start free on both sides.",
};

/** Public pricing page. The prototype hides the nav here and shows a back arrow. */
export default function PricingPage() {
  return (
    <LandingProvider>
      <main className="flex-1">
        <PricingView />
      </main>
      <SiteFooter />
      <AuthModal />
    </LandingProvider>
  );
}
