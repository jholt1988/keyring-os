import { Page } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
  role: 'admin' | 'property_manager' | 'technician';
  name?: string;
}

export const testUsers: Record<string, TestUser> = {
  admin: {
    username: 'admin',
    password: 'AdminPassword123!',
    role: 'admin',
    name: 'System Administrator'
  },
  propertyManager: {
    username: 'pm1',
    password: 'ManagerPassword123!',
    role: 'property_manager',
    name: 'Property Manager'
  },
  technician: {
    username: 'tech1',
    password: 'TechPassword123!',
    role: 'technician',
    name: 'Maintenance Technician'
  }
};

export async function loginAs(page: Page, userType: keyof typeof testUsers): Promise<void> {
  const user = testUsers[userType];
  
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[placeholder="admin"]', user.username);
  await page.fill('input[type="password"]', user.password);
  
  // Mock successful login response
  await page.route('**/api/v2/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: `mock-token-${user.username}`,
        user: {
          id: `user-${user.username}`,
          username: user.username,
          roles: [user.role]
        }
      })
    });
  });
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to daily brief
  await page.waitForURL('http://localhost:3000/');
}

export async function mockApiResponse(page: Page, urlPattern: string, response: any): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

export async function createTestData(page: Page, endpoint: string, data: any): Promise<void> {
  await page.evaluate(async ({ endpoint, data }) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }, { endpoint, data });
}

export function generateTestLease() {
  return {
    propertyId: `property-${Date.now()}`,
    tenantId: `tenant-${Date.now()}`,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyRent: 150000, // $1500 in cents
    securityDeposit: 300000 // $3000 in cents
  };
}

export function generateTestPayment() {
  return {
    leaseId: `lease-${Date.now()}`,
    amount: 150000, // $1500 in cents
    dueDate: new Date().toISOString(),
    status: 'pending'
  };
}