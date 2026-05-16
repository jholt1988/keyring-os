import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@keyring/ui", "@keyring/types", "@keyring/config"],
};

export default nextConfig;
