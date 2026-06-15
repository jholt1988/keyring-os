# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Compliance (WCAG 2.1 AA) >> login page accessibility
- Location: tests/accessibility.spec.ts:5:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/login
Call log:
  - navigating to "http://localhost:3001/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | 
  4   | test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  5   |   test('login page accessibility', async ({ page }) => {
> 6   |     await page.goto('http://localhost:3001/login');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/login
  7   |     
  8   |     const accessibilityScanResults = await new AxeBuilder({ page })
  9   |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  10  |       .analyze();
  11  |     
  12  |     expect(accessibilityScanResults.violations).toEqual([]);
  13  |     
  14  |     // Additional manual checks
  15  |     await expect(page.locator('input[type="email"]')).toHaveAttribute('aria-label', 'Email');
  16  |     await expect(page.locator('input[type="password"]')).toHaveAttribute('aria-label', 'Password');
  17  |     await expect(page.locator('button[type="submit"]')).toHaveAttribute('aria-label', 'Sign in');
  18  |     
  19  |     // Keyboard navigation
  20  |     await page.keyboard.press('Tab');
  21  |     await expect(page.locator('input[type="email"]')).toBeFocused();
  22  |     
  23  |     await page.keyboard.press('Tab');
  24  |     await expect(page.locator('input[type="password"]')).toBeFocused();
  25  |     
  26  |     await page.keyboard.press('Tab');
  27  |     await expect(page.locator('button[type="submit"]')).toBeFocused();
  28  |   });
  29  |   
  30  |   test('dashboard accessibility', async ({ page }) => {
  31  |     // Mock successful login
  32  |     await mockApiResponse(page, '**/api/auth/login*', {
  33  |       token: 'mock-token',
  34  |       user: { id: 'user-123', role: 'tenant' }
  35  |     });
  36  |     
  37  |     await page.goto('http://localhost:3001/login');
  38  |     await page.fill('input[type="email"]', 'test@example.com');
  39  |     await page.fill('input[type="password"]', 'password123');
  40  |     await page.click('button[type="submit"]');
  41  |     
  42  |     await page.waitForURL(/dashboard/);
  43  |     
  44  |     const accessibilityScanResults = await new AxeBuilder({ page })
  45  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  46  |       .analyze();
  47  |     
  48  |     expect(accessibilityScanResults.violations).toEqual([]);
  49  |     
  50  |     // Check landmark roles
  51  |     await expect(page.locator('main')).toHaveAttribute('role', 'main');
  52  |     await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
  53  |     
  54  |     // Check heading hierarchy
  55  |     const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  56  |     expect(headings.length).toBeGreaterThan(0);
  57  |     
  58  |     // Check skip links
  59  |     await page.keyboard.press('Tab');
  60  |     await expect(page.locator('[href="#main-content"]')).toBeVisible();
  61  |   });
  62  |   
  63  |   test('payment form accessibility', async ({ page }) => {
  64  |     await mockApiResponse(page, '**/api/payments/invoices*', {
  65  |       invoices: [{ id: 'inv-acc', amountDue: 150000 }]
  66  |     });
  67  |     
  68  |     await page.goto('http://localhost:3001/payments');
  69  |     
  70  |     const accessibilityScanResults = await new AxeBuilder({ page })
  71  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  72  |       .analyze();
  73  |     
  74  |     expect(accessibilityScanResults.violations).toEqual([]);
  75  |     
  76  |     // Form field labels
  77  |     await expect(page.locator('[data-testid="card-number"]')).toHaveAttribute('aria-label', 'Card Number');
  78  |     await expect(page.locator('[data-testid="card-expiry"]')).toHaveAttribute('aria-label', 'Expiration Date');
  79  |     await expect(page.locator('[data-testid="card-cvc"]')).toHaveAttribute('aria-label', 'Security Code');
  80  |     
  81  |     // Error messaging
  82  |     await page.click('[data-testid="submit-payment"]');
  83  |     await expect(page.locator('[role="alert"]')).toBeVisible();
  84  |     await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  85  |   });
  86  |   
  87  |   test('mobile responsive accessibility', async ({ page }) => {
  88  |     await page.setViewportSize({ width: 375, height: 667 });
  89  |     await page.goto('http://localhost:3001/login');
  90  |     
  91  |     const accessibilityScanResults = await new AxeBuilder({ page })
  92  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  93  |       .analyze();
  94  |     
  95  |     expect(accessibilityScanResults.violations).toEqual([]);
  96  |     
  97  |     // Touch target sizing
  98  |     const button = page.locator('button[type="submit"]');
  99  |     const buttonBox = await button.boundingBox();
  100 |     expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
  101 |     expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  102 |     
  103 |     // Text sizing
  104 |     await expect(page.locator('body')).toHaveCSS('font-size', /16px/);
  105 |     
  106 |     // Viewport meta tag
```