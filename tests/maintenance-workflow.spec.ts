import { test, expect } from '@playwright/test';
import { loginAs, mockApiResponse } from './test-utils';

test.describe('Maintenance Request Workflow', () => {
  test('tenant submits maintenance request', async ({ page }) => {
    // Mock properties owned by tenant
    await mockApiResponse(page, '**/api/tenant/properties*', {
      properties: [
        {
          id: 'tenant-prop-1',
          address: '123 Main St, Apt 4B',
          unitNumber: '4B'
        }
      ]
    });
    
    // Mock maintenance categories
    await mockApiResponse(page, '**/api/maintenance/categories*', {
      categories: [
        { id: 'cat-1', name: 'Plumbing', priority: 'high' },
        { id: 'cat-2', name: 'Electrical', priority: 'high' },
        { id: 'cat-3', name: 'HVAC', priority: 'medium' },
        { id: 'cat-4', name: 'General Repair', priority: 'low' }
      ]
    });
    
    // Mock request submission
    await mockApiResponse(page, '**/api/maintenance/requests*', {
      requestId: 'mr-123',
      ticketNumber: 'TKT-2026-001',
      estimatedResponse: '24-48 hours'
    });
    
    // Login as tenant
    await loginAs(page, 'tenant');
    
    // Navigate to maintenance
    await page.click('[data-testid="nav-maintenance"]');
    await expect(page.locator('text=Maintenance Requests')).toBeVisible();
    
    // Create new request
    await page.click('[data-testid="new-request-btn"]');
    await expect(page.locator('text=New Maintenance Request')).toBeVisible();
    
    // Fill request form
    await page.selectOption('[data-testid="property-select"]', 'tenant-prop-1');
    await page.selectOption('[data-testid="category-select"]', 'cat-1');
    
    await page.fill('[data-testid="issue-title"]', 'Kitchen Sink Leaking');
    await page.fill('[data-testid="issue-description"]', 'Sink leaking under cabinet, water pooling on floor');
    
    // Upload photo
    await page.setInputFiles('[data-testid="photo-upload"]', {
      name: 'leak.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock image data')
    });
    
    // Emergency checkbox
    await page.check('[data-testid="emergency-checkbox"]');
    
    // Preferred contact
    await page.check('[data-testid="contact-phone"]');
    
    // Submit request
    await page.click('[data-testid="submit-request"]');
    
    // Should show confirmation
    await expect(page.locator('text=Request Submitted')).toBeVisible();
    await expect(page.locator('text=TKT-2026-001')).toBeVisible();
    await expect(page.locator('text=24-48 hours')).toBeVisible();
  });
  
  test('property manager assigns technician', async ({ page }) => {
    // Mock open maintenance requests
    await mockApiResponse(page, '**/api/maintenance/open-requests*', {
      requests: [
        {
          id: 'mr-456',
          tenantName: 'Jane Tenant',
          propertyAddress: '456 Oak Ave',
          issueTitle: 'Broken Heater',
          category: 'HVAC',
          priority: 'high',
          submitted: '2026-06-14T10:30:00Z',
          status: 'pending_assignment'
        }
      ]
    });
    
    // Mock available technicians
    await mockApiResponse(page, '**/api/technicians/available*', {
      technicians: [
        { id: 'tech-1', name: 'Mike HVAC', specialty: 'HVAC', rating: 4.8 },
        { id: 'tech-2', name: 'Sarah Electric', specialty: 'Electrical', rating: 4.9 }
      ]
    });
    
    // Mock assignment
    await mockApiResponse(page, '**/api/maintenance/mr-456/assign*', {
      assigned: true,
      technicianId: 'tech-1',
      technicianName: 'Mike HVAC',
      estimatedArrival: '2026-06-15T14:00:00Z'
    });
    
    // Login as property manager
    await loginAs(page, 'propertyManager');
    
    // Navigate to maintenance dispatch
    await page.click('[data-testid="nav-maintenance-dispatch"]');
    await expect(page.locator('text=Maintenance Dispatch')).toBeVisible();
    
    // View open requests
    await expect(page.locator('text=Broken Heater')).toBeVisible();
    await expect(page.locator('text=Jane Tenant')).toBeVisible();
    
    // Assign technician
    await page.click('[data-testid="assign-mr-456"]');
    await expect(page.locator('text=Assign Technician')).toBeVisible();
    
    // Select technician
    await page.click('[data-testid="select-tech-1"]');
    await page.fill('[data-testid="notes"]', 'Tenant reports no heat, check furnace and thermostat');
    
    // Confirm assignment
    await page.click('[data-testid="confirm-assignment"]');
    
    // Should show assignment confirmation
    await expect(page.locator('text=Assigned to Mike HVAC')).toBeVisible();
    await expect(page.locator('text=Estimated arrival: 2:00 PM')).toBeVisible();
  });
  
  test('technician updates request status', async ({ page }) => {
    // Mock technician's assigned jobs
    await mockApiResponse(page, '**/api/technician/assigned-jobs*', {
      jobs: [
        {
          requestId: 'mr-789',
          tenantName: 'Bob Resident',
          address: '789 Pine St',
          issue: 'Leaky Faucet',
          priority: 'medium',
          accessInstructions: 'Key under mat'
        }
      ]
    });
    
    // Mock status update
    await mockApiResponse(page, '**/api/maintenance/mr-789/status*', {
      updated: true,
      status: 'in_progress',
      estimatedCompletion: '1 hour'
    });
    
    // Mock completion
    await mockApiResponse(page, '**/api/maintenance/mr-789/complete*', {
      completed: true,
      completionTime: '45 minutes',
      partsUsed: ['washer', 'o-ring'],
      cost: 8500 // $85 in cents
    });
    
    // Login as technician (simulated)
    await page.goto('http://localhost:3000/technician/login');
    await page.fill('[data-testid="tech-email"]', 'tech@example.com');
    await page.fill('[data-testid="tech-password"]', 'tech123');
    await page.click('[data-testid="tech-login"]');
    
    // View assigned jobs
    await expect(page.locator('text=Assigned Jobs')).toBeVisible();
    await expect(page.locator('text=Leaky Faucet')).toBeVisible();
    
    // Start job
    await page.click('[data-testid="start-job-mr-789"]');
    await expect(page.locator('text=Job Started')).toBeVisible();
    await expect(page.locator('text=Status: In Progress')).toBeVisible();
    
    // Add notes
    await page.click('[data-testid="add-notes"]');
    await page.fill('[data-testid="notes-text"]', 'Replaced washer and o-ring, tested - no leaks');
    await page.click('[data-testid="save-notes"]');
    
    // Complete job
    await page.click('[data-testid="complete-job"]');
    
    // Fill completion details
    await page.fill('[data-testid="completion-time"]', '45');
    await page.fill('[data-testid="parts-used"]', 'washer, o-ring');
    await page.fill('[data-testid="cost"]', '85');
    
    await page.click('[data-testid="submit-completion"]');
    
    // Should show completion confirmation
    await expect(page.locator('text=Job Completed')).toBeVisible();
    await expect(page.locator('text=Total: $85.00')).toBeVisible();
  });
  
  test('tenant tracks request status in real-time', async ({ page }) => {
    // Mock request with status updates
    await mockApiResponse(page, '**/api/maintenance/requests/mr-999*', {
      request: {
        id: 'mr-999',
        ticketNumber: 'TKT-2026-999',
        issueTitle: 'Broken Window',
        status: 'assigned',
        statusHistory: [
          { status: 'submitted', timestamp: '2026-06-15T09:00:00Z', by: 'Tenant' },
          { status: 'reviewed', timestamp: '2026-06-15T09:30:00Z', by: 'Manager' },
          { status: 'assigned', timestamp: '2026-06-15T10:00:00Z', by: 'Manager' }
        ],
        technician: { name: 'Window Specialist', eta: '2026-06-15T13:00:00Z' }
      }
    });
    
    await loginAs(page, 'tenant');
    
    // Navigate to request tracking
    await page.click('[data-testid="nav-my-requests"]');
    await expect(page.locator('text=My Requests')).toBeVisible();
    
    // View request details
    await page.click('[data-testid="view-request-mr-999"]');
    await expect(page.locator('text=Broken Window')).toBeVisible();
    
    // Should show status timeline
    await expect(page.locator('text=Status Timeline')).toBeVisible();
    await expect(page.locator('text=Submitted')).toBeVisible();
    await expect(page.locator('text=Reviewed')).toBeVisible();
    await expect(page.locator('text=Assigned')).toBeVisible();
    
    // Should show technician info
    await expect(page.locator('text=Window Specialist')).toBeVisible();
    await expect(page.locator('text=ETA: 1:00 PM')).toBeVisible();
    
    // Real-time updates (mock)
    await page.evaluate(() => {
      // Simulate status update
      const event = new CustomEvent('maintenance:update', {
        detail: { 
          requestId: 'mr-999', 
          status: 'in_progress',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    });
    
    // Should show updated status
    await expect(page.locator('text=In Progress')).toBeVisible();
  });
});

test.describe('Mobile Maintenance Experience', () => {
  test('mobile maintenance request submission', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await mockApiResponse(page, '**/api/maintenance/categories*', {
      categories: [{ id: 'mobile-cat', name: 'Urgent Repair' }]
    });
    
    await loginAs(page, 'tenant');
    
    // Mobile maintenance navigation
    await page.click('[data-testid="mobile-nav-maintenance"]');
    await expect(page.locator('text=Maintenance')).toBeVisible();
    
    // Mobile-optimized request form
    await page.click('[data-testid="mobile-new-request"]');
    await expect(page.locator('[data-testid="mobile-request-form"]')).toBeVisible();
    
    // Mobile photo upload
    await page.click('[data-testid="mobile-camera-upload"]');
    await page.setInputFiles('input[type="file"]', {
      name: 'mobile-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mobile photo')
    });
    
    // Mobile geolocation
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition = (success) => {
        success({ coords: { latitude: 37.7749, longitude: -122.4194 } });
      };
    });
    
    await page.click('[data-testid="mobile-location-share"]');
  });
});