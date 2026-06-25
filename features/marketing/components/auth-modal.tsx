"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/icons/google-icon";
import { TelegramIcon } from "@/components/icons/telegram-icon";
import { authService } from "@/features/auth/services/auth.service";
import type { TelegramWidgetPayload } from "@/features/auth/services/auth.service";
import { consumePostLoginRedirect } from "@/features/auth/lib/post-login-redirect";
import { useTelegramLogin } from "@/features/auth/hooks/use-auth-mutations";
import { useLanding } from "@/features/marketing/context/landing-context";
import { routes } from "@/config/routes";
import { env } from "@/lib/env";
import { isApiClientError } from "@/lib/api/error";
import { IconClose, IconSearch } from "./icons";
import { PeoplorMark } from "./peoplor-mark";
import styles from "./landing.module.css";

const TELEGRAM_WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";

interface TelegramAuthApi {
  Login: {
    auth: (
      options: { bot_id: number; request_access?: string; lang?: string },
      callback: (user: TelegramWidgetPayload | false) => void,
    ) => void;
  };
}

/**
 * Auth modal (social-only: Google + Telegram). Opened from the hero/nav via the
 * landing context. Google is a full-page OAuth redirect; Telegram uses the
 * official widget's in-page popup, then completes through the backend SPA login.
 */
export function AuthModal() {
  const { authOpen, authPrompt, closeAuth, accountType, copy } = useLanding();
  const ui = copy.ui;
  const router = useRouter();
  const telegramLogin = useTelegramLogin();

  const botId = env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

  // Preload the Telegram widget so `window.Telegram.Login.auth` is ready.
  useEffect(() => {
    if (document.querySelector(`script[src="${TELEGRAM_WIDGET_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = TELEGRAM_WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Close on Escape while open.
  useEffect(() => {
    if (!authOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeAuth();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authOpen, closeAuth]);

  const onTelegram = () => {
    const telegram = (window as unknown as { Telegram?: TelegramAuthApi })
      .Telegram;
    if (!botId || !telegram?.Login) {
      toast.error(
        "Telegram sign-in needs a configured bot id and a registered domain.",
      );
      return;
    }
    telegram.Login.auth({ bot_id: botId, request_access: "write" }, (user) => {
      if (!user) return; // popup dismissed
      telegramLogin.mutate(
        { payload: user, accountType },
        {
          onSuccess: () => router.replace(consumePostLoginRedirect(routes.chat)),
          onError: (error) =>
            toast.error(
              isApiClientError(error)
                ? error.message
                : "Telegram sign-in failed",
            ),
        },
      );
    });
  };

  return (
    <div
      className={styles.authOverlay}
      data-open={authOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <div
        className={styles.authModal}
        role="dialog"
        aria-modal="true"
        aria-label={ui.authTitle}
      >
        <button
          type="button"
          className={styles.authClose}
          aria-label="Close"
          onClick={closeAuth}
        >
          <IconClose />
        </button>

        <span className={styles.authMark}>
          <PeoplorMark />
        </span>

        <h3 className={styles.authTitle}>{ui.authTitle}</h3>
        <p className={styles.authSub}>{ui.authSub}</p>

        {authPrompt ? (
          <div className={styles.authPrompt}>
            <IconSearch />
            <span>&ldquo;{authPrompt}&rdquo;</span>
          </div>
        ) : null}

        <div className={styles.authActions}>
          <a
            className={styles.authSso}
            href={authService.googleAuthUrl(accountType)}
          >
            <GoogleIcon />
            {ui.authGoogle}
          </a>
          <button
            type="button"
            className={styles.authSso}
            onClick={onTelegram}
            disabled={telegramLogin.isPending}
          >
            <TelegramIcon className="text-[#229ED9]" />
            {ui.authTelegram}
          </button>
        </div>

        <p
          className={styles.authFine}
          // Localised legal copy contains Terms / Privacy anchors.
          dangerouslySetInnerHTML={{ __html: ui.authFine }}
        />
      </div>
    </div>
  );
}
