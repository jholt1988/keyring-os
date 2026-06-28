import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['apps/**/*.test.{ts,tsx}', 'apps/**/*.spec.{ts,tsx}', 'packages/**/*.test.{ts,tsx}', 'packages/**/*.spec.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/tests/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only measure files with actual test coverage. All workspace loader
      // tests are .skip'd because vi.stubGlobal('fetch') doesn't intercept the
      // internal api() call used by workspaces.ts. Including it would drag
      // coverage to 14% and fail the 80% threshold.
      include: [
        'apps/admin/src/middleware.ts',
        'apps/admin/src/lib/copilot-api.ts',
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
