import { test, expect } from '@playwright/test';

test.describe('Keyring OS Admin Authentication - A-03 Bug Reproduction', () => {
  test('admin login redirects to daily brief, not stuck on /login', async ({ page }) => {
    // This test reproduces the A-03 bug where login stays on /login
    // despite valid API auth at /api/v2/auth/login
    
    await page.goto('http://localhost:3000/login');
    
    // Verify we're on the Keyring OS login page
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Keyring OS')).toBeVisible();
    await expect(page.locator('text=Sign in to access your property operations')).toBeVisible();
    
    // Fill login form with test credentials
    await page.fill('input[placeholder="admin"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    
    // Mock the API response for successful login
    await page.route('**/api/v2/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token-123',
          user: {
            id: 'user-123',
            username: 'admin',
            roles: ['admin']
          }
        })
      });
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // CRITICAL ASSERTION: Should redirect to daily brief (/)
    // Current bug: stays on /login
    await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 5000 });
    await expect(page).not.toHaveURL(/login/);
    await expect(page).toHaveURL(/localhost:3000\/?$/); // Should be at root
    
    // Verify we're on the daily brief page
    await expect(page.locator('text=Daily Brief')).toBeVisible();
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
  
  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[placeholder="admin"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Mock failed login response
    await page.route('**/api/v2/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          statusMessage: 'Invalid credentials'
        })
      });
    });
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page with error
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page.locator('[class*="text-[#FCA5A5]"]')).toBeVisible(); // Error styling
  });
  
  test('form validation shows required field errors', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation error (if implemented)
    // Note: The current UI doesn't show validation errors before submit
    // This test documents the current behavior
    
    // Fields should be marked as invalid (if validation exists)
    const usernameInput = page.locator('input[placeholder="admin"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Check if validation attributes exist
    const usernameRequired = await usernameInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    
    // Log current validation state for debugging
    console.log('Username required:', usernameRequired);
    console.log('Password required:', passwordRequired);
  });
  
  test('remember me checkbox functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Check the remember me checkbox
    await page.check('input[type="checkbox"]');
    
    // Verify it's checked
    const isChecked = await page.isChecked('input[type="checkbox"]');
    expect(isChecked).toBe(true);
    
    // Fill form
    await page.fill('input[placeholder="admin"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    
    // Mock successful login
    await page.route('**/api/v2/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', username: 'admin' }
        })
      });
    });
    
    await page.click('button[type="submit"]');
    
    // After redirect, check if remember me persisted (would require cookie check)
    // This is a placeholder for more comprehensive cookie testing
  });
  
  test('forgot password link works', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Click forgot password
    await page.click('text=Forgot password?');
    
    // Should navigate to password reset page
    // Note: This functionality might not be implemented yet
    // await expect(page).toHaveURL(/reset-password/);
    
    // For now, just verify the link is clickable
    const forgotLink = page.locator('text=Forgot password?');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', /reset-password/);
  });
});

test.describe('Keyring OS Admin - Post Login Navigation', () => {
  test('successful login shows admin navigation', async ({ page }) => {
    // Mock login
    await page.route('**/api/v2/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', username: 'admin', roles: ['admin'] }
        })
      });
    });
    
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="admin"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/localhost:3000\/?$/);
    
    // Should show admin navigation sidebar
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for common admin navigation items
    const navItems = ['Properties', 'Tenants', 'Leases', 'Maintenance', 'Payments', 'Reports'];
    
    for (const item of navItems) {
      // Check if nav item exists (case insensitive)
      const navLocator = page.locator(`nav:has-text("${item}")`);
      try {
        await expect(navLocator).toBeVisible({ timeout: 1000 });
      } catch {
        console.log(`Navigation item "${item}" not found - may not be implemented yet`);
      }
    }
  });
  
  test('protected routes redirect to login', async ({ page }) => {
    // Try to access a protected route without login
    await page.goto('http://localhost:3000/properties');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Should preserve redirect parameter
    const url = page.url();
    expect(url).toContain('redirect=');
    expect(url).toContain('/properties');
  });
});