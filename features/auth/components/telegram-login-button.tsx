"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TelegramIcon } from "@/components/icons/telegram-icon";
import { routes } from "@/config/routes";
import { useTelegramLogin } from "@/features/auth/hooks/use-auth-mutations";
import type { TelegramWidgetPayload } from "@/features/auth/services/auth.service";
import type { RegistrationAccountType } from "@/features/auth/services/auth.service";
import { env } from "@/lib/env";
import { isApiClientError } from "@/lib/api/error";
import { Button } from "@/ui/button";

const TELEGRAM_WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";

/** Minimal typing for the Telegram widget's in-page popup auth API. */
interface TelegramAuthApi {
  Login: {
    auth: (
      options: { bot_id: number; request_access?: string; lang?: string },
      callback: (user: TelegramWidgetPayload | false) => void,
    ) => void;
  };
}

interface TelegramLoginButtonProps {
  accountType: RegistrationAccountType;
  label: string;
}

/**
 * Custom-styled Telegram sign-in button (matches the Google button). Uses the
 * official widget's in-page popup (`Telegram.Login.auth`) so we control the
 * look, then completes via the backend SPA endpoint. Requires the numeric bot
 * id; Telegram also requires a real HTTPS domain registered via BotFather, so
 * this won't complete on localhost.
 */
export function TelegramLoginButton({
  accountType,
  label,
}: TelegramLoginButtonProps) {
  const router = useRouter();
  const telegramLogin = useTelegramLogin();

  const botId = env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
  const enabled = Boolean(env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);

  // Preload the widget script so `window.Telegram.Login.auth` is ready on click.
  useEffect(() => {
    if (!enabled) return;
    if (document.querySelector(`script[src="${TELEGRAM_WIDGET_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = TELEGRAM_WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, [enabled]);

  if (!enabled) return null;

  const onClick = () => {
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
          onSuccess: () => router.replace(routes.chat),
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
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={telegramLogin.isPending}
    >
      <TelegramIcon className="size-5 text-[#229ED9]" />
      {label}
    </Button>
  );
}
