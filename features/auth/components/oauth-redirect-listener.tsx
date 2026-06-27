"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/config/query-keys";
import { routes } from "@/config/routes";
import {
  OAUTH_PARAMS,
  OAUTH_RESULT,
  resolveAuthErrorMessage,
} from "@/features/auth/constants/auth.constants";
import { consumePostLoginRedirect } from "@/features/auth/lib/post-login-redirect";

/**
 * Handles the OAuth return. The backend sets httpOnly cookies, then redirects to
 * the app root with `?google_auth=success|error` (+ `isNewUser` / `code`). This
 * listener — mounted once, globally, inside a Suspense boundary so it never
 * de-opts static pages — surfaces a toast, refreshes the session cache, strips
 * the params, and routes into the app. Real authz still happens server-side.
 */
export function OAuthRedirectListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const handled = useRef(false);

  useEffect(() => {
    const provider = searchParams.get(OAUTH_PARAMS.google)
      ? OAUTH_PARAMS.google
      : searchParams.get(OAUTH_PARAMS.telegram)
        ? OAUTH_PARAMS.telegram
        : null;

    if (!provider || handled.current) return;
    handled.current = true;

    const result = searchParams.get(provider);

    if (result === OAUTH_RESULT.success) {
      toast.success("Signed in successfully");
      queryClient.invalidateQueries({ queryKey: qk.session });
      // Return to the protected route the user was bounced from, else the app.
      router.replace(consumePostLoginRedirect(routes.chat));
      return;
    }

    if (result === OAUTH_RESULT.error) {
      const code = searchParams.get(OAUTH_PARAMS.code);
      toast.error(resolveAuthErrorMessage(code));
      // Auth is modal-first: strip params and reopen the sign-in modal on the
      // landing to retry (the deprecated standalone /auth page is gone).
      router.replace(`${routes.home}?signin=1`);
    }
  }, [searchParams, pathname, router, queryClient]);

  return null;
}
