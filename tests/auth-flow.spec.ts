import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - A-03 Bug Reproduction', () => {
  test('tenant login redirects to dashboard, not stuck on /login', async ({ page }) => {
    // This test reproduces the A-03 bug where login stays on /login
    // despite valid API auth
    
    await page.goto('http://localhost:3001/login');
    
    // Check we're on login page
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
    
    // Fill login form with test credentials
    // Note: We'll need actual test user credentials or mock backend
    await page.fill('input[type="email"]', 'test-tenant@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // CRITICAL ASSERTION: Should redirect to dashboard
    // Current bug: stays on /login
    await expect(page).not.toHaveURL(/login/);
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify dashboard elements
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="tenant-name"]')).toBeVisible();
  });
  
  test('admin login shows admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('h1:has-text("Admin Login")')).toBeVisible();
    
    await page.fill('input[type="email"]', 'admin@propertypulse.com');
    await page.fill('input[type="password"]', 'admin123');
    
    await page.click('button[type="submit"]');
    
    await expect(page).not.toHaveURL(/login/);
    await expect(page).toHaveURL(/admin\/dashboard/);
    
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });
  
  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page with error
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
  
  test('login form validation works', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});

test.describe('Mobile Responsive Authentication', () => {
  test('login form responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('http://localhost:3001/login');
    
    // Form should be properly sized for mobile
    await expect(page.locator('form')).toBeVisible();
    
    // Inputs should be tappable/touch-friendly
    const emailInput = page.locator('input[type="email"]');
    await emailInput.click();
    await emailInput.fill('mobile@example.com');
    
    // Submit button should be accessible
    await page.click('button[type="submit"]');
  });
});