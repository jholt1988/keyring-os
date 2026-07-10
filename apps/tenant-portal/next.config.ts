import type { NextConfig } from "next";
import * as path from "node:path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the app can ship in a slim,
  // node_modules-free container image (see Dockerfile).
  output: "standalone",
  // Monorepo: pin Turbopack's filesystem root to the repo root so it resolves
  // workspace packages and doesn't mis-infer the root from stray lockfiles.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  // Keep Next's output file tracing anchored to the same root (standalone build).
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
};

export default nextConfig;
