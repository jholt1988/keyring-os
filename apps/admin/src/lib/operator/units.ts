import { apiRequest } from './api/client';

export async function fetchUnitWorkspace(id: string, unitId: string) { return apiRequest<any>('get', `/api/properties/${id}/units/${unitId}/workspace` as any); }
export async function transitionUnitState(unitId: string, state: string) { return apiRequest<any>('post', `/api/units/${unitId}/transition` as any, { body: { state } }); }
export async function fetchUnitLedger(leaseId: string) { return apiRequest<any>('get', `/api/leases/${leaseId}/ledger` as any); }
export async function fetchUnitRepairs(unitId: string) { return apiRequest<any>('get', `/api/units/${unitId}/repairs` as any); }
export async function updateUnit(propertyId: string, unitId: string, body: any) { return apiRequest<any>('put', `/api/properties/${propertyId}/units/${unitId}` as any, { body }); }
