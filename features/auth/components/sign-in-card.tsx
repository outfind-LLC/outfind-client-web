"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { GoogleIcon } from "@/components/icons/google-icon";
import { siteConfig } from "@/config/site";
import { authService } from "@/features/auth/services/auth.service";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";
import { ACCOUNT_TYPE } from "@/interfaces/enums";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Separator } from "@/ui/separator";
import { RoleToggle } from "./role-toggle";
import { TelegramLoginButton } from "./telegram-login-button";

/**
 * Sign-in / sign-up card. The flow is one-shot: pick a role, then continue with
 * Google or Telegram. Google is a full-page redirect to the backend OAuth start
 * (which round-trips back with httpOnly cookies); Telegram uses its widget.
 */
export function SignInCard() {
  const [role, setRole] = useState<RegistrationAccountType>(
    ACCOUNT_TYPE.WORKER,
  );
  const [redirecting, setRedirecting] = useState(false);

  const continueWithGoogle = () => {
    setRedirecting(true);
    window.location.href = authService.googleAuthUrl(role);
  };

  return (
    <Card className="border-border/60 w-full max-w-md shadow-xl">
      <CardHeader className="items-center text-center">
        <Link href="/" className="mb-2">
          <Image
            src="/full-logo.svg"
            alt={siteConfig.name}
            width={132}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <CardTitle className="text-2xl">Welcome to {siteConfig.name}</CardTitle>
        <CardDescription>
          Your AI career partner. Sign in to start the conversation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">I want to</p>
          <RoleToggle value={role} onChange={setRole} />
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={continueWithGoogle}
            disabled={redirecting}
          >
            <GoogleIcon className="size-5" />
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
              or
            </span>
          </div>

          <TelegramLoginButton accountType={role} />
        </div>

        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
