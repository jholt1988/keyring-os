import { apiRequest } from './api/client';

export async function fetchReportHeatmap() { return apiRequest<any>('get', '/api/reports/heatmap' as any); }
export async function fetchCapexAnalytics() { return apiRequest<any>('get', '/api/reports/capex' as any); }
export async function fetchPaymentHistory() { return apiRequest<any>('get', '/api/reports/payments' as any); }
export async function fetchManualPaymentsSummary() { return apiRequest<any>('get', '/api/reports/manual-payments-summary' as any); }
export async function fetchOpexAnomalies() { return apiRequest<any>('get', '/api/reports/opex-anomalies' as any); }
