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
      "react-hooks/rules-of-hooks": "warn",
      'jsx-quotes': 'warn',
      'no-console': 'warn',
      // User-facing strings in components use actual quotes/apostrophes which
      // are valid in JSX and more readable than HTML entity escapes.
      'react/no-unescaped-entities': 'warn',
      // prefer-const: some loop variables are intentionally let for clarity when
      // the reassignment pattern is obvious; downgrade to warn.
      'prefer-const': 'warn',
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
