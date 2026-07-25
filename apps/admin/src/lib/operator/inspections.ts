import { apiRequest } from '@/lib/operator/api/client';

export async function fetchInspection(id: number) {
  return apiRequest<any>('get', (`/api/inspections/${id}` as unknown) as any);
}

export async function startInspection(id: number) {
  return apiRequest<any>('post', '/api/inspections/start', { body: { inspectionId: id } });
}

export async function completeInspection(id: number) {
  return apiRequest<any>('put', (`/api/inspections/${id}/complete` as unknown) as any);
}

export async function createInspection(body: any) {
  return apiRequest<any>('post', '/api/inspections' as any, { body });
}
