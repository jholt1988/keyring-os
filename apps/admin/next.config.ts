import type { NextConfig } from "next";
import * as path from "node:path";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Backend origin for CSP connect-src / img-src. Admin talks to the backend
 * mostly through the same-origin BFF proxy (/api/*), but a few paths (copilot,
 * server actions) can read NEXT_PUBLIC_API_URL, so allow that origin too.
 * Resolved at build time; empty when unset.
 */
function apiOrigin(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_URL ||
    "";
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
}

function contentSecurityPolicy(): string {
  const api = apiOrigin();
  const scriptSrc = ["'self'", "'unsafe-inline'", isDev ? "'unsafe-eval'" : ""]
    .filter(Boolean)
    .join(" ");
  const connectSrc = ["'self'", api, isDev ? "ws:" : ""].filter(Boolean).join(" ");
  const imgSrc = ["'self'", "data:", "blob:", api].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `img-src ${imgSrc}`,
    // next/font self-hosts fonts; the print route @imports Google Fonts.
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

// Enforced, universally-safe headers + a Report-Only CSP. CSP is shipped
// Report-Only first so it can be validated against real traffic (Google Fonts,
// backend calls, Next's inline runtime) before flipping to enforcing. Real
// clickjacking protection is already provided by the enforced X-Frame-Options.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@keyring/ui", "@keyring/types", "@keyring/config"],
  // Monorepo: pin Turbopack's filesystem root to the repo root so it resolves
  // workspace packages and doesn't mis-infer the root from stray lockfiles.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  // Keep Next's output file tracing anchored to the same root (standalone build).
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
