import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { ADMIN_SECRET_PATH } from "@/lib/admin-route";

const { auth } = NextAuth(authConfig);

const isDev = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string): string {
  // Strict, nonce-based policy. Fonts/styles are self-hosted via next/font,
  // so no external origins are needed in production.
  const directives = [
    `default-src 'self'`,
    // 'strict-dynamic' lets nonce'd scripts load their own chunks; the nonce
    // is what actually authorizes execution. 'unsafe-eval' only in dev (HMR).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,
    // Next injects some inline styles; 'unsafe-inline' for styles only (not scripts).
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Dev needs websocket for HMR.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    `frame-src 'none'`,
    `manifest-src 'self'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ];
  return directives.join("; ");
}

/**
 * Forward the per-request nonce and CSP on the *request* headers.
 *
 * Next.js reads the nonce from the request's `Content-Security-Policy` header to
 * automatically stamp `nonce="…"` on the scripts it injects. Without it, the
 * strict production CSP (no `unsafe-inline`/`unsafe-eval` for scripts) would
 * block Next's own hydration bootstrap. `x-nonce` is kept so the root layout can
 * also read it directly.
 */
function withSecurityHeaders(src: Headers, nonce: string, csp: string): Headers {
  const h = new Headers(src);
  h.set("x-nonce", nonce);
  h.set("Content-Security-Policy", csp);
  return h;
}

export default auth((req) => {
  // Fresh nonce per request (Web Crypto is available on the edge runtime).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));
  const csp = buildCsp(nonce);

  const { pathname } = req.nextUrl;
  const secretPrefix = `/${ADMIN_SECRET_PATH}`;

  // 1. HARD BLOCK: Prevent guessing default/obvious admin and login endpoints.
  // Anyone requesting /admin or /login directly gets 404 Not Found.
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/")
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "Content-Security-Policy": csp,
      },
    });
  }

  // 2. UNGUESSABLE ADMIN GATEWAY:
  // Secret path acts as the staff/organizer portal.
  if (pathname === secretPrefix || pathname.startsWith(`${secretPrefix}/`)) {
    const subpath = pathname.slice(secretPrefix.length) || "";

    // Unauthenticated: Show staff login at root secret route; redirect subpaths to root secret route.
    if (!req.auth) {
      if (subpath && subpath !== "/") {
        const url = new URL(secretPrefix, req.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        const redirect = NextResponse.redirect(url);
        redirect.headers.set("Content-Security-Policy", csp);
        return redirect;
      }

      // Root secret URL: rewrite to login page so browser stays on secret URL
      const url = new URL("/login", req.nextUrl.origin);
      url.search = req.nextUrl.search;
      const requestHeaders = withSecurityHeaders(req.headers, nonce, csp);
      const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
      res.headers.set("Content-Security-Policy", csp);
      return res;
    }

    // Authenticated: Rewrite to /admin or /admin/...
    const target = subpath ? `/admin${subpath}` : "/admin";
    const url = new URL(target, req.nextUrl.origin);
    url.search = req.nextUrl.search;
    const requestHeaders = withSecurityHeaders(req.headers, nonce, csp);
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  // 3. User account gate (if any)
  if (pathname.startsWith("/account") && !req.auth) {
    const url = new URL(secretPrefix, req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  // Pass the nonce downstream so the root layout can stamp it on scripts.
  const requestHeaders = withSecurityHeaders(req.headers, nonce, csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
});

export const config = {
  // Run on everything except static assets & image optimizer.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$).*)"],
};
