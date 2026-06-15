# UI/UX Test Suite for Property Pulse

This directory contains Playwright-based UI/UX tests for the Property Pulse platform.

## Test Structure

```
tests/
├── auth-flow.spec.ts           # A-03 auth flow bug reproduction
├── payment-workflow.spec.ts     # Payment/delinquency workflows
├── test-utils.ts               # Shared test utilities
└── README.md                   # This file
```

## Running Tests

### Prerequisites
1. Ensure backend services are running (pms-master)
2. Install dependencies: `npm install`
3. Install Playwright browsers: `npm run test:e2e:install`

### Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e:auth
npm run test:e2e:payments

# Run with UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Generate HTML report
npm run test:e2e:report
```

## Test Scenarios

### 1. Authentication Flow (A-03 Priority)
- ✅ Tenant login redirects to dashboard (not stuck on `/login`)
- ✅ Admin login shows admin dashboard
- ✅ Invalid credentials show error message
- ✅ Form validation works
- ✅ Mobile responsive login

### 2. Payment Processing Workflow
- ✅ Tenant can view and pay invoices
- ✅ Delinquency queue shows in admin dashboard
- ✅ Payment history displays ledger entries
- ✅ Mobile payment experience

### 3. Upcoming Test Scenarios (To Implement)
- Lease application → approval → signing workflow
- Maintenance request submission → assignment → resolution
- Property manager onboarding
- Reporting dashboard navigation

## Mock Data & API Stubbing

Tests use `mockApiResponse()` utility to stub API calls. This allows testing UI flows without requiring a fully deployed backend.

Example:
```typescript
await mockApiResponse(page, '**/api/payments/invoices*', {
  invoices: [{
    id: 'inv-123',
    amountDue: 150000,
    status: 'pending'
  }]
});
```

## Test Users

Predefined test users in `test-utils.ts`:
- `tenant`: Test tenant with basic access
- `admin`: System administrator
- `propertyManager`: Property manager role

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automatic browser installation
- HTML reports on failure
- Parallel test execution

## Accessibility Testing

To be integrated with axe-core for WCAG compliance validation.

## Contributing

1. Add new test files for distinct user journeys
2. Use test utilities for common operations
3. Include mobile viewport tests where applicable
4. Document mock data requirements