import { NextResponse, type NextRequest } from "next/server";

import { PROTECTED_PREFIXES, routes } from "@/config/routes";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (Node.js runtime only).
 *
 * This is a UX redirect layer, NOT the authorization boundary — the backend
 * validates every request against the httpOnly session cookie. Here we only
 * bounce visitors with no session cookie at all away from protected routes, to
 * avoid flashing an app shell to obviously signed-out users.
 *
 * Crucially, we do NOT redirect cookie-bearing users away from `/auth`. Cookie
 * *presence* is not proof of a valid session — an expired/stale cookie would
 * otherwise ping-pong between `/auth` (proxy → app) and the app layout's
 * server-side session check (app → `/auth`), causing a redirect loop. The
 * `/auth` page performs the real `getServerSession()` check and redirects
 * genuinely-authenticated users into the app itself.
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

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (!hasSessionCookie(request) && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.auth;
    url.search = "";
    url.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)"],
};
