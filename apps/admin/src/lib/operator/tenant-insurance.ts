import { apiRequest } from './api/client';

export async function fetchTenantInsurance(tenantId?: string) { return apiRequest<any>('get', `/api/tenants/${tenantId}/insurance` as any); }
export async function recordTenantInsurance(tenantOrLeaseId: any, body?: any) {
	if (typeof tenantOrLeaseId === 'string') {
		return apiRequest<any>('post', `/api/tenants/${tenantOrLeaseId}/insurance` as any, { body });
	}
	return apiRequest<any>('post', '/api/tenants/insurance' as any, { body: tenantOrLeaseId });
}
