import { Suspense } from "react";

import { AuthModal } from "@/features/marketing/components/auth-modal";
import { Hero } from "@/features/marketing/components/hero";
import { SignInIntent } from "@/features/marketing/components/sign-in-intent";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";
import { LandingProvider } from "@/features/marketing/context/landing-context";

/** Public landing page — prompt-first hero with the auth gate (Google / Telegram). */
export default function LandingPage() {
  return (
    <LandingProvider>
      {/* Opens the sign-in modal when the proxy bounces a signed-out user here. */}
      <Suspense fallback={null}>
        <SignInIntent />
      </Suspense>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
      <SiteFooter />
      <AuthModal />
    </LandingProvider>
  );
}
