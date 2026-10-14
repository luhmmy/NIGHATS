import type { NextConfig } from "next";

/**
 * Static security headers applied to every response.
 *
 * NOTE: Content-Security-Policy is intentionally NOT set here. It is built
 * per-request in `middleware.ts` with a fresh cryptographic nonce so that we
 * can run a strict, nonce-based CSP (no `unsafe-inline` for scripts).
 */
const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and allow preload-list submission.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking protection (CSP frame-ancestors is the modern one).
  { key: "X-Frame-Options", value: "DENY" },
  // Control how much referrer information is sent.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features by default.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Isolate this origin from cross-origin attacks (Spectre-class).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Don't advertise the framework.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
