import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Backend origin for CSP connect-src / img-src. The tenant-portal calls the
 * backend directly from the browser via NEXT_PUBLIC_API_URL, so that origin
 * must be allowed. Resolved at build time; empty when unset.
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
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

// Enforced, universally-safe headers + a Report-Only CSP (validated before
// enforcing). Clickjacking is already blocked by the enforced X-Frame-Options.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
