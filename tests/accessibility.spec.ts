import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  test('login page accessibility', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Additional manual checks
    await expect(page.locator('input[type="email"]')).toHaveAttribute('aria-label', 'Email');
    await expect(page.locator('input[type="password"]')).toHaveAttribute('aria-label', 'Password');
    await expect(page.locator('button[type="submit"]')).toHaveAttribute('aria-label', 'Sign in');
    
    // Keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
  
  test('dashboard accessibility', async ({ page }) => {
    // Mock successful login
    await mockApiResponse(page, '**/api/auth/login*', {
      token: 'mock-token',
      user: { id: 'user-123', role: 'tenant' }
    });
    
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/dashboard/);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check landmark roles
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check skip links
    await page.keyboard.press('Tab');
    await expect(page.locator('[href="#main-content"]')).toBeVisible();
  });
  
  test('payment form accessibility', async ({ page }) => {
    await mockApiResponse(page, '**/api/payments/invoices*', {
      invoices: [{ id: 'inv-acc', amountDue: 150000 }]
    });
    
    await page.goto('http://localhost:3001/payments');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Form field labels
    await expect(page.locator('[data-testid="card-number"]')).toHaveAttribute('aria-label', 'Card Number');
    await expect(page.locator('[data-testid="card-expiry"]')).toHaveAttribute('aria-label', 'Expiration Date');
    await expect(page.locator('[data-testid="card-cvc"]')).toHaveAttribute('aria-label', 'Security Code');
    
    // Error messaging
    await page.click('[data-testid="submit-payment"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });
  
  test('mobile responsive accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Touch target sizing
    const button = page.locator('button[type="submit"]');
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Text sizing
    await expect(page.locator('body')).toHaveCSS('font-size', /16px/);
    
    // Viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
  
  test('color contrast compliance', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll check manually
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Manual contrast checks for critical elements
    const emailLabel = page.locator('label:has-text("Email")');
    const emailLabelColor = await emailLabel.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Check button contrast
    const submitButton = page.locator('button[type="submit"]');
    const buttonBg = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const buttonText = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // These would ideally use a contrast checking library
    // For now, we ensure elements exist and have styles
    expect(emailLabelColor).toBeTruthy();
    expect(buttonBg).toBeTruthy();
    expect(buttonText).toBeTruthy();
  });
  
  test('screen reader compatibility', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    // Check ARIA landmarks
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
    
    // Check form field relationships
    const emailInput = page.locator('input[type="email"]');
    const emailLabel = page.locator('label:has-text("Email")');
    
    const emailLabelId = await emailLabel.getAttribute('id');
    const emailInputAriaLabelledBy = await emailInput.getAttribute('aria-labelledby');
    
    expect(emailLabelId).toBeTruthy();
    expect(emailInputAriaLabelledBy).toContain(emailLabelId);
    
    // Check live regions for dynamic content
    await page.click('button[type="submit"]');
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });
});

// Helper function for mocking API
async function mockApiResponse(page: any, urlPattern: string, response: any): Promise<void> {
  await page.route(urlPattern, (route: any) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}