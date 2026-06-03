import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES, PROTECTED_PREFIXES, routes } from "@/config/routes";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (Node.js runtime only).
 *
 * This is a UX redirect layer, NOT the authorization boundary — the backend
 * validates every request against the httpOnly session cookie. Here we only
 * gate navigation on cookie *presence* to avoid flashing protected shells to
 * obviously signed-out visitors (and to bounce signed-in users off /auth).
 *
 * A present-but-expired token still reaches the page; the client API layer
 * performs the 401 → refresh → retry dance, and server fetches resolve the
 * real session. Never trust this check for data access.
 */
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE)
  );
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const authed = hasSessionCookie(request);

  if (!authed && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.auth;
    url.search = "";
    url.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (authed && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.chat;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)"],
};
