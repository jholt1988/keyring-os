import { apiRequest } from './api/client';

export async function fetchVendors() { return apiRequest<any>('get', '/api/vendors' as any); }
export async function createVendor(body: any) { return apiRequest<any>('post', '/api/vendors' as any, { body }); }
export async function getVendors1099ExportUrl() { return apiRequest<any>('get', '/api/vendors/1099/export-url' as any); }
