import { apiRequest } from './api/client';

export async function bulkExtractLeases(body?: any) { return apiRequest<any>('post', '/api/leases/abstraction/bulk' as any, { body }); }
export async function extractLease(id: string) { return apiRequest<any>('post', `/api/leases/${id}/extract` as any); }
export async function uploadLeaseForExtraction(form: FormData) {
	const res = await fetch('/api/backend/leases/abstraction/upload', { method: 'POST', body: form });
	return res.json();
}
export async function fetchLeaseAbstractionAnalytics() { return apiRequest<any>('get', '/api/leases/abstraction/analytics' as any); }
export async function fetchLeaseAbstractions() { return apiRequest<any>('get', '/api/leases/abstraction' as any); }
export async function reviewLeaseAbstraction(id: string, body?: any) { return apiRequest<any>('post', `/api/leases/abstraction/${id}/review` as any, { body }); }
