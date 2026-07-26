import { apiRequest } from './api/client';

export async function fetchBriefing() {
  return apiRequest<any>('get', '/api/briefing' as any);
}

export async function executeDecisionAction(endpoint: string, method: string, body?: any) {
  return apiRequest<any>(method as any, endpoint as any, { body } as any);
}
