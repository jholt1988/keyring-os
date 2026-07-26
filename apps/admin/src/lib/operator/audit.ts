import { apiRequest } from './api/client';

export async function fetchAuditLogs(params?: any) {
  return apiRequest<any>('get', '/api/audit/logs' as any, { query: params });
}
