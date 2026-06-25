"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { setPostLoginRedirect } from "@/features/auth/lib/post-login-redirect";
import { useLanding } from "@/features/marketing/context/landing-context";

/**
 * When the proxy bounces a signed-out user to the landing (`/?signin=1&redirect=…`),
 * open the sign-in modal and remember where to return after login, then strip the
 * params from the URL. Mounted inside `LandingProvider` + a Suspense boundary
 * (it reads search params). Renders nothing.
 */
export function SignInIntent() {
  const params = useSearchParams();
  const router = useRouter();
  const { openAuth } = useLanding();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || params.get("signin") !== "1") return;
    handled.current = true;
    setPostLoginRedirect(params.get("redirect"));
    openAuth();
    router.replace("/");
  }, [params, router, openAuth]);

  return null;
}
