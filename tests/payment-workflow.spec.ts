import { test, expect } from '@playwright/test';
import { loginAs, testUsers, mockApiResponse, generateTestPayment } from './test-utils';

test.describe('Payment Processing Workflow', () => {
  test('tenant can view and pay invoice', async ({ page }) => {
    // Mock API responses for this test
    await mockApiResponse(page, '**/api/payments/invoices*', {
      invoices: [
        {
          id: 'inv-123',
          amountDue: 150000,
          dueDate: new Date().toISOString(),
          status: 'pending',
          description: 'Monthly Rent - June 2026'
        }
      ]
    });
    
    await mockApiResponse(page, '**/api/payments/create-intent*', {
      clientSecret: 'test_client_secret_123',
      paymentIntentId: 'pi_test_123'
    });
    
    // Login as tenant
    await loginAs(page, 'tenant');
    
    // Navigate to payments
    await page.click('[data-testid="nav-payments"]');
    
    // Should see invoice list
    await expect(page.locator('text=Monthly Rent - June 2026')).toBeVisible();
    await expect(page.locator('text=$1,500.00')).toBeVisible();
    
    // Click pay button
    await page.click('[data-testid="pay-invoice-btn"]');
    
    // Should open payment modal/form
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
    
    // Fill payment details (mocked Stripe)
    await page.fill('[data-testid="card-number"]', '4242 4242 4242 4242');
    await page.fill('[data-testid="card-expiry"]', '12/30');
    await page.fill('[data-testid="card-cvc"]', '123');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Should show success
    await expect(page.locator('text=Payment Successful')).toBeVisible();
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
  });
  
  test('delinquency workflow shows in admin dashboard', async ({ page }) => {
    // Mock delinquency data
    await mockApiResponse(page, '**/api/payments/delinquency*', {
      queue: [
        {
          tenantName: 'John Smith',
          propertyAddress: '123 Main St',
          daysPastDue: 15,
          amountDue: 225000,
          priorityScore: 85
        },
        {
          tenantName: 'Jane Doe',
          propertyAddress: '456 Oak Ave',
          daysPastDue: 30,
          amountDue: 150000,
          priorityScore: 95
        }
      ]
    });
    
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to delinquency queue
    await page.click('[data-testid="nav-delinquency"]');
    
    // Should see delinquency list
    await expect(page.locator('text=Delinquency Queue')).toBeVisible();
    await expect(page.locator('text=John Smith')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    
    // Should show priority scores
    await expect(page.locator('text=Priority: 85')).toBeVisible();
    await expect(page.locator('text=Priority: 95')).toBeVisible();
    
    // Send reminder functionality
    await page.click('[data-testid="send-reminder-0"]');
    await expect(page.locator('text=Reminder sent successfully')).toBeVisible();
  });
  
  test('payment history shows ledger entries', async ({ page }) => {
    await mockApiResponse(page, '**/api/payments/ledger*', {
      ledgerEntries: [
        {
          date: '2026-06-01',
          description: 'Monthly Rent - June',
          debit: 150000,
          credit: 0,
          balance: 150000
        },
        {
          date: '2026-06-05',
          description: 'Payment Received',
          debit: 0,
          credit: 150000,
          balance: 0
        }
      ]
    });
    
    await loginAs(page, 'tenant');
    await page.click('[data-testid="nav-payment-history"]');
    
    await expect(page.locator('text=Payment History')).toBeVisible();
    await expect(page.locator('text=Monthly Rent - June')).toBeVisible();
    await expect(page.locator('text=Payment Received')).toBeVisible();
  });
});

test.describe('Mobile Payment Experience', () => {
  test('payment flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await mockApiResponse(page, '**/api/payments/invoices*', {
      invoices: [{
        id: 'inv-mobile',
        amountDue: 150000,
        dueDate: new Date().toISOString(),
        status: 'pending'
      }]
    });
    
    await loginAs(page, 'tenant');
    await page.click('[data-testid="nav-payments"]');
    
    // Mobile-optimized payment button should be visible
    await expect(page.locator('[data-testid="mobile-pay-btn"]')).toBeVisible();
    
    // Payment form should be responsive
    await page.click('[data-testid="mobile-pay-btn"]');
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
  });
});