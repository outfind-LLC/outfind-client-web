import type { Metadata } from "next";

import { AuthModal } from "@/features/marketing/components/auth-modal";
import { FaqView } from "@/features/marketing/components/faq-view";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { LandingProvider } from "@/features/marketing/context/landing-context";

export const metadata: Metadata = {
  title: "Help center",
  description: "Answers to common questions about Peoplor for job seekers and employers.",
};

/** Public help center / FAQ. The prototype hides the nav here and shows a back arrow. */
export default function FaqPage() {
  return (
    <LandingProvider>
      <main className="flex-1">
        <FaqView />
      </main>
      <SiteFooter />
      <AuthModal />
    </LandingProvider>
  );
}
