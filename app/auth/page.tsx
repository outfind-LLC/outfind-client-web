import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Jobsterr to start your AI-powered job search.",
};

/**
 * Sign-in page. The proxy already keeps signed-in users out, but we verify the
 * session server-side too (the real authz boundary) and bounce to the app — a
 * present-but-expired cookie can slip past the proxy's presence check.
 */
export default async function AuthPage() {
  const session = await getServerSession();
  if (session) {
    redirect(routes.chat);
  }

  return (
    <main className="bg-muted/30 relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md">
        <SignInCard />
      </div>
    </main>
  );
}
