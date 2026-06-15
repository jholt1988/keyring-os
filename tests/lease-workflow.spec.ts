import { test, expect } from '@playwright/test';
import { loginAs, mockApiResponse, generateTestLease } from './test-utils';

test.describe('Lease Application & Signing Workflow', () => {
  test('tenant submits rental application', async ({ page }) => {
    // Mock property listings
    await mockApiResponse(page, '**/api/properties/available*', {
      properties: [
        {
          id: 'prop-123',
          address: '123 Main St, San Francisco, CA',
          monthlyRent: 250000,
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850
        }
      ]
    });
    
    // Mock application submission
    await mockApiResponse(page, '**/api/applications/submit*', {
      applicationId: 'app-123',
      status: 'submitted',
      estimatedReviewTime: '3-5 business days'
    });
    
    // Login as tenant
    await loginAs(page, 'tenant');
    
    // Browse available properties
    await page.click('[data-testid="nav-find-properties"]');
    await expect(page.locator('text=Available Properties')).toBeVisible();
    await expect(page.locator('text=123 Main St')).toBeVisible();
    
    // View property details
    await page.click('[data-testid="view-property-prop-123"]');
    await expect(page.locator('text=Property Details')).toBeVisible();
    
    // Start application
    await page.click('[data-testid="apply-now-btn"]');
    await expect(page.locator('text=Rental Application')).toBeVisible();
    
    // Fill application form
    await page.fill('[data-testid="full-name"]', 'John Applicant');
    await page.fill('[data-testid="email"]', 'john@applicant.com');
    await page.fill('[data-testid="phone"]', '(555) 123-4567');
    await page.fill('[data-testid="annual-income"]', '85000');
    await page.fill('[data-testid="employer"]', 'Tech Corp Inc');
    
    // Upload documents
    await page.setInputFiles('[data-testid="id-upload"]', {
      name: 'id.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock PDF content')
    });
    
    await page.setInputFiles('[data-testid="paystub-upload"]', {
      name: 'paystub.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock paystub')
    });
    
    // Accept terms
    await page.check('[data-testid="terms-accepted"]');
    await page.check('[data-testid="background-check-auth"]');
    
    // Submit application
    await page.click('[data-testid="submit-application"]');
    
    // Should show confirmation
    await expect(page.locator('text=Application Submitted')).toBeVisible();
    await expect(page.locator('text=3-5 business days')).toBeVisible();
  });
  
  test('admin reviews and approves application', async ({ page }) => {
    // Mock pending applications
    await mockApiResponse(page, '**/api/applications/pending*', {
      applications: [
        {
          id: 'app-456',
          applicantName: 'Jane Smith',
          propertyAddress: '456 Oak Ave',
          submittedDate: '2026-06-10',
          income: 95000,
          creditScore: 720
        }
      ]
    });
    
    // Mock approval response
    await mockApiResponse(page, '**/api/applications/app-456/approve*', {
      approved: true,
      leaseId: 'lease-789',
      nextSteps: 'Lease document generated'
    });
    
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to applications review
    await page.click('[data-testid="nav-applications-review"]');
    await expect(page.locator('text=Pending Applications')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    
    // Review application details
    await page.click('[data-testid="review-app-456"]');
    await expect(page.locator('text=Application Review')).toBeVisible();
    await expect(page.locator('text=Credit Score: 720')).toBeVisible();
    
    // Approve application
    await page.click('[data-testid="approve-application"]');
    
    // Confirm approval dialog
    await expect(page.locator('text=Confirm Approval')).toBeVisible();
    await page.click('[data-testid="confirm-approval"]');
    
    // Should show success and lease creation
    await expect(page.locator('text=Application Approved')).toBeVisible();
    await expect(page.locator('text=Lease document generated')).toBeVisible();
  });
  
  test('tenant signs lease via e-signature', async ({ page }) => {
    // Mock lease ready for signing
    await mockApiResponse(page, '**/api/leases/pending-signature*', {
      leases: [
        {
          id: 'lease-123',
          propertyAddress: '123 Main St',
          monthlyRent: 250000,
          leaseTerm: '12 months',
          documentUrl: '/leases/123/document.pdf'
        }
      ]
    });
    
    // Mock e-signature initiation
    await mockApiResponse(page, '**/api/esignature/initiate*', {
      envelopeId: 'env-456',
      redirectUrl: 'https://docusign.com/signing/123',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    });
    
    // Login as tenant
    await loginAs(page, 'tenant');
    
    // Navigate to leases
    await page.click('[data-testid="nav-my-leases"]');
    await expect(page.locator('text=My Leases')).toBeVisible();
    await expect(page.locator('text=123 Main St')).toBeVisible();
    
    // View lease details
    await page.click('[data-testid="view-lease-123"]');
    await expect(page.locator('text=Lease Agreement')).toBeVisible();
    
    // Start e-signature
    await page.click('[data-testid="sign-lease-btn"]');
    
    // Should redirect to signing interface
    await expect(page).toHaveURL(/signing/);
    
    // Mock signing completion
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('esignature:completed', {
        detail: { envelopeId: 'env-456', status: 'completed' }
      }));
    });
    
    // Should show signing complete
    await expect(page.locator('text=Signature Complete')).toBeVisible();
    await expect(page.locator('text=Lease Activated')).toBeVisible();
  });
  
  test('lease delinquency triggers automated workflow', async ({ page }) => {
    // Mock delinquent leases
    await mockApiResponse(page, '**/api/leases/delinquent*', {
      leases: [
        {
          id: 'lease-del-1',
          tenantName: 'Delinquent Tenant',
          propertyAddress: '789 Pine St',
          daysPastDue: 45,
          amountPastDue: 375000,
          lastContact: '2026-05-30'
        }
      ]
    });
    
    // Mock attorney referral
    await mockApiResponse(page, '**/api/legal/refer-attorney*', {
      referralId: 'att-ref-123',
      attorneyFirm: 'Smith & Associates',
      estimatedCost: 50000
    });
    
    // Login as property manager
    await loginAs(page, 'propertyManager');
    
    // Navigate to legal/collections
    await page.click('[data-testid="nav-legal-collections"]');
    await expect(page.locator('text=Delinquent Leases')).toBeVisible();
    
    // View delinquent lease
    await expect(page.locator('text=Delinquent Tenant')).toBeVisible();
    await expect(page.locator('text=45 days past due')).toBeVisible();
    
    // Initiate attorney referral
    await page.click('[data-testid="refer-to-attorney-del-1"]');
    
    // Confirm referral
    await expect(page.locator('text=Attorney Referral')).toBeVisible();
    await page.click('[data-testid="confirm-referral"]');
    
    // Should show referral confirmation
    await expect(page.locator('text=Referred to Smith & Associates')).toBeVisible();
    await expect(page.locator('text=Estimated cost: $500')).toBeVisible();
  });
});

test.describe('Mobile Lease Experience', () => {
  test('mobile property browsing and application', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await mockApiResponse(page, '**/api/properties/available*', {
      properties: [{
        id: 'prop-mobile',
        address: 'Mobile Test Property',
        monthlyRent: 200000
      }]
    });
    
    await loginAs(page, 'tenant');
    
    // Mobile property browsing
    await page.click('[data-testid="mobile-nav-properties"]');
    await expect(page.locator('text=Mobile Test Property')).toBeVisible();
    
    // Mobile swipeable property cards
    await page.click('[data-testid="mobile-property-card"]');
    
    // Mobile-optimized application form
    await page.click('[data-testid="mobile-apply-btn"]');
    await expect(page.locator('[data-testid="mobile-application-form"]')).toBeVisible();
  });
});