import { AuthModal } from "@/features/marketing/components/auth-modal";
import { Hero } from "@/features/marketing/components/hero";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";
import { LandingProvider } from "@/features/marketing/context/landing-context";

/** Public landing page — prompt-first hero with the auth gate (Google / Telegram). */
export default function LandingPage() {
  return (
    <LandingProvider>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
      <SiteFooter />
      <AuthModal />
    </LandingProvider>
  );
}
