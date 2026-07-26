import { apiRequest } from './api/client';

export async function fetchTenantProfile(id: string) { return apiRequest<any>('get', `/api/tenants/${id}` as any); }
export async function updateTenantProfile(id: string, body: any) { return apiRequest<any>('put', `/api/tenants/${id}` as any, { body }); }
export async function createConversation(body: any) { return apiRequest<any>('post', '/api/messaging/conversations' as any, { body }); }
export async function recordLeaseNotice(body: any) { return apiRequest<any>('post', '/api/leases/notices' as any, { body }); }
export async function createMaintenanceRequest(body: any) { return apiRequest<any>('post', '/api/maintenance/requests' as any, { body }); }
