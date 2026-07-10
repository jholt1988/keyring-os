import { expect, test } from '@playwright/test';

// The tenant portal runs on its own dev server (see `webServer` in
// playwright.config.ts). The project baseURL points at the admin app (:3000),
// so these tests target the tenant portal explicitly.
const BASE = process.env.TENANT_PORTAL_URL ?? 'http://127.0.0.1:3002';

// Smoke coverage: the portal previously had none. These assertions are
// deliberately data-independent — every page is a client component that fetches
// in the browser, so the layout shell (sidebar + <main>) renders server-side
// regardless of whether the backend is reachable.

test('tenant portal boots and renders the app shell', async ({ page }) => {
  const response = await page.goto(`${BASE}/feed`, { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  // Static metadata from the root layout.
  await expect(page).toHaveTitle(/Keyring/i);

  // Layout chrome that does not depend on fetched data.
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('nav').first()).toBeVisible();
  await expect(page.locator('nav a[href="/feed"]').first()).toBeAttached();
});

test('root redirects to the feed', async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/feed$/);
});
