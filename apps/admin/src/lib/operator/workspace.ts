import { apiRequest } from './api/client';

export async function fetchPaymentsWorkspace() { return apiRequest<any>('get', '/api/workspace/payments' as any); }
export async function fetchLeasingWorkspace() { return apiRequest<any>('get', '/api/workspace/leasing' as any); }
export async function fetchRepairsWorkspace() { return apiRequest<any>('get', '/api/workspace/repairs' as any); }
export async function fetchRenewalsWorkspace() { return apiRequest<any>('get', '/api/workspace/renewals' as any); }
export async function fetchScreeningWorkspace() { return apiRequest<any>('get', '/api/workspace/screening' as any); }
export async function fetchFinancialsWorkspace() { return apiRequest<any>('get', '/api/workspace/financials' as any); }
export async function fetchTenants(params?: any) { return apiRequest<any>('get', '/api/tenants' as any, { query: params }); }
export async function fetchTenantWorkspace(id: string) { return apiRequest<any>('get', `/api/tenants/${id}/workspace` as any); }
export async function fetchTenantActivity(id: string) { return apiRequest<any>('get', `/api/tenants/${id}/activity` as any); }
