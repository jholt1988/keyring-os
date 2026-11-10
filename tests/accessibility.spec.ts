import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Admin is the app under test. Port 3001 is the JSON mock backend, which has
// no login page. baseURL is http://127.0.0.1:3000.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  test('login page accessibility', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(WCAG)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    const username = page.getByPlaceholder('admin');
    const password = page.getByPlaceholder('••••••••');
    const submit = page.getByRole('button', { name: /sign in/i });

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
    await expect(submit).toBeVisible();

    await username.focus();
    await expect(username).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(password).toBeFocused();
  });

  test('login page has a viewport and a usable submit target', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(WCAG)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    const button = page.getByRole('button', { name: /sign in/i });
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
