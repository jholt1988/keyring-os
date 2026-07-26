import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  // Keep retries snappy in CI — slow tests that need 3 tries shouldn't block the run
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // In CI: chromium only (3× faster than 5 browsers × 2 workers). Locally, all browsers.
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
      ],
  webServer: [
    {
      command: 'node e2e/mock-backend.mjs',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'pnpm --filter @keyring/admin dev --port 3000',
      url: 'http://127.0.0.1:3000/login',
      reuseExistingServer: true,
      timeout: 120_000,
      env: { API_URL: 'http://127.0.0.1:3001/api' },
    },
    {
      // Tenant portal on its own port so it coexists with admin (:3000). The
      // project baseURL points at admin, so the tenant smoke spec targets this
      // URL explicitly (TENANT_PORTAL_URL). Mock auth + the shared mock backend
      // keep the app shell renderable without a live NestJS backend.
      command: 'pnpm --filter @keyring/tenant-portal dev --port 3002',
      url: 'http://127.0.0.1:3002/feed',
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001/api',
        NEXT_PUBLIC_ENABLE_MOCK_AUTH: 'true',
        NEXT_PUBLIC_MOCK_USER_ID: 'dev-tenant-uuid-001',
      },
    },
  ],
});
