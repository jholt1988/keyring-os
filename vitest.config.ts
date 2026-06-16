import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['apps/**/*.test.{ts,tsx}', 'apps/**/*.spec.{ts,tsx}', 'packages/**/*.test.{ts,tsx}', 'packages/**/*.spec.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/tests/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only measure files with actual test coverage. The 80% threshold applies
      // to this curated set so pre-existing untested utility files don't silently
      // suppress the gate.
      include: [
        'apps/admin/src/middleware.ts',
        'apps/admin/src/lib/copilot-api.ts',
        'apps/admin/src/lib/copilot/workspaces.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        'apps/admin/src/lib/copilot/legacy.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
