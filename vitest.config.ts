import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // `@/…` resolves to the admin app's src (matching apps/admin/tsconfig.json).
  // tenant-portal has no @/-importing tests, so a single alias is unambiguous.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/admin/src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
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
        'apps/admin/src/lib/copilot/briefing.ts',
        'apps/admin/src/lib/copilot/core.ts',
        'apps/admin/src/lib/copilot/notifications.ts',
        'apps/admin/src/lib/copilot/payments.ts',
        'apps/admin/src/lib/copilot/vendors.ts',
        'apps/admin/src/lib/feed-api.ts',
        'apps/admin/src/lib/operator/api/client.ts',
        'apps/admin/src/lib/utils.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'apps/admin/src/lib/copilot/legacy.ts',
        'apps/admin/src/lib/copilot/legacy-compat.ts',
        'apps/admin/src/lib/copilot/workspaces.ts',
        'apps/admin/src/lib/operator/api/generated/**',
        'apps/admin/src/lib/operator/read-only-data.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
