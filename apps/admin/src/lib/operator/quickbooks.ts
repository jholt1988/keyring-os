import { apiRequest } from './api/client';

export async function disconnectQuickBooks() { return apiRequest<any>('post', '/api/integrations/quickbooks/disconnect' as any); }
export async function fetchAccountingSyncStatus() { return apiRequest<any>('get', '/api/integrations/quickbooks/sync-status' as any); }
export async function fetchQuickBooksStatus() { return apiRequest<any>('get', '/api/integrations/quickbooks/status' as any); }
export async function getQuickBooksAuthUrl() { return apiRequest<any>('get', '/api/integrations/quickbooks/auth-url' as any); }
export async function syncQuickBooks() { return apiRequest<any>('post', '/api/integrations/quickbooks/sync' as any); }
export async function testQuickBooksConnection() { return apiRequest<any>('post', '/api/integrations/quickbooks/test' as any); }
