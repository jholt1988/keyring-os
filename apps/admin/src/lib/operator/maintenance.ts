import { apiRequest } from './api/client';

export async function createMaintenanceRequest(body: any) { return apiRequest<any>('post', '/api/maintenance/requests' as any, { body }); }
export async function assignVendor(requestId: string, vendorId: string) { return apiRequest<any>('post', `/api/maintenance/${requestId}/assign` as any, { body: { vendorId } }); }
export async function notifyTenantMaintenance(requestId: string) { return apiRequest<any>('post', `/api/maintenance/${requestId}/notify-tenant` as any); }
