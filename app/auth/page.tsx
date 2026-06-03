import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Jobsterr to start your AI-powered job search.",
};

const HIGHLIGHTS = [
  "Search and apply to jobs inside one conversation",
  "Build a recruiter-ready CV in minutes",
  "Prep for interviews with instant, specific feedback",
];

/**
 * Sign-in page. The proxy lets cookie-bearing users reach this page; the real
 * authz check happens here — a valid session is bounced into the app, an
 * invalid/expired one falls through to the form (no redirect loop).
 * `?mode=signup` opens the form on the sign-up (role-selection) view.
 */
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await getServerSession();
  if (session) {
    redirect(routes.chat);
  }

  const { mode } = await searchParams;
  const initialMode = mode === "signup" ? "signup" : "signin";

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="from-brand to-brand-2 relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_60%,white,transparent_40%)] opacity-30"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Image
              src="/Jobsterr-icon-logo.svg"
              alt=""
              width={22}
              height={22}
              className="size-[22px]"
            />
          </span>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
        </div>

        <div className="relative max-w-md space-y-7">
          <h2 className="text-3xl leading-tight font-semibold text-balance">
            Your job search, finally as simple as a conversation.
          </h2>
          <ul className="space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-3" />
                </span>
                <span className="text-white/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          Built for Central Asia, the Middle East &amp; Europe.
        </p>
      </aside>

      {/* Auth panel */}
      <section className="relative flex flex-col items-center justify-center px-6 py-10 sm:px-10">
        <Link
          href={routes.home}
          className="text-muted-foreground hover:text-foreground absolute top-5 left-5 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>

        <SignInCard initialMode={initialMode} />
      </section>
    </main>
  );
}
