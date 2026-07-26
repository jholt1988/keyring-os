import { apiRequest } from '@/lib/operator/api/client';

export async function fetchEsignEnvelopes() {
  return apiRequest<any[]>('get', '/api/esignature/risk-queue');
}

export async function voidEnvelope(id: string) {
  return apiRequest<any>('patch', (`/api/esignature/envelopes/${id}/void` as unknown) as any);
}

export async function resendEnvelope(id: string) {
  return apiRequest<any>('post', (`/api/esignature/envelopes/${id}/resend` as unknown) as any);
}

export function getSignedDocUrl(id: string) {
  return `/api/backend/esignature/envelopes/${id}/documents/signed`;
}
