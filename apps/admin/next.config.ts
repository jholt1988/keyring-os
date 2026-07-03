import type { NextConfig } from "next";
import * as path from "node:path";

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
};

export default nextConfig;
