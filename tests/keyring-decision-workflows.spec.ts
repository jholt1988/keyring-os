import { test, expect } from '@playwright/test';
import { loginAs, mockApiResponse } from './test-utils';

test.describe('Keyring OS Admin - Decision Workflows', () => {
  test('tenant application approval/denial workflow', async ({ page }) => {
    // Mock pending applications
    await mockApiResponse(page, '**/api/screening/pending*', {
      applications: [
        {
          id: 'app-2024-001',
          applicantName: 'David Chen',
          email: 'david@example.com',
          property: 'Sunset Apartments',
          unit: '5A',
          income: 85000,
          creditScore: 720,
          criminalBackground: 'clear',
          status: 'pending_review',
          submittedDate: '2026-06-14'
        },
        {
          id: 'app-2024-002',
          applicantName: 'Maria Garcia',
          email: 'maria@example.com',
          property: 'Oakwood Manor',
          unit: '3B',
          income: 65000,
          creditScore: 680,
          criminalBackground: 'clear',
          status: 'pending_review',
          submittedDate: '2026-06-13'
        }
      ]
    });
    
    // Mock approval response
    await mockApiResponse(page, '**/api/screening/app-2024-001/approve*', {
      approved: true,
      leaseId: 'lease-2024-001',
      nextSteps: ['Generate lease document', 'Schedule move-in'],
      approvedBy: 'Admin User',
      approvedAt: new Date().toISOString()
    });
    
    // Mock denial response
    await mockApiResponse(page, '**/api/screening/app-2024-002/deny*', {
      denied: true,
      reasonCode: 'INCOME_INSUFFICIENT',
      reasonExplanation: 'Income below 3x monthly rent requirement',
      deniedBy: 'Admin User',
      deniedAt: new Date().toISOString(),
      appealDeadline: '2026-06-30'
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to screening dashboard
    await page.click('nav >> text=Screening');
    await expect(page).toHaveURL(/screening/);
    
    // Should see pending applications
    await expect(page.locator('text=Pending Applications')).toBeVisible();
    await expect(page.locator('text=David Chen')).toBeVisible();
    await expect(page.locator('text=Maria Garcia')).toBeVisible();
    
    // View first application details
    await page.click('text=David Chen');
    await expect(page.locator('text=Application Review')).toBeVisible();
    await expect(page.locator('text=Credit Score: 720')).toBeVisible();
    await expect(page.locator('text=Income: $85,000')).toBeVisible();
    
    // Decision interface should be visible
    await expect(page.locator('text=Make Decision')).toBeVisible();
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Deny")')).toBeVisible();
    
    // APPROVE workflow
    await page.click('button:has-text("Approve")');
    
    // Should show approval confirmation modal
    await expect(page.locator('text=Confirm Approval')).toBeVisible();
    
    // Add approval notes
    await page.fill('textarea[placeholder="Approval notes"]', 'Good credit history, stable employment');
    
    // Confirm approval
    await page.click('button:has-text("Confirm Approval")');
    
    // Should show approval success
    await expect(page.locator('text=Application Approved')).toBeVisible();
    await expect(page.locator('text=Lease document generated')).toBeVisible();
    
    // Return to screening dashboard
    await page.click('text=Back to Applications');
    
    // DENY workflow
    await page.click('text=Maria Garcia');
    await page.click('button:has-text("Deny")');
    
    // Should show denial reason selection
    await expect(page.locator('text=Select Denial Reason')).toBeVisible();
    
    // Select denial reason
    await page.click('text=Income insufficient');
    
    // Add custom explanation
    await page.fill('textarea[placeholder="Additional explanation"]', 
      'Monthly income $5,416, required $7,500 for $2,500 rent');
    
    // Check compliance acknowledgment
    await page.check('input[type="checkbox"]:has-text("I acknowledge fair housing compliance")');
    
    // Confirm denial
    await page.click('button:has-text("Submit Denial")');
    
    // Should show denial confirmation
    await expect(page.locator('text=Application Denied')).toBeVisible();
    await expect(page.locator('text=INCOME_INSUFFICIENT')).toBeVisible();
    await expect(page.locator('text=Appeal deadline: Jun 30, 2026')).toBeVisible();
  });
  
  test('payment decision workflow (approve/void/refund)', async ({ page }) => {
    // Mock pending payment decisions
    await mockApiResponse(page, '**/api/payments/pending-decisions*', {
      payments: [
        {
          id: 'pay-001',
          tenantName: 'John Smith',
          amount: 150000,
          paymentMethod: 'check',
          checkNumber: '1024',
          submittedDate: '2026-06-15',
          status: 'pending_approval',
          notes: 'Rent payment for June'
        },
        {
          id: 'pay-002',
          tenantName: 'Jane Doe',
          amount: -50000,
          paymentMethod: 'refund_request',
          reason: 'Overpayment from May',
          submittedDate: '2026-06-14',
          status: 'pending_approval'
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to payment decisions
    await page.click('nav >> text=Payments');
    await page.click('text=Payment Decisions');
    
    await expect(page.locator('text=Payment Decision Queue')).toBeVisible();
    await expect(page.locator('text=John Smith - $1,500')).toBeVisible();
    await expect(page.locator('text=Jane Doe - Refund $500')).toBeVisible();
    
    // View payment details
    await page.click('text=John Smith');
    await expect(page.locator('text=Payment Details')).toBeVisible();
    await expect(page.locator('text=Check #1024')).toBeVisible();
    
    // Payment decision interface
    await expect(page.locator('button:has-text("Approve Payment")')).toBeVisible();
    await expect(page.locator('button:has-text("Void Payment")')).toBeVisible();
    await expect(page.locator('button:has-text("Request Clarification")')).toBeVisible();
    
    // Mock approval
    await mockApiResponse(page, '**/api/payments/pay-001/approve*', {
      approved: true,
      postedToLedger: true,
      ledgerTransactionId: 'ledger-001',
      balanceUpdated: true
    });
    
    // APPROVE payment
    await page.click('button:has-text("Approve Payment")');
    
    // Should show approval confirmation
    await expect(page.locator('text=Payment Approved')).toBeVisible();
    await expect(page.locator('text=Posted to ledger')).toBeVisible();
    
    // Back to queue
    await page.click('text=Next Payment');
    
    // REFUND decision workflow
    await page.click('text=Jane Doe');
    await expect(page.locator('text=Refund Request')).toBeVisible();
    
    // Mock refund approval
    await mockApiResponse(page, '**/api/payments/pay-002/approve-refund*', {
      refundApproved: true,
      refundMethod: 'original_payment',
      estimatedProcessing: '3-5 business days',
      confirmationNumber: 'REF-2024-001'
    });
    
    // Approve refund
    await page.click('button:has-text("Approve Refund")');
    
    // Select refund method
    await page.click('text=Original payment method');
    
    // Confirm refund
    await page.click('button:has-text("Confirm Refund")');
    
    // Should show refund approval
    await expect(page.locator('text=Refund Approved')).toBeVisible();
    await expect(page.locator('text=REF-2024-001')).toBeVisible();
  });
  
  test('maintenance estimate approval workflow', async ({ page }) => {
    // Mock maintenance estimates needing approval
    await mockApiResponse(page, '**/api/maintenance/estimates/pending*', {
      estimates: [
        {
          id: 'est-001',
          requestId: 'mr-456',
          tenantName: 'Robert Wilson',
          issue: 'Water heater replacement',
          technician: 'ABC Plumbing',
          estimateAmount: 225000,
          breakdown: [
            { item: 'New water heater', cost: 180000 },
            { item: 'Installation labor', cost: 35000 },
            { item: 'Disposal fee', cost: 10000 }
          ],
          urgency: 'high',
          submitted: '2026-06-15'
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to maintenance estimates
    await page.click('nav >> text=Maintenance');
    await page.click('text=Estimates');
    
    await expect(page.locator('text=Pending Estimates')).toBeVisible();
    await expect(page.locator('text=Water heater replacement')).toBeVisible();
    await expect(page.locator('text=$2,250')).toBeVisible();
    
    // View estimate details
    await page.click('text=Robert Wilson');
    await expect(page.locator('text=Estimate Review')).toBeVisible();
    
    // Should see estimate breakdown
    await expect(page.locator('text=New water heater - $1,800')).toBeVisible();
    await expect(page.locator('text=Installation labor - $350')).toBeVisible();
    
    // Decision options
    await expect(page.locator('button:has-text("Approve Estimate")')).toBeVisible();
    await expect(page.locator('button:has-text("Request Bid")')).toBeVisible();
    await expect(page.locator('button:has-text("Deny Estimate")')).toBeVisible();
    
    // Mock approval
    await mockApiResponse(page, '**/api/maintenance/estimates/est-001/approve*', {
      approved: true,
      poNumber: 'PO-2024-456',
      authorizedAmount: 225000,
      approvalNotes: 'Emergency replacement approved'
    });
    
    // APPROVE with notes
    await page.click('button:has-text("Approve Estimate")');
    
    // Fill approval form
    await page.fill('textarea[placeholder="Approval notes"]', 'Emergency approval - tenant has no hot water');
    await page.fill('input[placeholder="PO Number"]', 'PO-2024-456');
    
    await page.click('button:has-text("Submit Approval")');
    
    // Should show approval confirmation
    await expect(page.locator('text=Estimate Approved')).toBeVisible();
    await expect(page.locator('text=PO-2024-456')).toBeVisible();
    
    // Should trigger work order creation
    await expect(page.locator('text=Work order created')).toBeVisible();
  });
  
  test('attorney referral decision workflow', async ({ page }) => {
    // Mock attorney referral recommendations
    await mockApiResponse(page, '**/api/legal/referral-recommendations*', {
      recommendations: [
        {
          id: 'ref-rec-001',
          tenantName: 'Delinquent Tenant',
          property: 'Sunset Apartments',
          daysDelinquent: 90,
          amountDelinquent: 450000,
          recommendation: 'attorney_referral',
          confidenceScore: 0.92,
          riskFactors: ['Multiple NSF payments', 'No communication', 'History of eviction']
        }
      ]
    });
    
    // Mock attorney firms
    await mockApiResponse(page, '**/api/legal/attorney-firms*', {
      firms: [
        {
          id: 'firm-001',
          name: 'Smith & Associates',
          specialty: 'landlord_tenant',
          successRate: 0.85,
          avgTimeToResolution: 45,
          avgCost: 50000
        },
        {
          id: 'firm-002',
          name: 'Legal Solutions LLC',
          specialty: 'collections',
          successRate: 0.78,
          avgTimeToResolution: 60,
          avgCost: 35000
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to legal/collections
    await page.click('nav >> text=Legal');
    await page.click('text=Referral Recommendations');
    
    await expect(page.locator('text=Attorney Referral Recommendations')).toBeVisible();
    await expect(page.locator('text=Delinquent Tenant')).toBeVisible();
    await expect(page.locator('text=90 days delinquent')).toBeVisible();
    await expect(page.locator('text=Confidence: 92%')).toBeVisible();
    
    // View recommendation details
    await page.click('text=Review Recommendation');
    await expect(page.locator('text=Referral Analysis')).toBeVisible();
    
    // Should show risk factors
    await expect(page.locator('text=Multiple NSF payments')).toBeVisible();
    await expect(page.locator('text=No communication')).toBeVisible();
    
    // Decision interface
    await expect(page.locator('button:has-text("Accept Recommendation")')).toBeVisible();
    await expect(page.locator('button:has-text("Reject Recommendation")')).toBeVisible();
    await expect(page.locator('button:has-text("Defer Decision")')).toBeVisible();
    
    // Mock acceptance
    await mockApiResponse(page, '**/api/legal/recommendations/ref-rec-001/accept*', {
      accepted: true,
      attorneyFirmId: 'firm-001',
      estimatedCost: 50000,
      referralId: 'att-ref-2024-001',
      nextSteps: ['Attorney will contact within 48 hours']
    });
    
    // ACCEPT recommendation
    await page.click('button:has-text("Accept Recommendation")');
    
    // Select attorney firm
    await page.click('text=Smith & Associates');
    
    // Review and confirm
    await expect(page.locator('text=Review Referral Details')).toBeVisible();
    await expect(page.locator('text=Estimated cost: $500')).toBeVisible();
    
    await page.click('button:has-text("Confirm Referral")');
    
    // Should show referral confirmation
    await expect(page.locator('text=Referral Accepted')).toBeVisible();
    await expect(page.locator('text=att-ref-2024-001')).toBeVisible();
    await expect(page.locator('text=Attorney will contact within 48 hours')).toBeVisible();
  });
});

test.describe('Keyring OS Admin - Action Workflows', () => {
  test('bulk action workflow (multiple selections)', async ({ page }) => {
    // Mock multiple items for bulk action
    await mockApiResponse(page, '**/api/tenants*', {
      tenants: [
        { id: 't1', name: 'Tenant A', balance: 0, selected: false },
        { id: 't2', name: 'Tenant B', balance: -50000, selected: false },
        { id: 't3', name: 'Tenant C', balance: 150000, selected: false },
        { id: 't4', name: 'Tenant D', balance: 300000, selected: false }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to tenants
    await page.click('nav >> text=Tenants');
    
    // Enable selection mode
    await page.click('button[aria-label="Select multiple"]');
    
    // Select multiple tenants
    await page.check('input[type="checkbox"]:nth-child(1)');
    await page.check('input[type="checkbox"]:nth-child(3)');
    await page.check('input[type="checkbox"]:nth-child(4)');
    
    // Should show bulk action bar
    await expect(page.locator('text=3 items selected')).toBeVisible();
    
    // Bulk action options
    await expect(page.locator('button:has-text("Send Message")')).toBeVisible();
    await expect(page.locator('button:has-text("Export Selected")')).toBeVisible();
    await expect(page.locator('button:has-text("Apply Charge")')).toBeVisible();
    
    // Mock bulk message action
    await mockApiResponse(page, '**/api/tenants/bulk-message*', {
      sent: true,
      recipients: 3,
      messageId: 'bulk-msg-001'
    });
    
    // Send bulk message
    await page.click('button:has-text("Send Message")');
    
    // Compose message
    await expect(page.locator('text=Compose Bulk Message')).toBeVisible();
    await page.fill('textarea[placeholder="Message content"]', 'Monthly rent reminder');
    
    // Select delivery method
    await page.click('text=Email + SMS');
    
    // Send
    await page.click('button:has-text("Send Now")');
    
    // Should show confirmation
    await expect(page.locator('text=Message Sent')).toBeVisible();
    await expect(page.locator('text=3 recipients')).toBeVisible();
  });
  
  test('quick action workflow (radial menu)', async ({ page }) => {
    // Mock property context
    await mockApiResponse(page, '**/api/properties/prop-001*', {
      property: {
        id: 'prop-001',
        name: 'Test Property',
        address: '123 Test St'
      }
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to a property
    await page.goto('http://localhost:3000/properties/prop-001');
    
    // Trigger radial/quick action menu
    await page.click('button[aria-label="Quick actions"]');
    
    // Should show radial menu with actions
    await expect(page.locator('text=Create Work Order')).toBeVisible();
    await expect(page.locator('text=Schedule Inspection')).toBeVisible();
    await expect(page.locator('text=Message Tenants')).toBeVisible();
    await expect(page.locator('text=Generate Report')).toBeVisible();
    
    // Select "Create Work Order"
    await page.click('text=Create Work Order');
    
    // Should open work order form
    await expect(page.locator('text=New Work Order')).toBeVisible();
    
    // Fill work order details
    await page.selectOption('select[name="type"]', 'preventive_maintenance');
    await page.fill('input[name="title"]', 'Quarterly HVAC inspection');
    await page.fill('textarea[name="description"]', 'Standard quarterly maintenance');
    
    // Mock creation
    await mockApiResponse(page, '**/api/work-orders*', {
      created: true,
      workOrderId: 'wo-2024-001',
      assignedTo: 'Tech Team'
    });
    
    // Submit
    await page.click('button:has-text("Create Work Order")');
    
    // Should show creation confirmation
    await expect(page.locator('text=Work Order Created')).toBeVisible();
    await expect(page.locator('text=wo-2024-001')).toBeVisible();
  });
  
  test('multi-step approval workflow', async ({ page }) => {
    // Mock CAPEX request needing multi-level approval
    await mockApiResponse(page, '**/api/capex/pending-approval*', {
      requests: [
        {
          id: 'capex-001',
          project: 'Roof Replacement',
          property: 'Sunset Apartments',
          totalCost: 1250000,
          requestedBy: 'Property Manager',
          currentStep: 'department_approval',
          nextStep: 'finance_approval',
          approvers: [
            { role: 'department_manager', status: 'pending', name: 'Dept Manager' },
            { role: 'finance_director', status: 'pending', name: 'Finance Director' },
            { role: 'coo', status: 'pending', name: 'COO' }
          ]
        }
      ]
    });
    
    await loginAs(page, 'admin');
    
    // Navigate to CAPEX approvals
    await page.click('nav >> text=CAPEX');
    await page.click('text=Approvals');
    
    await expect(page.locator('text=CAPEX Approval Queue')).toBeVisible();
    await expect(page.locator('text=Roof Replacement')).toBeVisible();
    await expect(page.locator('text=$12,500')).toBeVisible();
    
    // View approval workflow
    await page.click('text=Roof Replacement');
    await expect(page.locator('text=Approval Workflow')).toBeVisible();
    
    // Should show approval steps
    await expect(page.locator('text=Department Approval')).toBeVisible();
    await expect(page.locator('text=Finance Approval')).toBeVisible();
    await expect(page.locator('text=COO Approval')).toBeVisible();
    
    // Current user's approval action
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Request Changes")')).toBeVisible();
    await expect(page.locator('button:has-text("Deny")')).toBeVisible();
    
    // Mock approval at current step
    await mockApiResponse(page, '**/api/capex/capex-001/approve*', {
      approved: true,
      approvedBy: 'Department Manager',
      approvedAt: new Date().toISOString(),
      nextStep: 'finance_approval',
      comments: 'Budget approved at department level'
    });
    
    // Approve with comments
    await page.click('button:has-text("Approve")');
    await page.fill('textarea[placeholder="Approval comments"]', 'Budget approved at department level');
    await page.click('button:has-text("Submit Approval")');
    
    // Should show approval confirmation and move to next step
    await expect(page.locator('text=Approval Submitted')).toBeVisible();
    await expect(page.locator('text=Next: Finance Approval')).toBeVisible();
  });
});