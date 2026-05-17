import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node e2e/mock-backend.mjs',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'pnpm --filter @keyring/admin dev --port 3000',
      url: 'http://127.0.0.1:3000/login',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        API_URL: 'http://127.0.0.1:3001/api',
      },
    },
  ],
});
