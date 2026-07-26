import { apiRequest } from './api/client';

export async function fetchCapexSummary() {
  return apiRequest<any>('get', '/api/capex/summary' as any);
}

export async function fetchCapexForecasts() {
  return apiRequest<any>('get', '/api/capex/forecasts' as any);
}

export async function createCapexForecast(body: any) {
  return apiRequest<any>('post', '/api/capex/forecasts' as any, { body });
}

export async function approveCapexForecast(id: string) {
  return apiRequest<any>('post', `/api/capex/forecasts/${id}/approve` as any);
}

export async function completeCapexForecast(id: string) {
  return apiRequest<any>('post', `/api/capex/forecasts/${id}/complete` as any);
}

export async function generateCapexForecast(propertyId: string) {
  return apiRequest<any>('post', `/api/capex/generate/${propertyId}` as any);
}
