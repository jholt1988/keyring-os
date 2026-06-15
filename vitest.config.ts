import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
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
