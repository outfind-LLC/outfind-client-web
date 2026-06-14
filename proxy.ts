import { NextResponse, type NextRequest } from "next/server";

import { PROTECTED_PREFIXES, routes } from "@/config/routes";
import { env } from "@/lib/env";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (Node.js runtime only).
 *
 * This is a UX redirect layer, NOT the authorization boundary — the backend
 * validates every request against the httpOnly session cookie. Two jobs:
 *  1. Bounce visitors with no session cookie at all away from protected routes,
 *     so we never flash an app shell to obviously signed-out users.
 *  2. Refresh a lapsed short-lived access token here, where cookies CAN be
 *     written — RSC cannot. Without this, once the 15-minute `access_token`
 *     cookie expires, the server-side session check in the app layout sees no
 *     token, returns null, and wrongly bounces a still-signed-in worker (with a
 *     valid `refresh_token`) to `/auth`.
 *
 * We do NOT redirect cookie-bearing users away from `/auth`: cookie *presence*
 * isn't proof of a valid session, and the `/auth` page runs the real
 * `getServerSession()` check itself.
 */
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Rotate the session against the backend using the refresh cookie. Returns the
 * backend's `Set-Cookie` headers (verbatim, so attributes are preserved) or
 * `null` when the refresh token is no longer valid.
 */
async function refreshSession(refreshToken: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { cookie: `${REFRESH_COOKIE}=${refreshToken}` },
    });
    if (!res.ok) return null;
    const setCookies = res.headers.getSetCookie();
    return setCookies.length > 0 ? setCookies : null;
  } catch {
    return null;
  }
}

/** "name=value; Path=/; HttpOnly…" → "name=value" for forwarding. */
function cookiePair(setCookie: string): string {
  return setCookie.split(";", 1)[0];
}

function redirectToAuth(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = routes.auth;
  url.search = "";
  url.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // A fresh access token, or a non-protected route → nothing to do.
  if (request.cookies.has(ACCESS_COOKIE) || !isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Protected route, no access token. Try to refresh before bouncing.
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    const setCookies = await refreshSession(refreshToken);
    if (setCookies) {
      // Forward the rotated cookies to this request's RSC pass (so the layout's
      // server session check sees the new access token) and to the browser.
      const existingCookie = request.headers.get("cookie");
      const mergedCookie = [existingCookie, ...setCookies.map(cookiePair)]
        .filter(Boolean)
        .join("; ");

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("cookie", mergedCookie);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      for (const cookie of setCookies) {
        response.headers.append("set-cookie", cookie);
      }
      return response;
    }
  }

  // Genuinely signed out (no refresh token) or refresh failed → sign-in.
  return redirectToAuth(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)"],
};
