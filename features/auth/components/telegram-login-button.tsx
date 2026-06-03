"use client";

import { useEffect, useRef } from "react";

import { env } from "@/lib/env";
import { authService } from "@/features/auth/services/auth.service";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";

const TELEGRAM_WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";

interface TelegramLoginButtonProps {
  accountType: RegistrationAccountType;
}

/**
 * Telegram Login Widget (redirect flow). The widget script injects an iframe
 * button; on authorisation Telegram redirects to the backend callback (carrying
 * the signed payload + `accountType`), which validates the HMAC, sets cookies,
 * and redirects back to the app. Re-injected when the selected role changes so
 * the callback URL always carries the current `accountType`.
 *
 * Renders nothing when no bot username is configured (Telegram disabled).
 */
export function TelegramLoginButton({ accountType }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botUsername = env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !botUsername) return;

    container.replaceChildren();

    const script = document.createElement("script");
    script.src = TELEGRAM_WIDGET_SRC;
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-request-access", "write");
    script.setAttribute(
      "data-auth-url",
      authService.telegramCallbackUrl(accountType),
    );

    container.appendChild(script);

    return () => container.replaceChildren();
  }, [accountType, botUsername]);

  if (!botUsername) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
