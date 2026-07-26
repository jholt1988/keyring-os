import { apiRequest } from './api/client';

export async function allocateMasterBill(body: any) { return apiRequest<any>('post', '/api/utility/allocate' as any, { body }); }
export async function recordMasterBill(body: any) { return apiRequest<any>('post', '/api/utility/master-bills' as any, { body }); }
