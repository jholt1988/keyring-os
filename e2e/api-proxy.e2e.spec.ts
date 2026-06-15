import { expect, test } from '@playwright/test';

test('proxy login sets auth cookies and /auth/me succeeds with session', async ({ request }) => {
  const login = await request.post('/api/v2/auth/login', {
    data: { username: 'admin', password: 'password123' },
  });
  expect(login.ok()).toBeTruthy();

  const setCookie = login.headers()['set-cookie'] ?? '';
  expect(setCookie).toContain('auth_token=');
  expect(setCookie).toContain('refresh_token=');
  expect(setCookie).toContain('user_role=ADMIN');

  const me = await request.get('/api/v2/auth/me');
  expect(me.ok()).toBeTruthy();
  await expect(me.json()).resolves.toMatchObject({
    user: { username: 'admin', roles: ['ADMIN'] },
  });
});
