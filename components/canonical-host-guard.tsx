"use client";

import { useEffect } from "react";

/**
 * Dev-only host normaliser. Telegram's login domain is registered as
 * `127.0.0.1:3000`, and the browser treats `localhost` and `127.0.0.1` as
 * different origins (different cookie jars, different OAuth origin checks). If
 * the app is opened on `localhost`, bounce to the `127.0.0.1` equivalent so the
 * Telegram popup origin and the session cookie host always line up.
 *
 * No-op in production (the hostname is never literally `localhost`) and on
 * `127.0.0.1`. Renders nothing.
 */
export function CanonicalHostGuard() {
  useEffect(() => {
    if (window.location.hostname !== "localhost") return;
    const url = new URL(window.location.href);
    url.hostname = "127.0.0.1";
    window.location.replace(url.toString());
  }, []);

  return null;
}
