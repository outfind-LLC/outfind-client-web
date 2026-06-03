"use client";

import { useState } from "react";

import { GoogleIcon } from "@/components/icons/google-icon";
import { BrandLogo } from "@/components/brand-logo";
import { authService } from "@/features/auth/services/auth.service";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import { RoleToggle } from "./role-toggle";
import { TelegramLoginButton } from "./telegram-login-button";

type Mode = "signin" | "signup";

/**
 * Auth form with two modes:
 *  - Sign in  → just "Continue with Google / Telegram" (existing accounts).
 *  - Sign up  → choose Worker or Employer first, then continue.
 *
 * The backend OAuth start always needs an `accountType`, but it only applies it
 * to brand-new accounts (an existing user's role is never overwritten), so the
 * sign-in path safely passes a default role.
 */
export function SignInCard({ initialMode = "signin" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<RegistrationAccountType>(
    ACCOUNT_TYPE.WORKER,
  );
  const [redirecting, setRedirecting] = useState(false);

  const isSignup = mode === "signup";
  const effectiveRole = isSignup ? role : ACCOUNT_TYPE.WORKER;

  const continueWithGoogle = () => {
    setRedirecting(true);
    window.location.href = authService.googleAuthUrl(effectiveRole);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center lg:hidden">
        <BrandLogo href="/" className="h-9" />
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignup
            ? "Choose what you're here for, then continue."
            : "Sign in to pick up where you left off."}
        </p>
      </div>

      {isSignup ? (
        <div className="mt-6 space-y-2.5">
          <p className="text-muted-foreground text-xs font-medium">I want to</p>
          <RoleToggle value={role} onChange={setRole} />
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full justify-center gap-3"
          onClick={continueWithGoogle}
          disabled={redirecting}
        >
          <GoogleIcon className="size-5" />
          {isSignup ? "Sign up with Google" : "Sign in with Google"}
        </Button>

        <TelegramLoginButton
          accountType={effectiveRole}
          label={isSignup ? "Sign up with Telegram" : "Sign in with Telegram"}
        />
      </div>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        {isSignup ? "Already have an account?" : "New to Jobsterr?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
