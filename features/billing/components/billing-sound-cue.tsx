"use client";

import { useEffect, useRef, useState } from "react";

import { useSubscription } from "@/features/billing/hooks/use-billing";
import { BILLING_PENDING_KEY } from "@/features/settings/constants/sounds";
import { playEventSound } from "@/features/settings/lib/play-sound";

/**
 * Plays the "payment success" sound once when the user returns from checkout
 * with an active subscription. The pending flag (set just before redirecting to
 * Polar) gates the subscription fetch, so there's no extra request otherwise.
 * Renders nothing.
 */
export function BillingSoundCue() {
  const [pending] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem(BILLING_PENDING_KEY) === "1",
  );
  const { data } = useSubscription(pending);
  const handled = useRef(false);

  useEffect(() => {
    if (!pending || handled.current || !data) return;
    handled.current = true;
    try {
      sessionStorage.removeItem(BILLING_PENDING_KEY);
    } catch {
      // ignore
    }
    if (data.isActive) playEventSound("billingSuccess");
  }, [pending, data]);

  return null;
}
