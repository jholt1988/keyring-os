import { expect, test } from '@playwright/test';

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/reports');
  await expect(page).toHaveURL(/\/login\?redirect=%2Freports/);
});

test('logs in and navigates to requested route', async ({ page }) => {
  await page.goto('/login?redirect=%2Freports');

  await page.getByPlaceholder('admin').fill('admin');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/reports$/);

  const authToken = await page.context().cookies().then((cookies) =>
    cookies.find((cookie) => cookie.name === 'auth_token'),
  );
  expect(authToken?.httpOnly).toBeTruthy();
});
