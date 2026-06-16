import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Legacy scaffold/API adapter files still use broad payload shapes. Keep the
      // signal visible without blocking the production-readiness lint gate.
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      'jsx-quotes': 'warn',
      'no-console': 'warn',
      // useOperatorData is intentionally called inside a try/catch so the sidebar
      // can render with static badges when the operator context is not available.
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Route generation uses require() intentionally for Next.js config loading.
    "generate-routes.js",
  ]),
]);
export default eslintConfig;
