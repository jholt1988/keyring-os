import { test, expect } from '@playwright/test';
import { loginAs, mockApiResponse } from './test-utils';

test.describe('Keyring OS Admin - Property Management', () => {
  test('property listing and details view', async ({ page }) => {
    // Mock properties API
    await mockApiResponse(page, '**/api/properties*', {
      properties: [
        {
          id: 'prop-001',
          name: 'Sunset Apartments',
          address: '123 Main St, San Francisco, CA',
          units: 24,
          occupancy: 92,
          monthlyRevenue: 7200000
        },
        {
          id: 'prop-002', 
          name: 'Oakwood Manor',
          address: '456 Oak Ave, Oakland, CA',
          units: 12,
          occupancy: 100,
          monthlyRevenue: 4200000
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to properties
    await page.click('nav >> text=Properties');
    await expect(page).toHaveURL(/properties/);
    await expect(page.locator('text=Property Portfolio')).toBeVisible();
    
    // Should see property list
    await expect(page.locator('text=Sunset Apartments')).toBeVisible();
    await expect(page.locator('text=Oakwood Manor')).toBeVisible();
    await expect(page.locator('text=92% occupancy')).toBeVisible();
    await expect(page.locator('text=100% occupancy')).toBeVisible();
    
    // View property details
    await page.click('text=Sunset Apartments');
    await expect(page).toHaveURL(/properties\/prop-001/);
    
    // Property detail view should show metrics
    await expect(page.locator('text=Property Details')).toBeVisible();
    await expect(page.locator('text=24 units')).toBeVisible();
    await expect(page.locator('text=$72,000 monthly revenue')).toBeVisible();
  });
  
  test('tenant management workflow', async ({ page }) => {
    // Mock tenants data
    await mockApiResponse(page, '**/api/tenants*', {
      tenants: [
        {
          id: 'tenant-001',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          propertyName: 'Sunset Apartments',
          unit: '4B',
          leaseEndDate: '2026-12-31',
          balance: 0
        },
        {
          id: 'tenant-002',
          name: 'Jane Doe',
          email: 'jane@example.com', 
          phone: '(555) 987-6543',
          propertyName: 'Oakwood Manor',
          unit: '2A',
          leaseEndDate: '2027-06-30',
          balance: -150000 // $1500 credit
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to tenants
    await page.click('nav >> text=Tenants');
    await expect(page).toHaveURL(/tenants/);
    
    // Should see tenant list
    await expect(page.locator('text=John Smith')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    
    // Filter tenants
    await page.fill('input[placeholder="Search tenants"]', 'John');
    await expect(page.locator('text=John Smith')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).not.toBeVisible();
    
    // Clear filter
    await page.fill('input[placeholder="Search tenants"]', '');
    
    // View tenant details
    await page.click('text=John Smith');
    await expect(page).toHaveURL(/tenants\/tenant-001/);
    
    // Tenant detail view
    await expect(page.locator('text=Tenant Profile')).toBeVisible();
    await expect(page.locator('text=Unit 4B')).toBeVisible();
    await expect(page.locator('text=Lease ends Dec 31, 2026')).toBeVisible();
  });
  
  test('lease abstraction workflow', async ({ page }) => {
    // Mock lease abstraction data
    await mockApiResponse(page, '**/api/lease-abstraction*', {
      leases: [
        {
          id: 'lease-abc',
          tenantName: 'Robert Johnson',
          propertyAddress: '789 Pine St',
          abstracted: false,
          pages: 45,
          priority: 'high'
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to lease abstraction
    await page.click('nav >> text=Lease Abstraction');
    await expect(page).toHaveURL(/lease-abstraction/);
    
    // Should see pending leases
    await expect(page.locator('text=Lease Abstraction Queue')).toBeVisible();
    await expect(page.locator('text=Robert Johnson')).toBeVisible();
    await expect(page.locator('text=45 pages')).toBeVisible();
    await expect(page.locator('text=High priority')).toBeVisible();
    
    // Start abstraction
    await page.click('button:has-text("Start Abstracting")');
    
    // Should open abstraction interface
    await expect(page.locator('text=Lease Abstraction Tool')).toBeVisible();
    
    // Mock abstraction completion
    await mockApiResponse(page, '**/api/lease-abstraction/lease-abc/complete*', {
      completed: true,
      keyTerms: ['12-month term', '$2500/month', 'Pet allowed'],
      extractedData: {
        rentAmount: 250000,
        securityDeposit: 500000,
        leaseTerm: 12
      }
    });
    
    // Complete abstraction
    await page.click('button:has-text("Complete Abstraction")');
    
    // Should show completion confirmation
    await expect(page.locator('text=Abstraction Complete')).toBeVisible();
    await expect(page.locator('text=$2,500/month')).toBeVisible();
  });
  
  test('maintenance request management', async ({ page }) => {
    // Mock maintenance requests
    await mockApiResponse(page, '**/api/maintenance/requests*', {
      requests: [
        {
          id: 'mr-2024-001',
          tenantName: 'Sarah Wilson',
          property: 'Sunset Apartments',
          unit: '3C',
          issue: 'Broken HVAC',
          priority: 'urgent',
          submitted: '2026-06-15T09:30:00Z',
          status: 'pending'
        }
      ]
    });
    
    // Mock technicians
    await mockApiResponse(page, '**/api/technicians*', {
      technicians: [
        {
          id: 'tech-001',
          name: 'Mike HVAC Specialist',
          specialty: 'HVAC',
          rating: 4.8,
          available: true
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to maintenance
    await page.click('nav >> text=Maintenance');
    await expect(page).toHaveURL(/maintenance/);
    
    // Should see urgent request
    await expect(page.locator('text=Broken HVAC')).toBeVisible();
    await expect(page.locator('text=Urgent')).toBeVisible();
    await expect(page.locator('text=Sarah Wilson')).toBeVisible();
    
    // Assign technician
    await page.click('button:has-text("Assign Technician")');
    await expect(page.locator('text=Assign to Technician')).toBeVisible();
    
    // Select technician
    await page.click('text=Mike HVAC Specialist');
    
    // Add notes
    await page.fill('textarea[placeholder="Instructions"]', 'Tenant reports no cooling, check compressor and thermostat');
    
    // Confirm assignment
    await page.click('button:has-text("Confirm Assignment")');
    
    // Should show assignment confirmation
    await expect(page.locator('text=Assigned to Mike HVAC Specialist')).toBeVisible();
  });
});

test.describe('Keyring OS Admin - Financial Operations', () => {
  test('payment processing and delinquency', async ({ page }) => {
    // Mock payments data
    await mockApiResponse(page, '**/api/payments/overdue*', {
      overdue: [
        {
          tenantId: 'tenant-003',
          tenantName: 'Late Payor',
          property: 'Sunset Apartments',
          amountDue: 375000,
          daysOverdue: 15,
          lastPaymentDate: '2026-05-30'
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to payments/delinquency
    await page.click('nav >> text=Payments');
    await page.click('text=Delinquency');
    
    await expect(page.locator('text=Overdue Payments')).toBeVisible();
    await expect(page.locator('text=Late Payor')).toBeVisible();
    await expect(page.locator('text=15 days overdue')).toBeVisible();
    await expect(page.locator('text=$3,750')).toBeVisible();
    
    // Send payment reminder
    await page.click('button:has-text("Send Reminder")');
    
    // Mock reminder sent
    await mockApiResponse(page, '**/api/payments/send-reminder*', {
      sent: true,
      reminderId: 'rem-001',
      method: 'email_sms'
    });
    
    // Should show reminder confirmation
    await expect(page.locator('text=Reminder sent')).toBeVisible();
  });
  
  test('financial reporting', async ({ page }) => {
    // Mock financial reports
    await mockApiResponse(page, '**/api/reports/financial*', {
      report: {
        period: 'June 2026',
        totalRevenue: 12500000,
        totalExpenses: 4500000,
        netOperatingIncome: 8000000,
        properties: 3,
        occupancyRate: 94.5
      }
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to reports
    await page.click('nav >> text=Reports');
    await page.click('text=Financial Reports');
    
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    await expect(page.locator('text=$125,000 revenue')).toBeVisible();
    await expect(page.locator('text=$80,000 NOI')).toBeVisible();
    await expect(page.locator('text=94.5% occupancy')).toBeVisible();
    
    // Generate PDF report
    await page.click('button:has-text("Generate PDF")');
    
    // Should trigger download or preview
    await expect(page.locator('text=Generating report')).toBeVisible();
  });
});

test.describe('Keyring OS Admin - Mobile Responsive', () => {
  test('admin dashboard mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginAs(page, 'admin');
    
    // Mobile hamburger menu should exist
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');
    
    // Should show mobile navigation
    await expect(page.locator('text=Properties')).toBeVisible();
    await expect(page.locator('text=Tenants')).toBeVisible();
    
    // Close menu
    await page.click('button[aria-label="Close menu"]');
    
    // Daily brief should be responsive
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Charts/graphs should be responsive
    const charts = page.locator('[class*="chart"], [class*="graph"]');
    await expect(charts.first()).toBeVisible();
  });
});