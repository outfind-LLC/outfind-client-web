"use client";

import { useQuery } from "@tanstack/react-query";

import { qk } from "@/config/query-keys";
import { authService } from "@/features/auth/services/auth.service";
import { isApiClientError } from "@/lib/api/error";
import type { SessionUser } from "@/interfaces/auth.interface";
import { ACCOUNT_TYPE } from "@/interfaces/enums";

/**
 * The current session as React Query state. A 401 resolves to `null` (signed
 * out) rather than an error, so consumers branch on `isAuthenticated` instead of
 * catching. Other errors propagate normally.
 */
export function useSession() {
  const query = useQuery<SessionUser | null>({
    queryKey: qk.session,
    queryFn: async () => {
      try {
        return await authService.getSession();
      } catch (error) {
        if (isApiClientError(error) && error.isUnauthorized) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const user = query.data ?? null;

  return {
    user,
    isAuthenticated: user !== null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isWorker: user?.accountType === ACCOUNT_TYPE.WORKER,
    isEmployer: user?.accountType === ACCOUNT_TYPE.EMPLOYER,
    isAdmin: user?.accountType === ACCOUNT_TYPE.ADMIN,
  };
}
