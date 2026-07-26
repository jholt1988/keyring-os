import { apiRequest } from './api/client';

export async function fetchSecurityEvents(params?: any) { return apiRequest<any>('get', '/api/security/events' as any, { query: params }); }
