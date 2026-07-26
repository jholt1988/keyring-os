import { apiRequest } from './api/client';

export async function approveEstimate(id: string) { return apiRequest<any>('post', `/api/estimates/${id}/approve` as any); }
export async function rejectEstimate(id: string) { return apiRequest<any>('post', `/api/estimates/${id}/reject` as any); }
