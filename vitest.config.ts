import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/tests/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'apps/admin/src/middleware.ts',
        'apps/admin/src/lib/**/*.ts',
        'apps/admin/src/hooks/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        'apps/admin/src/app/**',
        'apps/admin/src/features/**',
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