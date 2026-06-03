"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { qk } from "@/config/query-keys";
import { routes } from "@/config/routes";
import {
  authService,
  type RegistrationAccountType,
  type TelegramWidgetPayload,
} from "@/features/auth/services/auth.service";
import type { SessionUser } from "@/interfaces/auth.interface";

/**
 * Auth mutations. Each one resets the relevant server-state caches so the UI
 * reflects the new session immediately — logout clears everything, account
 * switches re-seed the session and drop audience-scoped chat/plan data.
 */

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.replace(routes.auth);
    },
  });
}

export function useTelegramLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      payload: TelegramWidgetPayload;
      accountType: RegistrationAccountType;
    }) => authService.loginWithTelegram(vars.payload, vars.accountType),
    onSuccess: (result) => {
      // TelegramLoginResult extends SessionUser; the extra token/isNewUser
      // fields are harmless in the session cache.
      queryClient.setQueryData<SessionUser>(qk.session, result);
    },
  });
}

export function useSetAccountType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountType: RegistrationAccountType) =>
      authService.setAccountType(accountType),
    onSuccess: (user) => {
      queryClient.setQueryData<SessionUser>(qk.session, user);
      queryClient.invalidateQueries({ queryKey: qk.myEntitlements });
    },
  });
}

export function useSwitchAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (to: RegistrationAccountType) => authService.switchAccount(to),
    onSuccess: ({ user }) => {
      queryClient.setQueryData<SessionUser>(qk.session, user);
      // Audience-scoped server state is no longer valid for the new account.
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      queryClient.invalidateQueries({ queryKey: qk.subscription });
    },
  });
}
