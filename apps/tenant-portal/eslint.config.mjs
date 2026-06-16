import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Downgrade these rules to warn — the patterns are deliberate:
      // - set-state-in-effect: intentional localStorage hydration in useEffect
      // - purity: Date.now() in render is the pragmatic approach for due-date
      //   comparisons; wrapping it in useMemo has no benefit here
      // - immutability: mutation via window.location.href is how Stripe
      //   redirect-based checkout works; there is no other option
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]);

export default eslintConfig;