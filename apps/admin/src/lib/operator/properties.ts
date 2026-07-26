import { apiRequest } from './api/client';

export async function fetchPropertyWorkspace(propertyId: string) { return apiRequest<any>('get', `/api/properties/${propertyId}/workspace` as any); }
export async function fetchPropertyRepairs(propertyId: string) { return apiRequest<any>('get', `/api/properties/${propertyId}/repairs` as any); }
